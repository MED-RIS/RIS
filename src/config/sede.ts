// Configuración por sede del RIS de laboratorio.
// Cada instalación elige su sede con VITE_SEDE en su .env (por defecto: vtunari).
//   vtunari → CNS Villa Tunari (planilla CNS – CVT REGPRG-001, matrícula de asegurado)
//   hcorea  → Hospital Municipal Modelo Corea (formulario de solicitud del hospital, CI)
// Lo común (editor, informes en el servidor, firmas) es igual; aquí solo va lo propio de cada hospital.

export type ExamenProgramable = { id: string; label: string; corto: string };
export type GrupoExamenes = { grupo: string | null; items: ExamenProgramable[] };

export interface ConfigSede {
  id: 'vtunari' | 'hcorea';
  institucion: string; // nombre completo para encabezados impresos
  institucionCorta: string;
  codigoPlanilla: string; // código de la hoja "Registro diario de programación"
  etiquetaId: string; // cómo se identifica al paciente en la preprogramación
  placeholderId: string;
  etiquetaTelefono: string;
  qrBoletaCns: boolean; // la CNS entrega una boleta con QR; Corea no
  camposSolicitud: boolean; // médico solicitante, sala y cama, municipio, diagnóstico
  planillaPorColumnas: boolean; // una columna por examen (pocas) o una lista de exámenes (muchas)
  gruposExamenes: GrupoExamenes[];
}

const VTUNARI: ConfigSede = {
  id: 'vtunari',
  institucion: 'CAJA NACIONAL DE SALUD – VILLA TUNARI',
  institucionCorta: 'CNS',
  codigoPlanilla: 'CNS – CVT REGPRG-001',
  etiquetaId: 'Matrícula',
  placeholderId: 'Ej. 123456ABC',
  etiquetaTelefono: 'Celular',
  qrBoletaCns: true,
  camposSolicitud: false,
  planillaPorColumnas: true,
  gruposExamenes: [
    {
      grupo: 'HEMATO',
      items: [
        { id: 'HTO', label: 'HTO', corto: 'HTO' },
        { id: 'HB', label: 'Hb', corto: 'Hb' },
        { id: 'HEMOGRAMA', label: 'Hemograma', corto: 'Hemogram' },
      ],
    },
    {
      grupo: null,
      items: [
        { id: 'QMC_SANGUINEA', label: 'Química sanguínea', corto: 'QMC sanguínea' },
        { id: 'SEROLOGIA', label: 'Serología', corto: 'Serología' },
        { id: 'EGO', label: 'E.G.O.', corto: 'E.G.O.' },
        { id: 'COPROLOGIA', label: 'Coprología', corto: 'Coprología' },
        { id: 'H_PYLORI_SANGRE_OCULTA', label: 'H. Pylori / Sangre oculta', corto: 'H. Pylori / S. oculta' },
        { id: 'HORMONAS', label: 'Hormonas', corto: 'Hormonas' },
        { id: 'PBAS_TRANSFERENCIA', label: 'Pbas. para transferencia', corto: 'Pbas. transferencia' },
      ],
    },
    {
      grupo: 'PBA RAP COVID-19',
      items: [
        { id: 'COVID_ANTIGENO', label: 'Antígeno', corto: 'Antígeno' },
        { id: 'COVID_ANTICUERPOS', label: 'Anticuerpos', corto: 'Anticuerpos' },
        { id: 'COVID_QUIMIO', label: 'Quimioluminiscencia', corto: 'Quimiolumin.' },
      ],
    },
  ],
};

