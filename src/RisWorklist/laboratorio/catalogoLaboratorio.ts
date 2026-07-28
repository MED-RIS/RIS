// Catálogo de parámetros por categoría de laboratorio para el editor nuevo (tabla).
// IMPORTANTE: `key` debe coincidir con las claves de la bolsa de datos que ya usan
// los formularios y los generadores de PDF. Así el editor escribe donde el PDF lee.
//
// `min`/`max`  → solo para el flag ESTADO (H/L/N) confiable. `rango` es el texto mostrado.
// `opciones`   → si existe, el campo se renderiza como <select> en vez de <input>.
// `bagOverride`/`modeOverride` → para parámetros que, aunque vivan en una tab, se guardan
//                en OTRA bolsa (p.ej. Widal dentro de Serología va a `widalDatos`).

export interface ParametroLab {
  key: string;
  label: string;
  unidad?: string;
  rango?: string;
  min?: number;
  max?: number;
  tipo?: 'numero' | 'texto';
  seccion?: string;
  opciones?: string[];
  bagOverride?: string;
  modeOverride?: 'flat' | 'nested';
}

export interface StorageLab {
  mode: 'flat' | 'nested';
  bag?: string;      // requerido si mode === 'nested'
  tipoLab: string;   // marca en estudiosRealizados
}

// Opciones reutilizables de dropdowns.
const OPC_REACTIVO = ['No Reactivo', 'Reactivo'];
const OPC_NEG_POS = ['Negativo', 'Positivo'];
const OPC_WIDAL = ['No reactivo', '1:20', '1:40', '1:80', '1:160', '1:320', '1:640'];
const OPC_RPR = ['No Reactivo', 'Reactivo', 'Reactivo 1 dils', 'Reactivo 2 dils', 'Reactivo 4 dils', 'Reactivo 8 dils'];

