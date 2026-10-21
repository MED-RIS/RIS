// Formulario de pacientes con las columnas del Excel del laboratorio (CNS):
// EMERGENCIA, PATERNO, MATERNO, NOMBRES, EDAD, GÉNERO, AVC, BENEF., CONSULTORIO,
// MÉDICO, FECHA SOLICIT., FECHA MUESTRA, FECHA EX. (+ CELULAR).
// AVC es la matrícula de asegurado; EMERGENCIA, CONSULTORIO, MÉDICO y las fechas son
// datos de la visita y se guardan en `ultimaAdmision`.

export const hoyLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const admisionVacia = () => ({
  emergencia: false,
  consultorio: '',
  medico: '',
  fechaSolicitud: '',
  fechaMuestra: hoyLocal(),
  fechaExamen: hoyLocal(),
});

export const pacienteVacio = () => ({
  patientId: '',
  documentId: '',
  firstName: '',
  lastName: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  edad: '' as number | string,
  dateOfBirth: '',
  gender: 'U',
  phone: '',
  email: '',
  address: '',
  codigoBeneficiario: '',
  numeroAsegurado: '',
  admision: admisionVacia(),
});

// "ANA MARIA QUISPE MAMANI" -> nombres ANA MARIA, paterno QUISPE, materno MAMANI
// (así se escribe en la hoja de programación: nombres primero, apellidos al final)
export const separarNombreCompleto = (texto: string) => {
  const p = String(texto || '').trim().split(/\s+/).filter(Boolean);
  if (p.length >= 3) return { nombres: p.slice(0, -2).join(' '), paterno: p[p.length - 2], materno: p[p.length - 1] };
  if (p.length === 2) return { nombres: p[0], paterno: p[1], materno: '' };
  return { nombres: p[0] || '', paterno: '', materno: '' };
};

// Paciente guardado -> datos del formulario (los registros viejos solo tienen lastName)
export const pacienteAFormulario = (data: any) => {
  const [paternoViejo = '', ...resto] = String(data?.lastName || '').trim().split(/\s+/);
  return {
    ...pacienteVacio(),
    ...data,
    apellidoPaterno: data?.apellidoPaterno ?? paternoViejo,
    apellidoMaterno: data?.apellidoMaterno ?? resto.join(' '),
    edad: data?.edad ?? '',
    admision: { ...admisionVacia(), ...(data?.ultimaAdmision || {}) },
  };
};

// Formulario -> lo que se manda al backend
export const formularioAPaciente = (f: any) => {
  const avc = String(f.numeroAsegurado || '').trim().toUpperCase();
  const benef = String(f.codigoBeneficiario || '').trim().toUpperCase();
  const { admision, ...resto } = f;
  return {
    ...resto,
    firstName: String(f.firstName || '').trim().toUpperCase(),
    apellidoPaterno: String(f.apellidoPaterno || '').trim().toUpperCase(),
    apellidoMaterno: String(f.apellidoMaterno || '').trim().toUpperCase(),
    lastName: [f.apellidoPaterno, f.apellidoMaterno].map((x) => String(x || '').trim().toUpperCase()).filter(Boolean).join(' '),
    numeroAsegurado: avc,
    codigoBeneficiario: benef,
    edad: f.edad === '' || f.edad === null || f.edad === undefined ? undefined : Number(f.edad),
    dateOfBirth: f.dateOfBirth || undefined,
    // El titular y sus beneficiarios comparten el AVC: el ID del paciente es AVC + BENEF.
    patientId: f.patientId || (avc ? `MRN-${avc}${benef ? `-${benef}` : ''}` : ''),
    ultimaAdmision: admision,
  };
};
