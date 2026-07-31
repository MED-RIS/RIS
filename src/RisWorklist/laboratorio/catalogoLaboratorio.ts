// Catálogo de parámetros por categoría de laboratorio para el editor nuevo (tabla).
// IMPORTANTE: Mapeo estricto basado exactamente en la estructura del Excel oficial.

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
  bag?: string;      
  tipoLab: string;   
}

// Opciones reutilizables de dropdowns
const OPC_REACTIVO = ['No Reactivo', 'Reactivo'];
const OPC_NEG_POS = ['Negativo', 'Positivo'];
const OPC_WIDAL = ['No reactivo', '1:20', '1:40', '1:80', '1:160', '1:320', '1:640'];
const OPC_RPR = ['No Reactivo', 'Reactivo', 'Reactivo 1 dils', 'Reactivo 2 dils', 'Reactivo 4 dils', 'Reactivo 8 dils'];

// ── 1. HEMOGRAMA (Exclusivo - según Excel DATOS) ──
export const CATALOGO_HEMOGRAMA: ParametroLab[] = [
  { key: 'hto', label: 'HTO', unidad: '%', rango: 'Varones: 42 - 52% · Mujeres: 37 - 47%', seccion: 'Serie Roja y Recuento' },
  { key: 'hb', label: 'HB', unidad: 'g/dL', rango: 'Varones: 14 - 18 · Mujeres: 12 - 16', seccion: 'Serie Roja y Recuento' },
  { key: 'vcm', label: 'V.C.M.', unidad: 'fL', rango: '80 - 98', seccion: 'Serie Roja y Recuento' },
  { key: 'hcm', label: 'H.C.M.', unidad: 'pg', rango: '27 - 32', seccion: 'Serie Roja y Recuento' },
  { key: 'chcm', label: 'C.H.C.M.', unidad: 'g/dL', rango: '32 - 36', seccion: 'Serie Roja y Recuento' },
  { key: 'globulos_blancos', label: 'GLOBULOS BLANCOS', unidad: 'uL', rango: '4.000 - 10.000', min: 4000, max: 10000, seccion: 'Serie Roja y Recuento' },
  { key: 'seg', label: 'SEG', unidad: '%', rango: '55 - 65%', min: 55, max: 65, seccion: 'Fórmula Diferencial' },
  { key: 'linf', label: 'LINF.', unidad: '%', rango: '25 - 40%', min: 25, max: 40, seccion: 'Fórmula Diferencial' },
  { key: 'mon', label: 'MON.', unidad: '%', rango: '2 - 8%', min: 2, max: 8, seccion: 'Fórmula Diferencial' },
  { key: 'eosi', label: 'EOSI.', unidad: '%', rango: '1 - 4%', min: 1, max: 4, seccion: 'Fórmula Diferencial' },
  { key: 'cay', label: 'CAY.', unidad: '%', rango: '1 - 5%', min: 1, max: 5, seccion: 'Fórmula Diferencial' },
  { key: 'mielo', label: 'MIELO', unidad: '%', rango: '0%', min: 0, max: 0, seccion: 'Fórmula Diferencial' },
  { key: 'metamie', label: 'METAMIE', unidad: '%', rango: '0%', min: 0, max: 0, seccion: 'Fórmula Diferencial' },
  { key: 'baso', label: 'BASO.', unidad: '%', rango: '0 - 1%', min: 0, max: 1, seccion: 'Fórmula Diferencial' },
  { key: 'total_diferencial', label: 'TOTAL', unidad: '%', rango: '100%', seccion: 'Fórmula Diferencial' },
  { key: 'plaquetas', label: 'PLAQUETAS', unidad: 'uL', rango: '150.000 - 450.000', min: 150000, max: 450000, seccion: 'Serie Roja y Recuento' },
  { key: 'grupo_sanguineo', label: 'GRUPO SANGUINEO', unidad: '', rango: '—', tipo: 'texto', seccion: 'Inmunohematología' },
  { key: 'reticulocitos', label: 'RETICULOCITOS', unidad: '%', rango: '0.5 - 2%', min: 0.5, max: 2, seccion: 'Serie Roja y Recuento' },
  { key: 'ves_1_hora', label: 'VES 1 HORA', unidad: 'mm', rango: '0 - 15', min: 0, max: 15, seccion: 'Sedimentación e Índices' },
  { key: 'ves_2_hora', label: 'VES 2HORA', unidad: 'mm', rango: '—', seccion: 'Sedimentación e Índices' },
  { key: 'indice_katz', label: 'INDICE DE KATZ', unidad: '', rango: '—', seccion: 'Sedimentación e Índices' },
  { key: 'comentario_roja', label: 'COMENTARIO SERIE ROJA', tipo: 'texto', seccion: 'Comentarios' },
  { key: 'comentario_blanca', label: 'COMENTARIO SERIE BLANCA', tipo: 'texto', seccion: 'Comentarios' },
  { key: 'comentario_plaquetas', label: 'COMENTARIO PLAQUETAS', tipo: 'texto', seccion: 'Comentarios' },
  { key: 'observaciones', label: 'OBSERVACIONES', tipo: 'texto', seccion: 'Comentarios' },
];