// ── HEMATOLOGÍA (+ Coagulograma) — plano en la raíz de `datos` (hematoDatos) ──
export const CATALOGO_HEMATOLOGIA: ParametroLab[] = [
  { key: 'globulos_blancos', label: 'Glóbulos Blancos (GB)', unidad: 'mm³', rango: '4.000 - 10.000', min: 4000, max: 10000, seccion: 'Serie Roja y Recuento' },
  { key: 'globulos_rojos', label: 'Glóbulos Rojos (GR)', unidad: 'mm³', rango: 'Varones: 4.5 - 5.5 mill · Mujeres: 4.0 - 5.0 mill', seccion: 'Serie Roja y Recuento' },
  { key: 'hto', label: 'Hematocrito (HTO)', unidad: '%', rango: 'Varones: 42 - 52% · Mujeres: 37 - 47%', seccion: 'Serie Roja y Recuento' },
  { key: 'hb', label: 'Hemoglobina (HB)', unidad: 'g/dL', rango: 'Varones: 14 - 18 · Mujeres: 12 - 16', seccion: 'Serie Roja y Recuento' },
  { key: 'plaquetas', label: 'Plaquetas', unidad: 'mm³', rango: '150.000 - 450.000', min: 150000, max: 450000, seccion: 'Serie Roja y Recuento' },
  { key: 'reticulocitos', label: 'Reticulocitos', unidad: '%', rango: '0.5 - 2%', min: 0.5, max: 2, seccion: 'Serie Roja y Recuento' },
  { key: 'mielo', label: 'Mielocitos', unidad: '%', rango: '0%', min: 0, max: 0, seccion: 'Fórmula Diferencial' },
  { key: 'metamie', label: 'Metamielocitos', unidad: '%', rango: '0%', min: 0, max: 0, seccion: 'Fórmula Diferencial' },
  { key: 'cay', label: 'Cayados (CA)', unidad: '%', rango: '1 - 5%', min: 1, max: 5, seccion: 'Fórmula Diferencial' },
  { key: 'seg', label: 'Segmentados', unidad: '%', rango: '55 - 65%', min: 55, max: 65, seccion: 'Fórmula Diferencial' },
  { key: 'eosi', label: 'Eosinófilos', unidad: '%', rango: '1 - 4%', min: 1, max: 4, seccion: 'Fórmula Diferencial' },
  { key: 'baso', label: 'Basófilos', unidad: '%', rango: '0 - 1%', min: 0, max: 1, seccion: 'Fórmula Diferencial' },
  { key: 'linf', label: 'Linfocitos', unidad: '%', rango: '25 - 40%', min: 25, max: 40, seccion: 'Fórmula Diferencial' },
  { key: 'mon', label: 'Monocitos', unidad: '%', rango: '2 - 8%', min: 2, max: 8, seccion: 'Fórmula Diferencial' },
  { key: 'ves_1_hora', label: 'VES 1ª Hora', unidad: 'mm', rango: '0 - 15', min: 0, max: 15, seccion: 'Sedimentación e Índices' },
  { key: 'ves_2_hora', label: 'VES 2ª Hora', unidad: 'mm', rango: '—', seccion: 'Sedimentación e Índices' },
  { key: 'indice_katz', label: 'Índice de Katz', unidad: '', rango: '—', seccion: 'Sedimentación e Índices' },
  { key: 'grupo_sanguineo', label: 'Grupo Sanguíneo y Factor Rh', unidad: '', rango: '—', tipo: 'texto', seccion: 'Inmunohematología' },
  // Coagulación / Hemostasia (Coagulograma — mismas claves planas que lee ReporteCoagulograma)
  { key: 'tiempo_protrombina', label: 'Tiempo de Protrombina (T.P.)', unidad: 'seg', rango: '11 - 14 seg', min: 11, max: 14, seccion: 'Coagulación / Hemostasia' },
  { key: 'actividad_protrombina', label: 'Actividad de Protrombina (A.P.)', unidad: '%', rango: '70 - 100%', min: 70, max: 100, seccion: 'Coagulación / Hemostasia' },
  { key: 'inr', label: 'INR', unidad: '', rango: '0.8 - 1.2', min: 0.8, max: 1.2, seccion: 'Coagulación / Hemostasia' },
  { key: 't_coagulacion_min', label: 'Tiempo de Coagulación (min)', unidad: 'min', rango: '5 - 10 min', seccion: 'Coagulación / Hemostasia' },
  { key: 't_coagulacion_seg', label: 'Tiempo de Coagulación (seg)', unidad: 'seg', rango: '—', seccion: 'Coagulación / Hemostasia' },
  { key: 't_sangria_min', label: 'Tiempo de Sangría (min)', unidad: 'min', rango: '1 - 3 min', seccion: 'Coagulación / Hemostasia' },
  { key: 't_sangria_seg', label: 'Tiempo de Sangría (seg)', unidad: 'seg', rango: '—', seccion: 'Coagulación / Hemostasia' },
];