// Mismas áreas y exámenes del formulario de solicitud de laboratorio del Hospital Corea
const HCOREA: ConfigSede = {
  id: 'hcorea',
  institucion: 'HOSPITAL MUNICIPAL MODELO COREA',
  institucionCorta: 'H. COREA',
  codigoPlanilla: 'H. COREA – LABORATORIO',
  etiquetaId: 'CI',
  placeholderId: 'Ej. 1234567 LP',
  etiquetaTelefono: 'Teléfono',
  qrBoletaCns: false,
  camposSolicitud: true,
  planillaPorColumnas: false,
  gruposExamenes: [
    {
      grupo: 'HEMATOLOGÍA',
      items: [
        { id: 'HEMOGRAMA', label: 'Hemograma completo', corto: 'Hemograma' },
        { id: 'HB_HTO', label: 'Hemoglobina - Hematocrito', corto: 'Hb-Hto' },
        { id: 'GRUPO_RH', label: 'Grupo y factor Rh', corto: 'Grupo Rh' },
        { id: 'COAGULACION_SANGRIA', label: 'Tiempo de coagulación y sangría', corto: 'TC-TS' },
        { id: 'TP', label: 'Tiempo de protrombina', corto: 'TP' },
        { id: 'TTPA', label: 'Tiempo parcial de tromboplastina', corto: 'TTPA' },
        { id: 'PLAQUETAS', label: 'Recuento de plaquetas', corto: 'Plaquetas' },
        { id: 'VES', label: 'VES', corto: 'VES' },
        { id: 'RETICULOCITOS', label: 'Recuento de reticulocitos', corto: 'Reticul.' },
        { id: 'FROTIS', label: 'Frotis de sangre periférica', corto: 'Frotis' },
      ],
    },
    {
      grupo: 'BIOQUÍMICA CLÍNICA',
      items: [
        { id: 'GLICEMIA', label: 'Glicemia basal', corto: 'Glicemia' },
        { id: 'PERFIL_RENAL', label: 'Urea, NUS, creatinina, ácido úrico', corto: 'Renal' },
        { id: 'PERFIL_HEPATICO', label: 'Bilirrubinas, transaminasas, FA, LDH, amilasa, proteínas', corto: 'Hepático' },
        { id: 'PERFIL_LIPIDICO', label: 'Colesterol, HDL-LDL-VLDL, triglicéridos', corto: 'Lipídico' },
        { id: 'ELECTROLITOS', label: 'Electrolitos y calcio', corto: 'Electrolitos' },
        { id: 'GASOMETRIA', label: 'Gasometría', corto: 'Gasometría' },
        { id: 'HBA1C', label: 'Hemoglobina glicosilada', corto: 'HbA1c' },
        { id: 'TOLERANCIA_GLUCOSA', label: 'Prueba de tolerancia a la glucosa', corto: 'PTG' },
        { id: 'PROTEINURIA_24H', label: 'Proteinuria de 24 horas', corto: 'Prot. 24h' },
      ],
    },
    {
      grupo: 'SEROLOGÍA',
      items: [
        { id: 'RPR_SIFILIS', label: 'RPR / VDRL / Sífilis rápida', corto: 'RPR' },
        { id: 'VIH', label: 'VIH prueba rápida', corto: 'VIH' },
        { id: 'ASTO_PCR_FR', label: 'ASTO, PCR, factor reumatoideo', corto: 'ASTO-PCR-FR' },
        { id: 'WIDAL', label: 'Reacción de Widal', corto: 'Widal' },
        { id: 'H_PYLORI', label: 'H. Pylori antígeno fecal', corto: 'H. Pylori' },
        { id: 'PSA', label: 'PSA prueba rápida', corto: 'PSA' },
        { id: 'CHAGAS', label: 'Chagas prueba rápida', corto: 'Chagas' },
        { id: 'EMBARAZO', label: 'Prueba de embarazo', corto: 'Embarazo' },
      ],
    },
    {
      grupo: 'UROLOGÍA Y PARASITOLOGÍA',
      items: [
        { id: 'EGO', label: 'Examen general de orina', corto: 'EGO' },
        { id: 'COPRO_SIMPLE', label: 'Coproparasitológico simple', corto: 'Copro simple' },
        { id: 'COPRO_SERIADO', label: 'Coproparasitológico seriado', corto: 'Copro seriado' },
        { id: 'MOCO_FECAL', label: 'Citología de moco fecal', corto: 'Moco fecal' },
        { id: 'GRAHAM', label: 'Técnica de Graham', corto: 'Graham' },
        { id: 'SANGRE_OCULTA', label: 'Sangre oculta en heces', corto: 'S. oculta' },
      ],
    },
    {
      grupo: 'BACTERIOLOGÍA',
      items: [
        { id: 'BACILOSCOPIA', label: 'Baciloscopía', corto: 'BAAR' },
        { id: 'GRAM_FRESCO', label: 'Tinción de Gram / examen en fresco', corto: 'Gram-Fresco' },
        { id: 'CULTIVO_ANTIBIOGRAMA', label: 'Cultivos y antibiograma', corto: 'Cultivo' },
      ],
    },
    {
      grupo: 'SERVICIO DE TRANSFUSIÓN',
      items: [
        { id: 'PBAS_TRANSFERENCIA', label: 'Coombs directo / indirecto', corto: 'Coombs' },
        { id: 'FIBRINOGENO', label: 'Fibrinógeno', corto: 'Fibrinóg.' },
        { id: 'FERRITINA_TRANSFERRINA', label: 'Ferritina / transferrina', corto: 'Ferritina' },
      ],
    },
    {
      grupo: 'PRUEBAS COVID-19',
      items: [
        { id: 'COVID_ANTICUERPOS', label: 'IgG / IgM prueba rápida', corto: 'IgG-IgM' },
        { id: 'COVID_RT_PCR', label: 'RT-PCR', corto: 'RT-PCR' },
        { id: 'COVID_ANTIGENO', label: 'Antígeno nasal', corto: 'Antígeno' },
      ],
    },
    {
      grupo: 'CITOLOGÍA / PATOLOGÍA',
      items: [{ id: 'CITOLOGIA_PATOLOGIA', label: 'Citológico, Papanicolaou, histopatológico', corto: 'Patología' }],
    },
  ],
};

const SEDES: Record<string, ConfigSede> = { vtunari: VTUNARI, hcorea: HCOREA };
const pedida = String(import.meta.env.VITE_SEDE || 'vtunari').toLowerCase();
export const SEDE: ConfigSede = SEDES[pedida] || VTUNARI;
export const TODOS_EXAMENES = SEDE.gruposExamenes.flatMap((g) => g.items);

// Pantalla inicial: las sedes de laboratorio (las que declaran VITE_SEDE) abren en Preprogramación;
// las instalaciones sin sede declarada (p. ej. imagenología de Unimed) siguen abriendo en Recepción.
export const PESTANA_INICIAL = import.meta.env.VITE_SEDE ? 'preprogramacion' : 'citas';