// ── 2. COAGULOGRAMA (Extraído independientemente según Excel) ──
export const CATALOGO_COAGULOGRAMA: ParametroLab[] = [
  { key: 't_sangria_min', label: 'TIEMPO DE SANGRIA MINUTOS', unidad: 'min', rango: '1 - 3 min', seccion: 'Coagulación / Hemostasia' },
  { key: 't_sangria_seg', label: 'TIEMPO DE SANGRIA SEGUNDOS', unidad: 'seg', rango: '—', seccion: 'Coagulación / Hemostasia' },
  { key: 't_coagulacion_min', label: 'T. DE COAGULACION MINUTOS', unidad: 'min', rango: '5 - 10 min', seccion: 'Coagulación / Hemostasia' },
  { key: 't_coagulacion_seg', label: 'T. DE COAGULACION SEGUNDOS', unidad: 'seg', rango: '—', seccion: 'Coagulación / Hemostasia' },
  { key: 'tiempo_protrombina', label: 'TIEMPO DE PROTROMBINA', unidad: 'seg', rango: '11 - 14 seg', min: 11, max: 14, seccion: 'Coagulación / Hemostasia' },
  { key: 'actividad_protrombina', label: 'ACTIVIDAD', unidad: '%', rango: '70 - 100%', min: 70, max: 100, seccion: 'Coagulación / Hemostasia' },
  { key: 'inr', label: 'INR', unidad: '', rango: '0.8 - 1.2', min: 0.8, max: 1.2, seccion: 'Coagulación / Hemostasia' },
  { key: 'comentario_roja', label: 'COMENTARIO SERIE ROJA', tipo: 'texto', seccion: 'Comentarios' },
  { key: 'comentario_blanca', label: 'COMENTARIO SERIE BLANCA', tipo: 'texto', seccion: 'Comentarios' },
  { key: 'comentario_plaquetas', label: 'COMENTARIO PLAQUETAS', tipo: 'texto', seccion: 'Comentarios' },
  { key: 'observaciones', label: 'OBSERVACIONES', tipo: 'texto', seccion: 'Comentarios' },
];