// ── SEROLOGÍA (+ Widal) ──
// Serología → serologiaDatos ; los antígenos Widal se desvían a widalDatos.
export const CATALOGO_SEROLOGIA: ParametroLab[] = [
  { key: 'hiv', label: 'Prueba Rápida VIH', rango: 'No Reactivo', opciones: OPC_REACTIVO, seccion: 'Infecciosas' },
  { key: 'rpr', label: 'RPR / VDRL (Sífilis)', rango: 'No Reactivo', opciones: OPC_RPR, seccion: 'Infecciosas' },
  { key: 'hepatitis_b', label: 'Hepatitis B (HBsAg)', rango: 'No Reactivo', opciones: OPC_REACTIVO, seccion: 'Infecciosas' },
  { key: 'h_pylori_suero', label: 'H. Pylori (Suero)', rango: 'No Reactivo', opciones: OPC_REACTIVO, seccion: 'Infecciosas' },
  { key: 'widal_o', label: 'Widal Antígeno O', rango: 'No reactivo', opciones: OPC_WIDAL, bagOverride: 'widalDatos', seccion: 'Reacción de Widal' },
  { key: 'widal_h', label: 'Widal Antígeno H', rango: 'No reactivo', opciones: OPC_WIDAL, bagOverride: 'widalDatos', seccion: 'Reacción de Widal' },
  { key: 'widal_a', label: 'Widal Antígeno A', rango: 'No reactivo', opciones: OPC_WIDAL, bagOverride: 'widalDatos', seccion: 'Reacción de Widal' },
  { key: 'widal_b', label: 'Widal Antígeno B', rango: 'No reactivo', opciones: OPC_WIDAL, bagOverride: 'widalDatos', seccion: 'Reacción de Widal' },
  { key: 'asto', label: 'ASTO / ASOT (Antiestreptolisina O)', unidad: 'UI/mL', rango: '< 200', min: 0, max: 200, seccion: 'Reactantes de Fase Aguda' },
  { key: 'pcr', label: 'Proteína C Reactiva (PCR)', unidad: 'mg/L', rango: '< 6 (No Reactivo)', seccion: 'Reactantes de Fase Aguda' },
  { key: 'fr', label: 'Factor Reumatoideo (FR)', unidad: 'UI/mL', rango: '< 20 (Negativo)', seccion: 'Reactantes de Fase Aguda' },
  { key: 'test_embarazo', label: 'Test de Embarazo (β-HCG)', rango: 'Negativo', opciones: OPC_NEG_POS, seccion: 'Otras Pruebas' },
  { key: 'psa_prueba_rapida', label: 'PSA (Prueba rápida)', rango: 'Normal / Negativo', tipo: 'texto', seccion: 'Otras Pruebas' },
];

