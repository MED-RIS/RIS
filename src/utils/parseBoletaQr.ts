// Interpreta el texto crudo decodificado del QR de la boleta física CNS El Alto.
// No se conoce todavía el formato exacto que usa CNS para esa boleta, así que este
// parser solo autocompleta cuando reconoce el contenido con confianza (JSON con
// llaves conocidas, o un número puro que claramente es la cédula). Cualquier otro
// formato se deja sin mapear — el texto crudo siempre se muestra para revisión manual.

const FIELD_ALIASES: Record<string, string[]> = {
  documentId: ['ci', 'cedula', 'cédula', 'documentid', 'nrocedula', 'carnet', 'carnetidentidad'],
  patientId: ['patientid', 'mrn', 'codigo', 'cod'],
  firstName: ['nombres', 'nombre', 'firstname'],
  lastName: ['apellidos', 'apellido', 'lastname'],
  paterno: ['apellidopaterno', 'paterno'],
  materno: ['apellidomaterno', 'materno'],
  dateOfBirth: ['fechanacimiento', 'fecnac', 'nacimiento', 'dob', 'fechadenacimiento'],
  gender: ['sexo', 'genero', 'género', 'gender'],
  // En la boleta CNS "Código Asegurado" es el código de beneficiario (ID, 50, 52…)
  codigoBeneficiario: ['codigobeneficiario', 'beneficiario', 'codigoasegurado', 'codasegurado', 'benef'],
  // N.º de asegurado = matrícula = AVC
  numeroAsegurado: ['numeroasegurado', 'nroasegurado', 'nrodeasegurado', 'asegurado', 'matricula', 'avc'],
  phone: ['telefono', 'teléfono', 'celular', 'phone'],
  // Boleta CNS (formularioExamenComplementario): "Nombre_Paciente" viene en una sola cadena
  nombreCompleto: ['nombrepaciente', 'nombrecompleto'],
};

const normalizeKey = (key: string) =>
  key
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();

const normalizeGender = (value: string): string => {
  const v = value.trim().toLowerCase();
  if (['m', 'masculino', 'male'].includes(v)) return 'M';
  if (['f', 'femenino', 'female'].includes(v)) return 'F';
  return 'U';
};

// Datos de la visita (no del paciente): van a la admisión, no a la ficha
const VISITA_ALIASES: Record<string, string[]> = {
  medico: ['medicosolicitante', 'medico', 'clavemedico', 'clavedelmedico'],
  consultorio: ['consultorio', 'consultoriodeservicio', 'consultorioservicio', 'servicio'],
  fechaSolicitud: ['fechasolicitud', 'fechadesolicitud'],
  edad: ['edad'],
};

export interface ParsedBoleta {
  fields: Record<string, any>;
  visita: Record<string, string>;
  recognized: boolean;
  // El QR es de la boleta CNS pero vino sin los datos del paciente (su sistema lo genera
  // con "undefined" y nombres de campo en vez de valores)
  sinDatos?: boolean;
  raw: string;
}

// "undefined", "null" o un nombre de campo sin reemplazar (parentesco.descripcion_parametro)
// no son datos
const esValorUtil = (v: any) => {
  const t = String(v ?? '').trim();
  return t !== '' && !/\bundefined\b|\bnull\b/i.test(t) && !/^[a-z_]+\.[a-z_]+$/i.test(t);
};

// Saca pares clave/valor de: JSON, un enlace con parámetros (?ci=…&nombres=…) o texto
// "clave: valor" / "clave=valor" separado por líneas, ";" o "|"
function paresDe(texto: string): [string, any][] {
  try {
    const j = JSON.parse(texto);
    if (j && typeof j === 'object' && !Array.isArray(j)) {
      // Se incluyen también los datos anidados (por ejemplo "datos": { ... })
      return Object.entries(j).flatMap(([k, v]) =>
        v && typeof v === 'object' && !Array.isArray(v) ? (Object.entries(v) as [string, any][]) : [[k, v] as [string, any]]
      );
    }
  } catch {
    // no es JSON
  }
  if (/^https?:\/\//i.test(texto)) {
    try {
      return [...new URL(texto).searchParams.entries()];
    } catch {
      return [];
    }
  }
  const pares: [string, any][] = [];
  for (const parte of texto.split(/[\r\n;|&]+/)) {
    const m = parte.match(/^\s*([^:=]{2,40})\s*[:=]\s*(.+?)\s*$/);
    if (m) pares.push([m[1], m[2]]);
  }
  return pares;
}

export function parseBoletaQr(raw: string): ParsedBoleta {
  const trimmed = (raw || '').trim();
  const fields: Record<string, any> = {};
  const visita: Record<string, string> = {};

  // 1) Pares clave/valor reconocibles (JSON, enlace con parámetros o texto "clave: valor").
  {
    const pares = paresDe(trimmed);
    if (pares.length) {
      const normalizedEntries = pares.map(([k, v]) => [normalizeKey(k), v] as const);
      for (const [campo, aliases] of Object.entries(VISITA_ALIASES)) {
        const match = normalizedEntries.find(([k]) => aliases.includes(k));
        if (match && esValorUtil(match[1])) visita[campo] = String(match[1]).trim();
      }
      for (const [targetField, aliases] of Object.entries(FIELD_ALIASES)) {
        const match = normalizedEntries.find(([k]) => aliases.includes(k));
        if (match && esValorUtil(match[1])) {
          fields[targetField] = String(match[1]).trim();
        }
      }
      // Si vinieron apellido paterno/materno separados, se guardan así (como en el
      // formulario) y combinados en lastName.
      if (fields.paterno || fields.materno) {
        fields.apellidoPaterno = String(fields.paterno || '').toUpperCase();
        fields.apellidoMaterno = String(fields.materno || '').toUpperCase();
        fields.lastName = `${fields.paterno || ''} ${fields.materno || ''}`.trim();
        delete fields.paterno;
        delete fields.materno;
      }
      if (fields.numeroAsegurado) fields.numeroAsegurado = String(fields.numeroAsegurado).toUpperCase();
      if (fields.gender) fields.gender = normalizeGender(fields.gender);
      if (fields.nombreCompleto) fields.nombreCompleto = String(fields.nombreCompleto).replace(/\s+/g, ' ').toUpperCase();
      if (Object.keys(fields).length > 0) {
        return { fields, visita, recognized: true, raw: trimmed };
      }
      // Es el QR de la boleta CNS pero no trae nada útil
      if (normalizedEntries.some(([k]) => k === 'reporte' || k === 'entidad')) {
        return { fields: {}, visita, recognized: false, sinDatos: true, raw: trimmed };
      }
    }
  }

  // 2) Si es puramente numérico, asumir que es la cédula de identidad.
  if (/^\d{5,15}$/.test(trimmed)) {
    return { fields: { documentId: trimmed }, visita, recognized: true, raw: trimmed };
  }

  // 3) Formato no reconocido: no adivinar el mapeo de campos para evitar mezclar datos.
  return { fields: {}, visita, recognized: false, raw: trimmed };
}