// ── 3. QUÍMICA SANGUÍNEA (+ Electrolitos + Orina 24 hrs según Excel) ──
export const CATALOGO_QUIMICA: ParametroLab[] = [
  { key: 'gli', label: 'GLI', unidad: 'mg/dL', rango: '70 - 110', min: 70, max: 110, seccion: 'Químicas' },
  { key: 'crea', label: 'CREA', unidad: 'mg/dL', rango: '0.6 - 1.2', min: 0.6, max: 1.2, seccion: 'Químicas' },
  { key: 'urea', label: 'UREA', unidad: 'mg/dL', rango: '15 - 45', min: 15, max: 45, seccion: 'Químicas' },
  { key: 'nus', label: 'NUS', unidad: 'mg/dL', rango: '7 - 20', min: 7, max: 20, seccion: 'Químicas' },
  { key: 'acido_urico', label: 'ACIDO URICO', unidad: 'mg/dL', rango: '3.5 - 7.2', seccion: 'Químicas' },
  { key: 'hba_1c', label: 'HBA 1C', unidad: '%', rango: '4.0 - 5.6%', min: 4, max: 5.6, seccion: 'Químicas' },
  { key: 'col', label: 'COL', unidad: 'mg/dL', rango: 'hasta 200', min: 0, max: 200, seccion: 'Perfil Lipídico' },
  { key: 'tri', label: 'TRI', unidad: 'mg/dL', rango: 'hasta 150', min: 0, max: 150, seccion: 'Perfil Lipídico' },
  { key: 'hdl', label: 'HDL', unidad: 'mg/dL', rango: '> 40', min: 40, seccion: 'Perfil Lipídico' },
  { key: 'ldl', label: 'LDL', unidad: 'mg/dL', rango: '< 100', min: 0, max: 100, seccion: 'Perfil Lipídico' },
  { key: 'vldl', label: 'VLDL', unidad: 'mg/dL', rango: '5 - 40', min: 5, max: 40, seccion: 'Perfil Lipídico' },
  { key: 'got', label: 'GOT', unidad: 'U/L', rango: 'hasta 40', min: 0, max: 40, seccion: 'Hepático' },
  { key: 'gpt', label: 'GPT', unidad: 'U/L', rango: 'hasta 40', min: 0, max: 40, seccion: 'Hepático' },
  { key: 'fal', label: 'FAL', unidad: 'U/L', rango: '40 - 129', min: 40, max: 129, seccion: 'Hepático' },
  { key: 'bd', label: 'BD', unidad: 'mg/dL', rango: '0 - 0.3', min: 0, max: 0.3, seccion: 'Bilirrubinas' },
  { key: 'bi', label: 'BI', unidad: 'mg/dL', rango: '0.1 - 0.7', min: 0.1, max: 0.7, seccion: 'Bilirrubinas' },
  { key: 'bt', label: 'BT', unidad: 'mg/dL', rango: '0.1 - 1.2', min: 0.1, max: 1.2, seccion: 'Bilirrubinas' },
  { key: 'prot', label: 'PROT', unidad: 'g/dL', rango: '6.4 - 8.3', min: 6.4, max: 8.3, seccion: 'Proteínas' },
  { key: 'alb', label: 'ALB', unidad: 'g/dL', rango: '3.5 - 5.2', min: 3.5, max: 5.2, seccion: 'Proteínas' },
  { key: 'globulinas', label: 'GLOBULINAS', unidad: 'g/dL', rango: '2.3 - 3.5', min: 2.3, max: 3.5, seccion: 'Proteínas' },
  { key: 'rel_alb_glo', label: 'REL ALB/GLO', rango: '1.1 - 2.5', tipo: 'texto', seccion: 'Proteínas' },
  { key: 'amilasa', label: 'AMILASA', unidad: 'U/L', rango: '28 - 100', min: 28, max: 100, seccion: 'Enzimas' },

  // Electrolitos
  { key: 'sodio', label: 'SODIO', unidad: 'mEq/L', rango: '135 - 145', min: 135, max: 145, seccion: 'Electrolitos' },
  { key: 'potasio', label: 'POTASIO', unidad: 'mEq/L', rango: '3.5 - 5.1', min: 3.5, max: 5.1, seccion: 'Electrolitos' },
  { key: 'cloro', label: 'CLORO', unidad: 'mEq/L', rango: '98 - 107', min: 98, max: 107, seccion: 'Electrolitos' },

  // Orina de 24 Hrs.
  { key: 'prot_24h', label: 'PROT 24 HRS.', unidad: 'mg/24h', rango: '< 150', min: 0, max: 150, seccion: 'Orina de 24 hrs.' },
  { key: 'crea_orina_24h', label: 'CREA EN ORINA', unidad: 'mg/24h', rango: '800 - 2000', min: 800, max: 2000, seccion: 'Orina de 24 hrs.' },
  { key: 'volumen_24h', label: 'VOLUMEN', unidad: 'mL', rango: '600 - 2000', min: 600, max: 2000, seccion: 'Orina de 24 hrs.' },
  { key: 'observaciones_24h', label: 'OBSERVACIONES', tipo: 'texto', seccion: 'Orina de 24 hrs.' },
];