// ── QUÍMICA SANGUÍNEA (+ Electrolitos) → quimicaDatos ──
export const CATALOGO_QUIMICA: ParametroLab[] = [
  { key: 'gli', label: 'Glicemia', unidad: 'mg/dL', rango: '70 - 110', min: 70, max: 110, seccion: 'Glucémico' },
  { key: 'hba_1c', label: 'Hemoglobina Glicosilada (A1c)', unidad: '%', rango: '4.0 - 5.6%', min: 4, max: 5.6, seccion: 'Glucémico' },
  { key: 'urea', label: 'Urea', unidad: 'mg/dL', rango: '15 - 45', min: 15, max: 45, seccion: 'Renal' },
  { key: 'nus', label: 'Nitrógeno Ureico (NUS)', unidad: 'mg/dL', rango: '7 - 20', min: 7, max: 20, seccion: 'Renal' },
  { key: 'crea', label: 'Creatinina', unidad: 'mg/dL', rango: '0.6 - 1.2', min: 0.6, max: 1.2, seccion: 'Renal' },
  { key: 'acido_urico', label: 'Ácido Úrico', unidad: 'mg/dL', rango: 'Varones: 3.5 - 7.2 · Mujeres: 2.6 - 6.0', seccion: 'Renal' },
  { key: 'col', label: 'Colesterol Total', unidad: 'mg/dL', rango: 'hasta 200', min: 0, max: 200, seccion: 'Perfil Lipídico' },
  { key: 'tri', label: 'Triglicéridos', unidad: 'mg/dL', rango: 'hasta 150', min: 0, max: 150, seccion: 'Perfil Lipídico' },
  { key: 'hdl', label: 'Colesterol HDL', unidad: 'mg/dL', rango: 'Deseable: > 40', min: 40, seccion: 'Perfil Lipídico' },
  { key: 'ldl', label: 'Colesterol LDL', unidad: 'mg/dL', rango: 'Deseable: < 100', min: 0, max: 100, seccion: 'Perfil Lipídico' },
  { key: 'vldl', label: 'Colesterol VLDL', unidad: 'mg/dL', rango: '5 - 40', min: 5, max: 40, seccion: 'Perfil Lipídico' },
  { key: 'got', label: 'TGO / AST', unidad: 'U/L', rango: 'hasta 40', min: 0, max: 40, seccion: 'Hepático' },
  { key: 'gpt', label: 'TGP / ALT', unidad: 'U/L', rango: 'hasta 40', min: 0, max: 40, seccion: 'Hepático' },
  { key: 'fal', label: 'Fosfatasa Alcalina', unidad: 'U/L', rango: '40 - 129', min: 40, max: 129, seccion: 'Hepático' },
  { key: 'amilasa', label: 'Amilasa', unidad: 'U/L', rango: '28 - 100', min: 28, max: 100, seccion: 'Hepático' },
  { key: 'bt', label: 'Bilirrubina Total', unidad: 'mg/dL', rango: '0.1 - 1.2', min: 0.1, max: 1.2, seccion: 'Bilirrubinas' },
  { key: 'bd', label: 'Bilirrubina Directa', unidad: 'mg/dL', rango: '0 - 0.3', min: 0, max: 0.3, seccion: 'Bilirrubinas' },
  { key: 'bi', label: 'Bilirrubina Indirecta', unidad: 'mg/dL', rango: '0.1 - 0.7', min: 0.1, max: 0.7, seccion: 'Bilirrubinas' },
  { key: 'prot', label: 'Proteínas Totales', unidad: 'g/dL', rango: '6.4 - 8.3', min: 6.4, max: 8.3, seccion: 'Proteínas' },
  { key: 'alb', label: 'Albúmina', unidad: 'g/dL', rango: '3.5 - 5.2', min: 3.5, max: 5.2, seccion: 'Proteínas' },
  { key: 'globulinas', label: 'Globulinas', unidad: 'g/dL', rango: '2.3 - 3.5', min: 2.3, max: 3.5, seccion: 'Proteínas' },
  { key: 'rel_alb_glo', label: 'Relación Albúmina/Globulina', rango: '1.1 - 2.5', tipo: 'texto', seccion: 'Proteínas' },
  // Electrolitos (misma bolsa quimicaDatos — lo lee ReporteElectrolitos)
  { key: 'sodio_meql', label: 'Sodio (Na⁺)', unidad: 'mEq/L', rango: '135 - 145', min: 135, max: 145, seccion: 'Electrolitos' },
  { key: 'potasio_meql', label: 'Potasio (K⁺)', unidad: 'mEq/L', rango: '3.5 - 5.1', min: 3.5, max: 5.1, seccion: 'Electrolitos' },
  { key: 'cloro_meql', label: 'Cloro (Cl⁻)', unidad: 'mEq/L', rango: '98 - 107', min: 98, max: 107, seccion: 'Electrolitos' },
];

