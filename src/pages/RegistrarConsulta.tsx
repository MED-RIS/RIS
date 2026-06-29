import React, { useState } from 'react';

type Consulta = {
  id_consulta?: number;
  id_paciente?: number;
  emergencia?: boolean;
  policlinico?: string;
  consultorio?: string;
  medico_solicitante?: string;
  fecha_solicitud?: string;
  diagnostico?: string;
  responsable?: string;
  edad?: string;
  [key: string]: any;
};

type MedicionExtra = {
  [key: string]: any;
};

// IMPORTS DE LOS COMPONENTES (Alineados con tus nombres de archivos)
import FormGlucosa from '../RisWorklist/components/FormGlucosa';
import FormCoagulograma from '../RisWorklist/components/FormularioCoagulograma';
import FormularioHemograma from '../RisWorklist/components/FormularioHemograma'; 
import FormQuimica from '../RisWorklist/components/FormQuimica';
import FormElectrolitos from '../RisWorklist/components/FormElectrolitos';
import FormOrina24Hrs from '../RisWorklist/components/FormOrina24Hrs';
import FormSerologia from '../RisWorklist/components/FormSerologia';
import FormWidal from '../RisWorklist/components/FormWidal';
import FormMicroalbuminuria from '../RisWorklist/components/FormMicroalbuminuria';


import FormEgo from '../RisWorklist/components/FormEgo'; 


import FormLiquidos from '../RisWorklist/components/FormLiquidos';
import FormularioCoagulograma from '../RisWorklist/components/FormularioCoagulograma';

export interface RegistrarConsultaProps {
  pacienteData: any;
  onVolver: () => void;
  onGuardarLocal: (nuevoDocumento: any) => void;
}