// ── 4. SEROLOGÍA (+ Widal y Microalbuminuria según Excel) ──
export const CATALOGO_SEROLOGIA: ParametroLab[] = [
  { key: 'pcr', label: 'PCR', unidad: 'mg/L', rango: '< 6 (No Reactivo)', seccion: 'Serología' },
  { key: 'fr', label: 'FR', unidad: 'UI/mL', rango: '< 20 (Negativo)', seccion: 'Serología' },
  { key: 'asto', label: 'ASTO', unidad: 'UI/mL', rango: '< 200', min: 0, max: 200, seccion: 'Serología' },
  { key: 'hiv', label: 'HIV', rango: 'No Reactivo', opciones: OPC_REACTIVO, seccion: 'Serología' },
  { key: 'test_embarazo', label: 'TES. EMBARAZO', rango: 'Negativo', opciones: OPC_NEG_POS, seccion: 'Serología' },
  { key: 'rpr', label: 'RPR', rango: 'No Reactivo', opciones: OPC_RPR, seccion: 'Serología' },
  { key: 'psa_prueba_rapida', label: 'PSA PRUEBA RAPIDA', rango: 'Normal / Negativo', tipo: 'texto', seccion: 'Serología' },
  { key: 'h_pylori_suero', label: 'H. PYLORI EN SUERO', rango: 'No Reactivo', opciones: OPC_REACTIVO, seccion: 'Serología' },
  { key: 'hepatitis_b', label: 'HEPATITIS B', rango: 'No Reactivo', opciones: OPC_REACTIVO, seccion: 'Serología' },

  // Widal
  { key: 'widal_o', label: 'O', rango: 'No reactivo', opciones: OPC_WIDAL, bagOverride: 'widalDatos', seccion: 'Widal' },
  { key: 'widal_h', label: 'H', rango: 'No reactivo', opciones: OPC_WIDAL, bagOverride: 'widalDatos', seccion: 'Widal' },
  { key: 'widal_a', label: 'A', rango: 'No reactivo', opciones: OPC_WIDAL, bagOverride: 'widalDatos', seccion: 'Widal' },
  { key: 'widal_b', label: 'B', rango: 'No reactivo', opciones: OPC_WIDAL, bagOverride: 'widalDatos', seccion: 'Widal' },

  // Microalbuminuria
  { key: 'relacion_ac', label: 'A/C', unidad: 'mg/g', rango: '< 30', min: 0, max: 30, bagOverride: 'microDatos', seccion: 'Microalbuminuria' },
  { key: 'micro_albumina', label: 'ALBUMINA', unidad: 'mg/L', rango: '< 20', min: 0, max: 20, bagOverride: 'microDatos', seccion: 'Microalbuminuria' },
  { key: 'micro_creatinina', label: 'CREATININA', unidad: 'mg/dL', rango: '—', bagOverride: 'microDatos', seccion: 'Microalbuminuria' },
];

// ── 5. EXAMEN GENERAL DE ORINA (EGO) ──
export const CATALOGO_EGO: ParametroLab[] = [
  { key: 'volumen', label: 'VOLUMEN', unidad: 'mL', rango: '—', tipo: 'texto', seccion: 'Físico' },
  { key: 'color', label: 'COLOR', rango: 'Amarillo', tipo: 'texto', seccion: 'Físico' },
  { key: 'olor', label: 'OLOR', rango: 'Sui géneris', tipo: 'texto', seccion: 'Físico' },
  { key: 'aspecto', label: 'ASPECTO', rango: 'Límpido', tipo: 'texto', seccion: 'Físico' },
  { key: 'espuma', label: 'ESPUMA', rango: 'Blanca fugaz', tipo: 'texto', seccion: 'Físico' },
  { key: 'otros', label: 'OTROS', rango: '—', tipo: 'texto', seccion: 'Físico' },
  { key: 'sedimento', label: 'SEDIMENTO', rango: 'Escaso', tipo: 'texto', seccion: 'Físico' },
  { key: 'densidad', label: 'DENSIDAD', rango: '1.010 - 1.025', min: 1.01, max: 1.025, seccion: 'Físico' },
  { key: 'ph', label: 'PH', rango: '5.0 - 6.5', min: 4.5, max: 8, seccion: 'Físico' },

  // Químico
  { key: 'prot', label: 'PROT', rango: 'Negativo', opciones: ['Negativo', 'Indicios', '+', '++', '+++'], seccion: 'Examen Químico' },
  { key: 'glucosa', label: 'GLUCOSA', rango: 'Normal', opciones: ['Normal', 'Indicios', '+', '++', '+++'], seccion: 'Examen Químico' },
  { key: 'cetonas', label: 'CETONAS', rango: 'Negativo', opciones: ['Negativo', 'Indicios', '+', '++', '+++'], seccion: 'Examen Químico' },
  { key: 'bilirrubinas', label: 'BILIRRUBINAS', rango: 'Negativo', opciones: OPC_NEG_POS, seccion: 'Examen Químico' },
  { key: 'sangre', label: 'SANGRE', rango: 'Negativo', opciones: ['Negativo', 'Indicios', '+', '++', '+++'], seccion: 'Examen Químico' },
  { key: 'urobilinogeno', label: 'UROBILINOGENO', rango: 'Normal', tipo: 'texto', seccion: 'Examen Químico' },
  { key: 'nitritos', label: 'NITRITOS', rango: 'Negativo', opciones: OPC_NEG_POS, seccion: 'Examen Químico' },

  // Sedimento Microscópico
  { key: 'piocitos', label: 'PIOCITOS', unidad: 'x campo', rango: '0 - 2', tipo: 'texto', seccion: 'Sedimento Microscópico' },
  { key: 'leucocitos', label: 'LEUCOCITOS', unidad: 'x campo', rango: '1 - 3', tipo: 'texto', seccion: 'Sedimento Microscópico' },
  { key: 'eritrocitos', label: 'ERITROCITOS', unidad: 'x campo', rango: '0 - 1', tipo: 'texto', seccion: 'Sedimento Microscópico' },
  { key: 'cel_epiteliales', label: 'C. EPITELIALES', rango: 'Escasas', tipo: 'texto', seccion: 'Sedimento Microscópico' },
  { key: 'bacterias', label: 'BACTERIAS', rango: 'Escasas', tipo: 'texto', seccion: 'Sedimento Microscópico' },
  { key: 'cel_renales', label: 'CEL. RENALES', rango: 'No se observan', tipo: 'texto', seccion: 'Sedimento Microscópico' },
  { key: 'filamento_mucoso', label: 'FILAMENTO MUCOSO', rango: 'Escaso', tipo: 'texto', seccion: 'Sedimento Microscópico' },
  { key: 'cristales', label: 'CRISTALES', rango: 'No se observan', tipo: 'texto', seccion: 'Sedimento Microscópico' },

  // Cilindros
  { key: 'cilindros_hialinos', label: 'HIALINOS', rango: 'No se observan', tipo: 'texto', seccion: 'Cilindros' },
  { key: 'cilindros_granuloso', label: 'GRANULOSO', rango: 'No se observan', tipo: 'texto', seccion: 'Cilindros' },
  { key: 'cilindros_hematico', label: 'HEMATICO', rango: 'No se observan', tipo: 'texto', seccion: 'Cilindros' },
  { key: 'cilindros_cereo', label: 'CEREO', rango: 'No se observan', tipo: 'texto', seccion: 'Cilindros' },
  { key: 'cilindros_otros', label: 'OTROS', rango: 'No se observan', tipo: 'texto', seccion: 'Cilindros' },

  // Observaciones
  { key: 'observaciones1', label: 'OBSERVACIONES1', tipo: 'texto', seccion: 'Observaciones' },
  { key: 'observaciones2', label: 'OBSERVACIONES 2', tipo: 'texto', seccion: 'Observaciones' },
];