// ── EXAMEN GENERAL DE ORINA (+ Orina 24h) → egoDatos ──
export const CATALOGO_EGO: ParametroLab[] = [
  { key: 'volumen', label: 'Cantidad', unidad: 'mL', rango: '—', tipo: 'texto', seccion: 'Examen Físico' },
  { key: 'color', label: 'Color', rango: 'Amarillo', tipo: 'texto', seccion: 'Examen Físico' },
  { key: 'olor', label: 'Olor', rango: 'Sui géneris', tipo: 'texto', seccion: 'Examen Físico' },
  { key: 'aspecto', label: 'Aspecto', rango: 'Límpido / Transparente', tipo: 'texto', seccion: 'Examen Físico' },
  { key: 'sedimento', label: 'Sedimento', rango: 'Escaso / Nulo', tipo: 'texto', seccion: 'Examen Físico' },
  { key: 'espuma', label: 'Espuma', rango: 'Blanca fugaz', tipo: 'texto', seccion: 'Examen Físico' },
  { key: 'densidad', label: 'Densidad', rango: '1.010 - 1.025', min: 1.01, max: 1.025, seccion: 'Examen Físico' },
  { key: 'ph', label: 'Reacción (pH)', rango: 'Ácida (5.0 - 6.5)', min: 4.5, max: 8, seccion: 'Examen Físico' },
  { key: 'prot', label: 'Proteínas', rango: 'Negativo', opciones: ['Negativo', 'Indicios', '+', '++', '+++'], seccion: 'Examen Químico' },
  { key: 'glucosa', label: 'Glucosa', rango: 'Normal', opciones: ['Normal', 'Indicios', '+', '++', '+++'], seccion: 'Examen Químico' },
  { key: 'cetonas', label: 'Cetonas', rango: 'Negativo', opciones: ['Negativo', 'Indicios', '+', '++', '+++'], seccion: 'Examen Químico' },
  { key: 'bilirrubinas', label: 'Bilirrubinas', rango: 'Negativo', opciones: OPC_NEG_POS, seccion: 'Examen Químico' },
  { key: 'sangre', label: 'Sangre', rango: 'Negativo', opciones: ['Negativo', 'Indicios', '+', '++', '+++'], seccion: 'Examen Químico' },
  { key: 'urobilinogeno', label: 'Urobilinógeno', rango: 'Normal', tipo: 'texto', seccion: 'Examen Químico' },
  { key: 'nitritos', label: 'Nitritos', rango: 'Negativo', opciones: OPC_NEG_POS, seccion: 'Examen Químico' },
  { key: 'piocitos', label: 'Piocitos', unidad: 'x campo', rango: '0 - 2', tipo: 'texto', seccion: 'Sedimento' },
  { key: 'leucocitos', label: 'Leucocitos', unidad: 'x campo', rango: '1 - 3', tipo: 'texto', seccion: 'Sedimento' },
  { key: 'eritrocitos', label: 'Eritrocitos', unidad: 'x campo', rango: '0 - 1', tipo: 'texto', seccion: 'Sedimento' },
  { key: 'cel_epiteliales', label: 'Células Epiteliales', rango: 'Escasas', tipo: 'texto', seccion: 'Sedimento' },
  { key: 'bacterias', label: 'Bacterias', rango: 'Escasas', tipo: 'texto', seccion: 'Sedimento' },
  { key: 'cel_renales', label: 'Células Renales', rango: 'No se observan', tipo: 'texto', seccion: 'Sedimento' },
  { key: 'filamento_mucoso', label: 'Filamento Mucoso', rango: 'Escaso', tipo: 'texto', seccion: 'Sedimento' },
  { key: 'cristales', label: 'Cristales', rango: 'No se observan', tipo: 'texto', seccion: 'Sedimento' },
  { key: 'cilindros_hialinos', label: 'Cilindros Hialinos', rango: 'No se observan', tipo: 'texto', seccion: 'Cilindros' },
  { key: 'cilindros_granuloso', label: 'Cilindros Granulosos', rango: 'No se observan', tipo: 'texto', seccion: 'Cilindros' },
  { key: 'cilindros_hematico', label: 'Cilindros Hemáticos', rango: 'No se observan', tipo: 'texto', seccion: 'Cilindros' },
  { key: 'cilindros_cereo', label: 'Cilindros Céreos', rango: 'No se observan', tipo: 'texto', seccion: 'Cilindros' },
  // Orina de 24 Horas (misma bolsa egoDatos — lo lee ReporteElectrolitos)
  { key: 'volumen_24h', label: 'Volumen Orina 24h', unidad: 'mL', rango: '600 - 2000', min: 600, max: 2000, seccion: 'Orina de 24 Horas' },
  { key: 'prot_24h', label: 'Proteínas en Orina 24h', unidad: 'mg/24h', rango: '< 150', min: 0, max: 150, seccion: 'Orina de 24 Horas' },
  { key: 'crea_orina_24h', label: 'Creatinina en Orina 24h', unidad: 'mg/24h', rango: '800 - 2000', min: 800, max: 2000, seccion: 'Orina de 24 Horas' },
];

