// Interpreta el texto crudo decodificado del QR de la boleta física CNS El Alto.
// No se conoce todavía el formato exacto que usa CNS para esa boleta, así que este
// parser solo autocompleta cuando reconoce el contenido con confianza (JSON con
// llaves conocidas, o un número puro que claramente es la cédula). Cualquier otro
// formato se deja sin mapear — el texto crudo siempre se muestra para revisión manual.

const FIELD_ALIASES: Record<string, string[]> = {
  documentId: ['ci', 'cedula', 'cédula', 'documentid', 'nrocedula', 'carnet', 'carnetidentidad'],
  patientId: ['patientid', 'mrn', 'codigo', 'cod', 'matricula', 'matrícula'],
  firstName: ['nombres', 'nombre', 'firstname'],
  lastName: ['apellidos', 'apellido', 'lastname'],
  paterno: ['apellidopaterno', 'paterno'],
  materno: ['apellidomaterno', 'materno'],
  dateOfBirth: ['fechanacimiento', 'fecnac', 'nacimiento', 'dob', 'fechadenacimiento'],
  gender: ['sexo', 'genero', 'género', 'gender'],
  codigoBeneficiario: ['codigobeneficiario', 'beneficiario'],
  numeroAsegurado: ['numeroasegurado', 'nroasegurado', 'asegurado'],
  phone: ['telefono', 'teléfono', 'celular', 'phone'],
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

export interface ParsedBoleta {
  fields: Record<string, any>;
  recognized: boolean;
  raw: string;
}

export function parseBoletaQr(raw: string): ParsedBoleta {
  const trimmed = (raw || '').trim();
  const fields: Record<string, any> = {};

  // 1) Intentar JSON con llaves reconocibles.
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const normalizedEntries = Object.entries(parsed).map(([k, v]) => [normalizeKey(k), v] as const);
      for (const [targetField, aliases] of Object.entries(FIELD_ALIASES)) {
        const match = normalizedEntries.find(([k]) => aliases.includes(k));
        if (match && match[1] != null && String(match[1]).trim() !== '') {
          fields[targetField] = String(match[1]).trim();
        }
      }
      // Si vinieron apellido paterno/materno separados, combinar en lastName.
      if (fields.paterno || fields.materno) {
        fields.lastName = `${fields.paterno || ''} ${fields.materno || ''}`.trim();
        delete fields.paterno;
        delete fields.materno;
      }
      if (fields.gender) fields.gender = normalizeGender(fields.gender);
      if (Object.keys(fields).length > 0) {
        return { fields, recognized: true, raw: trimmed };
      }
    }
  } catch {
    // No era JSON — seguir con los demás intentos.
  }

  // 2) Si es puramente numérico, asumir que es la cédula de identidad.
  if (/^\d{5,15}$/.test(trimmed)) {
    return { fields: { documentId: trimmed }, recognized: true, raw: trimmed };
  }

  // 3) Formato no reconocido: no adivinar el mapeo de campos para evitar mezclar datos.
  return { fields: {}, recognized: false, raw: trimmed };
}