// ── 6. LÍQUIDOS BIOLÓGICOS ──
export const CATALOGO_LIQUIDOS: ParametroLab[] = [
  { key: 'tipo_liquido', label: 'TIPO DE LIQUIDO', rango: '—', tipo: 'texto', seccion: 'Muestra' },
  { key: 'volumen', label: 'VOLUMEN', unidad: 'mL', rango: '—', tipo: 'texto', seccion: 'Muestra' },
  { key: 'color', label: 'COLOR', rango: 'Cristalino', tipo: 'texto', seccion: 'Examen Físico' },
  { key: 'aspecto', label: 'ASPECTO', rango: 'Transparente', tipo: 'texto', seccion: 'Examen Físico' },
  { key: 'ph', label: 'PH', rango: '7.3 - 7.4', tipo: 'texto', seccion: 'Examen Físico' },
  { key: 'reaccion', label: 'REACCION', rango: '—', tipo: 'texto', seccion: 'Examen Físico' },
  { key: 'otros', label: 'OTROS', rango: '—', tipo: 'texto', seccion: 'Examen Físico' },

  // Luego de la Centrifugación
  { key: 'centrif_obs', label: 'OBS.', rango: '—', tipo: 'texto', seccion: 'Luego de la Centrifugación' },
  { key: 'centrif_color', label: 'COLOR', rango: '—', tipo: 'texto', seccion: 'Luego de la Centrifugación' },
  { key: 'centrif_aspecto', label: 'ASPECTO', rango: '—', tipo: 'texto', seccion: 'Luego de la Centrifugación' },

  // Examen Químico
  { key: 'quimico_glucosa', label: 'GLUCOSA', unidad: 'mg/dL', rango: '—', seccion: 'Examen Químico' },
  { key: 'quimico_proteinas', label: 'PROTEINAS', unidad: 'g/dL', rango: '—', seccion: 'Examen Químico' },
  { key: 'quimico_obs', label: 'OBSERVACIONES', rango: '—', tipo: 'texto', seccion: 'Examen Químico' },

  // Examen Microscópico
  { key: 'micro_leucocitos', label: 'LEUCOCITOS', unidad: '/mm³', rango: '—', seccion: 'Examen Microscópico' },
  { key: 'micro_pmn', label: 'PMN%', unidad: '%', rango: '—', seccion: 'Examen Microscópico' },
  { key: 'micro_mn', label: 'MN%', unidad: '%', rango: '—', seccion: 'Examen Microscópico' },
  { key: 'micro_no_procede_obs', label: 'NO PROCEDE A RECUENTO DIFERENCIA OBS.', rango: '—', tipo: 'texto', seccion: 'Examen Microscópico' },

  // Sedimento
  { key: 'sedimento_leucocitos', label: 'LEUCOCITOS', rango: '—', tipo: 'texto', seccion: 'Sedimento' },
  { key: 'sedimento_hematies', label: 'HEMATIES', rango: '—', tipo: 'texto', seccion: 'Sedimento' },
  { key: 'sedimento_bacterias', label: 'BACTERIAS', rango: '—', tipo: 'texto', seccion: 'Sedimento' },
  { key: 'sedimento_otros', label: 'OTROS', rango: '—', tipo: 'texto', seccion: 'Sedimento' },
];