// ── UROLOGÍA Y COPROPARASITOLOGÍA (+ Microalbuminuria) ──
// Copro → urologiaDatos (aún sin PDF) ; Microalbuminuria se desvía a microDatos.
export const CATALOGO_UROLOGIA: ParametroLab[] = [
  { key: 'copro_muestra_1', label: 'Coproparasitológico Muestra I', rango: 'No se observan quistes ni huevos de parásitos', tipo: 'texto', seccion: 'Coproparasitológico' },
  { key: 'copro_muestra_2', label: 'Coproparasitológico Muestra II', rango: 'No se observan quistes ni huevos de parásitos', tipo: 'texto', seccion: 'Coproparasitológico' },
  { key: 'copro_muestra_3', label: 'Coproparasitológico Muestra III', rango: 'No se observan quistes ni huevos de parásitos', tipo: 'texto', seccion: 'Coproparasitológico' },
  { key: 'copro_moco', label: 'Citología de Moco Fecal', rango: '—', tipo: 'texto', seccion: 'Coproparasitológico' },
  { key: 'sangre_oculta', label: 'Sangre Oculta en Heces', rango: 'Negativo', opciones: OPC_NEG_POS, seccion: 'Pruebas Especiales' },
  { key: 'test_graham', label: 'Test de Graham', rango: '—', tipo: 'texto', seccion: 'Pruebas Especiales' },
  { key: 'micro_albumina', label: 'Microalbúmina', unidad: 'mg/L', rango: '< 20', min: 0, max: 20, bagOverride: 'microDatos', seccion: 'Microalbuminuria' },
  { key: 'micro_creatinina', label: 'Creatinina (orina)', unidad: 'mg/dL', rango: '—', bagOverride: 'microDatos', seccion: 'Microalbuminuria' },
  { key: 'relacion_ac', label: 'Relación Albúmina/Creatinina', unidad: 'mg/g', rango: '< 30', min: 0, max: 30, bagOverride: 'microDatos', seccion: 'Microalbuminuria' },
];

// ── CURVA DE TOLERANCIA A LA GLUCOSA → glucosaFija ──
export const CATALOGO_GLUCOSA: ParametroLab[] = [
  { key: 'basal', label: 'Glucemia Basal (Ayunas)', unidad: 'mg/dL', rango: '70 - 100', min: 70, max: 100, seccion: 'Curva' },
  { key: 'hora_basal', label: 'Hora de Muestra Basal', rango: '—', tipo: 'texto', seccion: 'Curva' },
  { key: 'resultado_glucosa1', label: 'Glucemia 60 min', unidad: 'mg/dL', rango: '< 180', min: 0, max: 180, seccion: 'Curva' },
  { key: 'hora_1h', label: 'Hora de Muestra 60 min', rango: '—', tipo: 'texto', seccion: 'Curva' },
  { key: 'resultado_glucosa2', label: 'Glucemia 120 min', unidad: 'mg/dL', rango: '< 140', min: 0, max: 140, seccion: 'Curva' },
  { key: 'hora_2h', label: 'Hora de Muestra 120 min', rango: '—', tipo: 'texto', seccion: 'Curva' },
];