export default function RegistrarConsulta({ pacienteData, onVolver, onGuardarLocal }: RegistrarConsultaProps) {
  const [estaCargando, setEstaCargando] = useState<boolean>(false);

  const [consulta, setConsulta] = useState<Partial<Consulta>>({
    id_consulta: Date.now(),
    id_paciente: pacienteData?.id_paciente || 1, 
    emergencia: false,
    policlinico: '',
    consultorio: '',
    medico_solicitante: '',
    fecha_solicitud: new Date().toISOString().split('T')[0],
    diagnostico: '',
    responsable: ''
  });

  // Iniciamos por defecto con el módulo de Hemograma
  const [tipoLaboratorio, setTipoLaboratorio] = useState<string>('Lab_Hemato');

  const [glucosaFija, setGlucosaFija] = useState({ basal: '', hora_basal: '', resultado_glucosa1: '', hora_1h: '', resultado_glucosa2: '', hora_2h: '', observaciones_glucosa: '' }); 
  const [medicionesExtra, setMedicionesExtra] = useState<MedicionExtra[]>([]);
  const [hematoDatos, setHematoDatos] = useState<any>({ hto: 0, hb: 0, globulos_blancos: 0, seg: 0, linf: 0, plaquetas: 0, grupo_sanguineo: '', reticulocitos: 0, ves1hora: 0, indice_katz: 0, t_sangria_min: 0, t_sangria_seg: 0, t_coagulacion_min: 0, t_coagulacion_seg: 0, t_protrombina: 0, observaciones: '' });
  const [microDatos, setMicroDatos] = useState({ micro_albumina: '', micro_creatinina: '', relacion_ac: '', observaciones_micro: '' });
  const [egoDatos, setEgoDatos] = useState({ volumen: '', color: '', olor: '', aspecto: '', espuma: '', otros_fisico: '', sedimento: '', densidad: '', ph: '', prot: '', glucosa: '', cetonas: '', bilirrubinas: '', sangre: '', urobilinogeno: '', nitritos: '', piocitos: '', leucocitos: '', eritrocitos: '', cel_epiteliales: '', bacterias: '', cel_renales: '', filamento_mucoso: '', cristales: '', cilindros_hialinos: '', cilindros_granuloso: '', cilindros_hematico: '', cilindros_cereo: '', cilindros_otros: '', observaciones1: '', observaciones2: '' });
  const [quimicaDatos, setQuimicaDatos] = useState({ glucemia_mgdl: 0, Hb_glicosilada_pct: 0, urea_mgdl: 0, creatinina_mgdl: 0, acido_urico_mgdl: 0, colesterol_mgdl: 0, trigliceridos_mgdl: 0, HDL_mgdl: 0, sodio_meql: 0, potasio_meql: 0, cloro_meql: 0, observaciones: '' });
  const [serologiaDatos, setSerologiaDatos] = useState({ pcr: 0, factor_reumatoideo: 0, aso: '', chagas: 0, tifico_o: '', tifico_h: '', paratifico: '', observaciones: '' });
 const [liquidosDatos, setLiquidosDatos] = useState({ tipo_liquido: '', volumen: '', color: '', aspecto: '', ph: '', reaccion: '', centrif_color: '', centrif_aspecto: '', centrif_obs: '', quimico_glucosa: '', quimico_proteinas: '', quimico_obs: '', micro_leucocitos: '', micro_pmn: '', micro_mn: '', micro_no_procede_obs: '', sedimento_leucocitos: '', sedimento_hematies: '', sedimento_bacterias: '', sedimento_otros: '', otros: '' });
const [widalDatos, setWidalDatos] = useState({
  widal_o: '',
  widal_h: '',
  widal_a: '',
  widal_b: '',
  observaciones_widal: ''
});

  const simularEscaneoQR = () => {
    setConsulta(prev => ({
      ...prev,
      medico_solicitante: 'Dra. Ana Gabriela Chambi C.',
      policlinico: 'Especialidades El Alto - CNS',
      diagnostico: 'Embarazo de 11.2 semanas por ECO precoz, Emesis Gravídica'
    }));
    setTipoLaboratorio('Lab_Quimica_Electrolitos');
    alert("¡Código QR de la Orden Médica CNS leído con éxito!");
  };

  const handleConsultaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConsulta({ ...consulta, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEstaCargando(true);

    // 📦 CONSOLIDACIÓN TOTAL DE DATOS PARA HEIDY (Paciente + Orden + Clínicos)
    const documentoConsolidado = {
      // 1️⃣ Filiación e Identificadores Base
      paciente: `${pacienteData?.nombres || 'De Prueba'} ${pacienteData?.paterno || ''}`.trim(),
      fecha: consulta.fecha_solicitud,
      codigoAsegurado: pacienteData?.cod || 'S/M', // Mapea tu Matrícula/Código de asegurado
      orden: consulta.id_consulta || 1,             // Mapea tu identificador numérico correlativo

      // 2️⃣ Datos Generales de la Orden (Capturados de los inputs)
      medico_solicitante: consulta.medico_solicitante || '',
      centro_asistencial: consulta.policlinico || '', 
      policlinico: consulta.policlinico || '',
      consultorio: consulta.consultorio || '',       
      servicio: consulta.policlinico || '',
      institucion: consulta.policlinico || '',

      // 3️⃣ Bolsas de datos clínicos de tus submódulos
      tipoLaboratorio: tipoLaboratorio,
      egoDatos: egoDatos,
      glucosaFija: glucosaFija,
      widalDatos: widalDatos,
      microDatos: microDatos,
      liquidosDatos: liquidosDatos,
      
      // Mapeamos los datos de hematología directo a la llave 'datos' para tu reporte
      datos: hematoDatos, 
      hematoDatos: hematoDatos,
      
      quimicaDatos: quimicaDatos,
      serologiaDatos: serologiaDatos,
      medicionesExtra: medicionesExtra || []
    };

    console.log("Desplegando historial clínico multi-formulario unificado:", documentoConsolidado);

    if (typeof onGuardarLocal === 'function') {
      await onGuardarLocal(documentoConsolidado);
    }

    setEstaCargando(false);
  };
  return (
    <div style={{ backgroundColor: '#0a0f0d', minHeight: '100vh', padding: '10px', color: '#ffffff', fontFamily: 'sans-serif' }}>
      
      <div style={{ maxWidth: '750px', margin: '10px auto 20px auto' }}>
        <button type="button" onClick={onVolver} style={{ background: 'none', border: 'none', color: '#00bfa5', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', textDecoration: 'underline' }}>
          ← Volver al Paso 1: Ficha del Paciente
        </button>
      </div>

      <div style={{ maxWidth: '750px', margin: '0 auto', backgroundColor: '#121b18', padding: '25px', borderRadius: '12px', border: '1px solid #005a43', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
        
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#00221a', border: '1px dashed #00bfa5', borderRadius: '8px', textAlign: 'center' }}>
          <span style={{ fontSize: '13px', color: '#a0b2ae', display: 'block', marginBottom: '8px' }}>🚀 Herramienta de Demostración para el Cliente:</span>
          <button type="button" onClick={simularEscaneoQR} style={{ padding: '8px 16px', backgroundColor: '#00bfa5', color: '#0a0f0d', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
            📷 [Simular Escaneo de Orden Médica]
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <fieldset style={{ padding: '20px', borderRadius: '8px', border: '1px solid #1f332d', backgroundColor: '#16221f' }}>
            <legend style={{ fontWeight: 'bold', color: '#00bfa5', padding: '0 10px' }}>Datos Generales de la Orden</legend>
            
            <div style={{ marginBottom: '15px', padding: '8px 12px', backgroundColor: '#0a0f0d', borderRadius: '4px', fontSize: '12px', borderLeft: '3px solid #005a43', color: '#e0e0e0' }}>
              👤 <strong>Paciente:</strong> {pacienteData?.nombres || 'De Prueba'} {pacienteData?.paterno || ''} | 🪪 <strong>Matrícula:</strong> {pacienteData?.cod || 'S/M'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
  <div>
    <label style={{ fontSize: '12px', color: '#a0b2ae' }}>Médico Solicitante:</label>
    <input type="text" name="medico_solicitante" value={consulta.medico_solicitante || ''} onChange={handleConsultaChange} required style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', marginTop: '4px' }} />
  </div>
  <div>
    <label style={{ fontSize: '12px', color: '#a0b2ae' }}>Policlínico:</label>
    <input type="text" name="policlinico" value={consulta.policlinico || ''} onChange={handleConsultaChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', marginTop: '4px' }} />
  </div>
  {/* 🏢 ¡INPUT DE CONSULTORIO AGREGADO AQUÍ! */}
  <div>
    <label style={{ fontSize: '12px', color: '#a0b2ae' }}>Consultorio:</label>
    <input type="text" name="consultorio" value={consulta.consultorio || ''} onChange={handleConsultaChange} placeholder="Ej. 104" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', marginTop: '4px' }} />
  </div>
</div>
          </fieldset>

          {/* SELECTOR CORREGIDO: SEPARADOS E INDEPENDIENTES */}
          <div style={{ padding: '15px', backgroundColor: '#002d21', borderRadius: '8px', border: '1px solid #005a43', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontWeight: 'bold', color: '#00bfa5', fontSize: '14px' }}>🧪 Seleccionar Tipo de Laboratorio:</label>
            <select value={tipoLaboratorio} onChange={(e) => setTipoLaboratorio(e.target.value)} style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '4px', backgroundColor: '#0a0f0d', color: '#fff', border: '1px solid #005a43', width: '55%', cursor: 'pointer' }}>
              <option value="Lab_Hemato">Hemograma</option>
              <option value="Lab_Coagulo">Coagulograma</option>
              <option value="Lab_Electrolitos">Electrolitos</option>
              <option value="Lab_Orina_24h">Orina de 24 Horas</option>
              <option value="Lab_Serologia">Serología</option>
              <option value="Lab_Widal">Reacción de Widal </option>
              <option value="Lab_Microalbuminuria">Microalbuminuria</option>
              <option value="Lab_EGO">Examen General de Orina</option>
              <option value="Lab_Liquidos">Análisis de Líquidos Corporales</option>
              <option value="Lab_Glucosa_Curva">Curva de Tolerancia a la Glucosa</option> 
              <option value="Lab_Quimica">Química Sanguínea y Electrolitos</option>
            </select>
          </div>

          {/* RENDERIZADO CONDICIONAL DE COPIAS LIMPIAS POR SEPARADO */}
          <div style={{ backgroundColor: '#16221f', borderRadius: '8px', border: '1px solid #1f332d', padding: '5px' }}>
  
  {/* 1. Curva de Glucosa */}
  {tipoLaboratorio === 'Lab_Glucosa_Curva' && (
    <FormGlucosa glucosaFija={glucosaFija} setGlucosaFija={setGlucosaFija} />
  )}

  {/* 2. Hemograma */}
  {tipoLaboratorio === 'Lab_Hemato' && (
    <FormularioHemograma hematoDatos={hematoDatos} setHematoDatos={setHematoDatos} />
  )}

  {/* 3. Coagulograma */}
  {tipoLaboratorio === 'Lab_Coagulo' && (
    <FormularioCoagulograma hematoDatos={hematoDatos} setHematoDatos={setHematoDatos} />
  )}

  {/* 4. Electrolitos Séricos */}
  {tipoLaboratorio === 'Lab_Electrolitos' && (
    <FormElectrolitos quimicaDatos={quimicaDatos} setQuimicaDatos={setQuimicaDatos} />
  )}

  {/* 5. Orina 24 Horas */}
  {tipoLaboratorio === 'Lab_Orina_24h' && (
    <FormOrina24Hrs egoDatos={egoDatos} setEgoDatos={setEgoDatos} />
  )}

  {/* 6. Serología */}
  {tipoLaboratorio === 'Lab_Serologia' && (
    <FormSerologia serologiaDatos={serologiaDatos} setSerologiaDatos={setSerologiaDatos} />
  )}

  {/* 7. Reacción de Widal */}
  {tipoLaboratorio === 'Lab_Widal' && (
    <FormWidal widalDatos={widalDatos} setWidalDatos={setWidalDatos} />
  )}

  {/* 8. Microalbuminuria */}
  {tipoLaboratorio === 'Lab_Microalbuminuria' && (
    <FormMicroalbuminuria microDatos={microDatos} setMicroDatos={setMicroDatos} />
  )}

  {/* 9. Examen General de Orina */}
  {tipoLaboratorio === 'Lab_EGO' && (
    <FormEgo egoDatos={egoDatos} setEgoDatos={setEgoDatos} />
  )}

  {/* 10. Química Sanguínea (Corregido el nombre de la condición) */}
  {tipoLaboratorio === 'Lab_Quimica' && (
    <FormQuimica quimicaDatos={quimicaDatos} setQuimicaDatos={setQuimicaDatos} />
  )}

  {/* 11. Líquidos Corporales */}
  {tipoLaboratorio === 'Lab_Liquidos' && (
    <FormLiquidos liquidosDatos={liquidosDatos} setLiquidosDatos={setLiquidosDatos} />
  )}

</div>

          <button type="submit" disabled={estaCargando} style={{ padding: '14px', backgroundColor: estaCargando ? '#16221f' : '#005a43', color: estaCargando ? '#a0b2ae' : 'white', border: estaCargando ? '1px solid #2a403a' : 'none', cursor: estaCargando ? 'not-allowed' : 'pointer', fontSize: '15px', borderRadius: '6px', fontWeight: 'bold', marginTop: '10px' }}>
            {estaCargando ? 'PROCESANDO...' : 'Guardar Registro Clínico Completo'}
          </button>

        </form>
      </div>
    </div>
  );
}