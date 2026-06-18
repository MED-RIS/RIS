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
  [key: string]: any;
};

type MedicionExtra = {
  [key: string]: any;
};

import FormGlucosa from '../RisWorklist/components/FormGlucosa';
import FormHemograma from '../RisWorklist/components/FormHemograma';
import FormEgo from '../RisWorklist/components/FormEgo'; 
import FormQuimica from '../RisWorklist/components/FormQuimica';
import FormSerologia from '../RisWorklist/components/FormSerologia';
import FormLiquidos from '../RisWorklist/components/FormLiquidos';

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
    consultorio: 'Ginecología',
    medico_solicitante: '',
    fecha_solicitud: new Date().toISOString().split('T')[0],
    diagnostico: '',
    responsable: 'Heidy Arancibia'
  });

  const [tipoLaboratorio, setTipoLaboratorio] = useState<string>('Lab_Glucosa_Curva');

  const [glucosaFija, setGlucosaFija] = useState({ basal: 0, hora_basal: '', momento_medicion1: '1h', resultado_glucosa1: 0, momento_medicion2: '2h', resultado_glucosa2: 0 });
  const [medicionesExtra, setMedicionesExtra] = useState<MedicionExtra[]>([]);
  const [hematoDatos, setHematoDatos] = useState({ hto: 0, hb: 0, globulos_blancos: 0, seg: 0, linf: 0, plaquetas: 0, grupo_sanguineo: '', reticulocitos: 0, ves1hora: 0, indice_katz: 0, t_sangria_min: 0, t_sangria_seg: 0, t_coagulacion_min: 0, t_coagulacion_seg: 0, t_protrombina: 0, observaciones: '' });
  const [egoDatos, setEgoDatos] = useState({ volumen: 0, color: '', aspecto: '', ph: 5.0, densidad: 1.020, prot: 'Negativo', glucosa: 'Normal', nitritos: 'Negativo', leucocitos: '', eritrocitos: '', bacterias: 'Escasas', cel_epiteliales: 'Escasas', obs1: '' });
  const [quimicaDatos, setQuimicaDatos] = useState({ glucemia_mgdl: 0, Hb_glicosilada_pct: 0, urea_mgdl: 0, creatinina_mgdl: 0, acido_urico_mgdl: 0, colesterol_mgdl: 0, trigliceridos_mgdl: 0, HDL_mgdl: 0, sodio_meql: 0, potasio_meql: 0, cloro_meql: 0, observaciones: '' });
  const [serologiaDatos, setSerologiaDatos] = useState({ pcr: 'Negativo', factor_reumatoideo: 'Negativo', aso: '', chagas: 'No Reactivo', tifico_o: '', tifico_h: '', paratifico: '', observaciones: '' });
  const [liquidosDatos, setLiquidosDatos] = useState({ tipo_liquido: '', aspecto: '', recuento_celular: 0, promedio: '', glucosa: 0, proteinas: 0, ldh: 0, observaciones: '' });

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

    let resultadoDatos: any = {};
    let dinamicos: MedicionExtra[] = [];

    // Mapeo dinámico del JSON según el tipo de laboratorio para MongoDB
    if (tipoLaboratorio === 'Lab_Glucosa_Curva') {
      resultadoDatos = glucosaFija;
      dinamicos = medicionesExtra;
    } else if (tipoLaboratorio === 'Lab_Hemato_Coag') {
      resultadoDatos = hematoDatos;
    } else if (tipoLaboratorio === 'Lab_EGO') {
      resultadoDatos = egoDatos;
    } else if (tipoLaboratorio === 'Lab_Quimica_Electrolitos') {
      resultadoDatos = quimicaDatos;
    } else if (tipoLaboratorio === 'Lab_Serologia') {
      resultadoDatos = serologiaDatos;
    } else if (tipoLaboratorio === 'Lab_Liquidos') {
      resultadoDatos = liquidosDatos;
    }

    const payloadCompleto = {
      paciente: pacienteData,
      id_consulta: Date.now(),
      datos_orden: consulta,
      nombre_laboratorio: tipoLaboratorio,
      resultado_datos: resultadoDatos,
      resultados_dinamicos: dinamicos
    };

    console.log("Documento estructurado listo para MongoDB:", payloadCompleto);

    try {
      console.log("Simulando respuesta exitosa del servidor localmente...");
      alert(`🎉 ¡Simulación Exitosa! El laboratorio [${tipoLaboratorio}] se procesó localmente.`);
      onGuardarLocal(payloadCompleto);
    } catch (error: any) {
      console.error("Error crítico en el canal de red HTTP:", error);
      alert(`❌ Error al guardar el registro: ${error.message || 'Error de comunicación'}`);
    } finally {
      setEstaCargando(false);
    }
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#a0b2ae' }}>Médico Solicitante:</label>
                <input type="text" name="medico_solicitante" value={consulta.medico_solicitante || ''} onChange={handleConsultaChange} required style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#a0b2ae' }}>Policlínico:</label>
                <input type="text" name="policlinico" value={consulta.policlinico || ''} onChange={handleConsultaChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', marginTop: '4px' }} />
              </div>
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ fontSize: '12px', color: '#a0b2ae' }}>Diagnóstico de Orientación:</label>
              <textarea name="diagnostico" value={consulta.diagnostico || ''} onChange={handleConsultaChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', height: '45px', resize: 'none', marginTop: '4px' }} />
            </div>
          </fieldset>

          {/* SELECTOR DE MÓDULO ACTUALIZADO CON LAS 6 OPCIONES DE LA GUÍA */}
          <div style={{ padding: '15px', backgroundColor: '#002d21', borderRadius: '8px', border: '1px solid #005a43', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontWeight: 'bold', color: '#00bfa5', fontSize: '14px' }}>🧪 Seleccionar Tipo de Laboratorio:</label>
            <select value={tipoLaboratorio} onChange={(e) => setTipoLaboratorio(e.target.value)} style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '4px', backgroundColor: '#0a0f0d', color: '#fff', border: '1px solid #005a43', width: '55%', cursor: 'pointer' }}>
              <option value="Lab_Glucosa_Curva">Curva de Glucosa (LAB_01)</option>
              <option value="Lab_Hemato_Coag">Hematología y Coagulograma (LAB_02)</option>
              <option value="Lab_EGO">Examen General de Orina (LAB_03)</option>
              <option value="Lab_Quimica_Electrolitos">Química Sanguínea y Electrolitos (LAB_04)</option>
              <option value="Lab_Serologia">Serología e Inmunología (LAB_05)</option>
              <option value="Lab_Liquidos">Análisis de Líquidos Corporales (LAB_06)</option>
            </select>
          </div>

          {/* RENDERIZADO CONDICIONAL DE TODAS LAS PLANTILLAS ANALÍTICAS */}
          <div style={{ backgroundColor: '#16221f', borderRadius: '8px', border: '1px solid #1f332d', padding: '5px' }}>
            {tipoLaboratorio === 'Lab_Glucosa_Curva' && (
              <FormGlucosa glucosaFija={glucosaFija} setGlucosaFija={setGlucosaFija} medicionesExtra={medicionesExtra} setMedicionesExtra={setMedicionesExtra} />
            )}
            {tipoLaboratorio === 'Lab_Hemato_Coag' && (
              <FormHemograma hematoDatos={hematoDatos} setHematoDatos={setHematoDatos} />
            )}
            {tipoLaboratorio === 'Lab_EGO' && (
              <FormEgo egoDatos={egoDatos} setEgoDatos={setEgoDatos} />
            )}
            {tipoLaboratorio === 'Lab_Quimica_Electrolitos' && (
              <FormQuimica quimicaDatos={quimicaDatos} setQuimicaDatos={setQuimicaDatos} />
            )}
            {tipoLaboratorio === 'Lab_Serologia' && (
              <FormSerologia serologiaDatos={serologiaDatos} setSerologiaDatos={setSerologiaDatos} />
            )}
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