// ── ANÁLISIS DE LÍQUIDOS BIOLÓGICOS → liquidosDatos ──
export const CATALOGO_LIQUIDOS: ParametroLab[] = [
  { key: 'tipo_liquido', label: 'Tipo de Líquido', rango: '—', tipo: 'texto', seccion: 'Muestra' },
  { key: 'volumen', label: 'Volumen', unidad: 'mL', rango: '—', tipo: 'texto', seccion: 'Muestra' },
  { key: 'color', label: 'Color', rango: 'Cristalino', tipo: 'texto', seccion: 'Examen Físico' },
  { key: 'aspecto', label: 'Aspecto', rango: 'Transparente', tipo: 'texto', seccion: 'Examen Físico' },
  { key: 'ph', label: 'pH', rango: '7.3 - 7.4', tipo: 'texto', seccion: 'Examen Físico' },
  { key: 'reaccion', label: 'Reacción', rango: '—', tipo: 'texto', seccion: 'Examen Físico' },
  { key: 'centrif_color', label: 'Centrifugado - Color', rango: '—', tipo: 'texto', seccion: 'Centrifugado' },
  { key: 'centrif_aspecto', label: 'Centrifugado - Aspecto', rango: '—', tipo: 'texto', seccion: 'Centrifugado' },
  { key: 'centrif_obs', label: 'Centrifugado - Observación', rango: '—', tipo: 'texto', seccion: 'Centrifugado' },
  { key: 'quimico_glucosa', label: 'Glucosa', unidad: 'mg/dL', rango: '—', seccion: 'Examen Químico' },
  { key: 'quimico_proteinas', label: 'Proteínas', unidad: 'g/dL', rango: '—', seccion: 'Examen Químico' },
  { key: 'quimico_obs', label: 'Químico - Observación', rango: '—', tipo: 'texto', seccion: 'Examen Químico' },
  { key: 'micro_leucocitos', label: 'Leucocitos', unidad: '/mm³', rango: '—', seccion: 'Recuento Microscópico' },
  { key: 'micro_pmn', label: 'Polimorfonucleares (PMN)', unidad: '%', rango: '—', seccion: 'Recuento Microscópico' },
  { key: 'micro_mn', label: 'Mononucleares (MN)', unidad: '%', rango: '—', seccion: 'Recuento Microscópico' },
  { key: 'micro_no_procede_obs', label: 'No procede / Observación', rango: '—', tipo: 'texto', seccion: 'Recuento Microscópico' },
  { key: 'sedimento_leucocitos', label: 'Sedimento - Leucocitos', rango: '—', tipo: 'texto', seccion: 'Sedimento' },
  { key: 'sedimento_hematies', label: 'Sedimento - Hematíes', rango: '—', tipo: 'texto', seccion: 'Sedimento' },
  { key: 'sedimento_bacterias', label: 'Sedimento - Bacterias', rango: '—', tipo: 'texto', seccion: 'Sedimento' },
  { key: 'sedimento_otros', label: 'Sedimento - Otros', rango: '—', tipo: 'texto', seccion: 'Sedimento' },
  { key: 'otros', label: 'Otros', rango: '—', tipo: 'texto', seccion: 'Sedimento' },
];

// ── ESPERMATOGRAMA → espermatoDatos ──
export const CATALOGO_ESPERMATO: ParametroLab[] = [
  { key: 'fecha_obtencion', label: 'Fecha/Hora de Obtención', rango: '—', tipo: 'texto', seccion: 'Datos de la Muestra' },
  { key: 'hora_recepcion', label: 'Hora de Recepción en Lab.', rango: '—', tipo: 'texto', seccion: 'Datos de la Muestra' },
  { key: 'dias_abstinencia', label: 'Días de Abstinencia', rango: '2 - 7', tipo: 'texto', seccion: 'Datos de la Muestra' },
  { key: 'volumen', label: 'Volumen', unidad: 'mL', rango: '≥ 1.5', min: 1.5, seccion: 'Examen Macroscópico' },
  { key: 'color', label: 'Color', rango: 'Blanco opalescente', tipo: 'texto', seccion: 'Examen Macroscópico' },
  { key: 'ph', label: 'pH', rango: '7.2 - 8.0', min: 7.2, max: 8, seccion: 'Examen Macroscópico' },
  { key: 'viscosidad', label: 'Viscosidad', rango: 'Normal', tipo: 'texto', seccion: 'Examen Macroscópico' },
  { key: 'aspecto', label: 'Aspecto', rango: 'Homogéneo', tipo: 'texto', seccion: 'Examen Macroscópico' },
  { key: 'licuefaccion', label: 'Licuefacción', rango: '< 60 min', tipo: 'texto', seccion: 'Examen Macroscópico' },
  { key: 'coagulacion', label: 'Coagulación', rango: 'Completa', tipo: 'texto', seccion: 'Examen Macroscópico' },
  { key: 'olor', label: 'Olor', rango: 'Sui géneris', tipo: 'texto', seccion: 'Examen Macroscópico' },
  { key: 'concentracion', label: 'Concentración', unidad: 'mill/mL', rango: '≥ 15', min: 15, seccion: 'Examen Microscópico' },
  { key: 'concentracion_total', label: 'Concentración Total', unidad: 'mill/eyac.', rango: '≥ 39', min: 39, seccion: 'Examen Microscópico' },
  { key: 'recuento_total', label: 'Recuento Total', rango: '—', tipo: 'texto', seccion: 'Examen Microscópico' },
  { key: 'motilidad_progresiva', label: 'Motilidad Progresiva (a+b)', unidad: '%', rango: '≥ 32%', min: 32, seccion: 'Motilidad' },
  { key: 'motilidad_no_progresiva', label: 'Motilidad No Progresiva (c)', unidad: '%', rango: '—', seccion: 'Motilidad' },
  { key: 'inmoviles', label: 'Inmóviles (d)', unidad: '%', rango: '—', seccion: 'Motilidad' },
  { key: 'vitalidad', label: 'Vitalidad', unidad: '%', rango: '≥ 58%', min: 58, seccion: 'Motilidad' },
  { key: 'morfologia_normal', label: 'Morfología Normal', unidad: '%', rango: '≥ 4%', min: 4, seccion: 'Morfología' },
  { key: 'leucocitos', label: 'Leucocitos', unidad: 'mill/mL', rango: '< 1', min: 0, max: 1, seccion: 'Morfología' },
  { key: 'aglutinacion', label: 'Aglutinación', rango: 'Ausente', tipo: 'texto', seccion: 'Morfología' },
];