// ── 7. TOLERANCIA A LA GLUCOSA ──
export const CATALOGO_GLUCOSA: ParametroLab[] = [
  { key: 'basal', label: 'BASAL', unidad: 'mg/dL', rango: '70 - 100', min: 70, max: 100, seccion: 'Prueba de Tolerancia' },
  { key: 'hora_basal', label: 'HORA', rango: '—', tipo: 'texto', seccion: 'Prueba de Tolerancia' },
  { key: 'resultado_glucosa1', label: '1HORA', unidad: 'mg/dL', rango: '< 180', min: 0, max: 180, seccion: 'Prueba de Tolerancia' },
  { key: 'hora_1h', label: 'HORA', rango: '—', tipo: 'texto', seccion: 'Prueba de Tolerancia' },
  { key: 'resultado_glucosa2', label: '2 HORA', unidad: 'mg/dL', rango: '< 140', min: 0, max: 140, seccion: 'Prueba de Tolerancia' },
  { key: 'hora_2h', label: 'HORA', rango: '—', tipo: 'texto', seccion: 'Prueba de Tolerancia' },
];

export interface CategoriaLab {
  id: string;
  label: string;
  total: number;
  catalogo: ParametroLab[];
  storage: StorageLab;
  sinPDF?: boolean;
}

// Array Principal de Categorías
export const CATEGORIAS_LAB: CategoriaLab[] = [
  { id: 'hemograma', label: 'Hemograma', total: CATALOGO_HEMOGRAMA.length, catalogo: CATALOGO_HEMOGRAMA, storage: { mode: 'flat', tipoLab: 'Lab_Hemato' } },
  { id: 'coagulograma', label: 'Coagulograma', total: CATALOGO_COAGULOGRAMA.length, catalogo: CATALOGO_COAGULOGRAMA, storage: { mode: 'flat', tipoLab: 'Lab_Coagulo' } },
  { id: 'quimica', label: 'Química Sanguínea', total: CATALOGO_QUIMICA.length, catalogo: CATALOGO_QUIMICA, storage: { mode: 'nested', bag: 'quimicaDatos', tipoLab: 'Lab_Quimica' } },
  { id: 'serologia', label: 'Serología', total: CATALOGO_SEROLOGIA.length, catalogo: CATALOGO_SEROLOGIA, storage: { mode: 'nested', bag: 'serologiaDatos', tipoLab: 'Lab_Serologia' } },
  { id: 'ego', label: 'Examen General de Orina', total: CATALOGO_EGO.length, catalogo: CATALOGO_EGO, storage: { mode: 'nested', bag: 'egoDatos', tipoLab: 'Lab_EGO' } },
  { id: 'liquidos', label: 'Líquidos Biológicos', total: CATALOGO_LIQUIDOS.length, catalogo: CATALOGO_LIQUIDOS, storage: { mode: 'nested', bag: 'liquidosDatos', tipoLab: 'Lab_Liquidos' } },
  { id: 'glucosa', label: 'Tolerancia a la Glucosa', total: CATALOGO_GLUCOSA.length, catalogo: CATALOGO_GLUCOSA, storage: { mode: 'nested', bag: 'glucosaFija', tipoLab: 'Lab_Glucosa_Curva' } },
];