export interface CategoriaLab {
  id: string;
  label: string;
  total: number;
  catalogo: ParametroLab[];
  storage: StorageLab;
  sinPDF?: boolean; // true = todavía no genera reporte PDF
}

export const CATEGORIAS_LAB: CategoriaLab[] = [
  { id: 'hematologia', label: 'Hematología', total: CATALOGO_HEMATOLOGIA.length, catalogo: CATALOGO_HEMATOLOGIA, storage: { mode: 'flat', tipoLab: 'Lab_Hemato' } },
  { id: 'serologia', label: 'Serología', total: CATALOGO_SEROLOGIA.length, catalogo: CATALOGO_SEROLOGIA, storage: { mode: 'nested', bag: 'serologiaDatos', tipoLab: 'Lab_Serologia' } },
  { id: 'urologia', label: 'Urología y Coproparasitología', total: CATALOGO_UROLOGIA.length, catalogo: CATALOGO_UROLOGIA, storage: { mode: 'nested', bag: 'urologiaDatos', tipoLab: 'Lab_Urologia' }, sinPDF: true },
  { id: 'quimica', label: 'Química Sanguínea', total: CATALOGO_QUIMICA.length, catalogo: CATALOGO_QUIMICA, storage: { mode: 'nested', bag: 'quimicaDatos', tipoLab: 'Lab_Quimica' } },
  { id: 'ego', label: 'Examen General de Orina', total: CATALOGO_EGO.length, catalogo: CATALOGO_EGO, storage: { mode: 'nested', bag: 'egoDatos', tipoLab: 'Lab_EGO' } },
  { id: 'glucosa', label: 'Curva de Glucosa', total: CATALOGO_GLUCOSA.length, catalogo: CATALOGO_GLUCOSA, storage: { mode: 'nested', bag: 'glucosaFija', tipoLab: 'Lab_Glucosa_Curva' } },
  { id: 'liquidos', label: 'Líquidos Biológicos', total: CATALOGO_LIQUIDOS.length, catalogo: CATALOGO_LIQUIDOS, storage: { mode: 'nested', bag: 'liquidosDatos', tipoLab: 'Lab_Liquidos' } },
  { id: 'espermato', label: 'Espermatograma', total: CATALOGO_ESPERMATO.length, catalogo: CATALOGO_ESPERMATO, storage: { mode: 'nested', bag: 'espermatoDatos', tipoLab: 'Lab_Espermato' } },
];
