import React from 'react';
import { FileDown } from 'lucide-react';

interface VerResultadosProps {
  tipoLaboratorio: string;
  glucosaFija?: any;
  hematoDatos?: any;
  quimicaDatos?: any;
  egoDatos?: any;
  serologiaDatos?: any;
  widalDatos?: any;
  microDatos?: any;
  liquidosDatos?: any;
  nombrePaciente?: string;
  matriculaPaciente?: string;
}

export default function VerResultadosMedicos({
  tipoLaboratorio,
  glucosaFija = {},
  hematoDatos = {},
  quimicaDatos = {},
  egoDatos = {},
  serologiaDatos = {},
  widalDatos = {},
  microDatos = {},
  liquidosDatos = {},
  nombrePaciente = "Paciente General",
  matriculaPaciente = "S/M"
}: VerResultadosProps) {

  // 🚨 DETECCIÓN DE EMERGENCIA: Si viene vacío o cruzado, forzamos el tipo correcto inspeccionando los datos reales
  let tipoActivo = tipoLaboratorio;
  const datosUnificados = { ...egoDatos, ...glucosaFija, ...widalDatos, ...microDatos, ...liquidosDatos };
  
  if (!tipoActivo || tipoActivo === "General") {
    if (datosUnificados.volumen || datosUnificados.densidad || datosUnificados.leucocitos) {
      tipoActivo = 'Lab_EGO';
    } else if (datosUnificados.tifico_o || datosUnificados.tifico_h) {
      tipoActivo = 'Lab_Widal';
    } else if (datosUnificados.basal || datosUnificados.resultado_glucosa1) {
      tipoActivo = 'Lab_Glucosa_Curva';
    }
  }

  const labelStyle = { display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '2px' };
  const valStyle = { display: 'block', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #1f332d', borderRadius: '4px', color: '#00bfa5', minHeight: '28px', fontSize: '13px' };
  const fieldsetStyle = { border: '1px solid #2a403a', padding: '12px', borderRadius: '6px', backgroundColor: '#121b18', marginBottom: '10px' };
  const legendStyle = { color: '#00bfa5', fontWeight: 'bold' as const, fontSize: '12px', padding: '0 6px' };

  const descargarPdfIndividual = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      let doc = "==================================================\n";
      doc += "        CAJA NACIONAL DE SALUD - INFORME CLÍNICO   \n";
      doc += `        FECHA DE EMISIÓN: ${new Date().toLocaleDateString()} \n`;
      doc += "==================================================\n\n";
      doc += `PACIENTE:  ${nombrePaciente.toUpperCase()}\n`;
      doc += `MATRÍCULA: ${matriculaPaciente}\n`;
      doc += `ESTUDIO:   ${tipoActivo.replace('Lab_', '').toUpperCase()}\n`;
      doc += "--------------------------------------------------\n\n";

      if (tipoActivo === 'Lab_EGO') {
        doc += "[🧪 EXAMEN FÍSICO-QUÍMICO]\n";
        doc += `Volumen:  ${datosUnificados.volumen || '-'}\n`;
        doc += `Color:    ${datosUnificados.color || '-'}\n`;
        doc += `Aspecto:  ${datosUnificados.aspecto || '-'}\n`;
        doc += `Densidad: ${datosUnificados.densidad || '-'}\n`;
        doc += `pH:       ${datosUnificados.ph || '-'}\n`;
        doc += `Nitritos: ${datosUnificados.nitritos || '-'}\n\n`;
        doc += "[🔬 SEDIMENTO MICROSCÓPICO]\n";
        doc += `Leucocitos:  ${datosUnificados.leucocitos || '-'}\n`;
        doc += `Eritrocitos: ${datosUnificados.eritrocitos || '-'}\n`;
        doc += `Bacterias:   ${datosUnificados.bacterias || '-'}\n`;
      } else if (tipoActivo === 'Lab_Glucosa_Curva') {
        doc += "[📈 TEST DE TOLERANCIA A LA GLUCOSA]\n";
        doc += `Muestra Basal:   ${datosUnificados.basal || '-'} a hrs ${datosUnificados.hora_basal || '-'}\n`;
        doc += `Medición 1 Hora: ${datosUnificados.resultado_glucosa1 || '-'} a hrs ${datosUnificados.hora_1h || '-'}\n`;
        doc += `Medición 2 Hora: ${datosUnificados.resultado_glucosa2 || '-'} a hrs ${datosUnificados.hora_2h || '-'}\n`;
        doc += `Observaciones:   ${datosUnificados.observaciones_glucosa || '-'}\n`;
      } else {
        // Reporte genérico de contingencia por si las llaves vienen planas
        doc += "[📊 RESULTADOS ADJUNTOS EN EL FORMULARIO]\n";
        Object.entries(datosUnificados).forEach(([key, val]) => {
          if (typeof val === 'string' || typeof val === 'number') {
            doc += `${key.toUpperCase()}: ${val}\n`;
          }
        });
      }

      doc += "\n\n==================================================\n";
      doc += " * Documento Oficial de validación inmediata RIS-SERVER. *\n";

      const blob = new Blob([doc], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Informe_${nombrePaciente.replace(/ /g, "_")}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Error al generar el archivo: " + err);
    }
  };

  return (
    <div style={{ backgroundColor: '#16221f', borderRadius: '8px', border: '1px solid #1f332d', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #00bfa5', paddingBottom: '5px', marginBottom: '10px' }}>
        <h3 style={{ color: '#fff', margin: 0, fontSize: '14px' }}>
          👁️ VISTA DE RESULTADOS CLÍNICOS
        </h3>
        
        <button 
          type="button"
          onClick={descargarPdfIndividual}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', zIndex: 100 }}
        >
          <FileDown className="w-4 h-4" /> Descargar PDF
        </button>
      </div>

      {/* Renderizado condicional usando nuestra variable de emergencia tipoActivo */}
      {tipoActivo === 'Lab_EGO' && (
        <div>
          <fieldset style={fieldsetStyle}>
            <legend style={legendStyle}>🧪 EGO - EXAMEN FÍSICO-QUÍMICO</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <div><span style={labelStyle}>VOLUMEN:</span><div style={valStyle}>{datosUnificados.volumen || '-'}</div></div>
              <div><span style={labelStyle}>COLOR:</span><div style={valStyle}>{datosUnificados.color || '-'}</div></div>
              <div><span style={labelStyle}>ASPECTO:</span><div style={valStyle}>{datosUnificados.aspecto || '-'}</div></div>
              <div><span style={labelStyle}>DENSIDAD:</span><div style={valStyle}>{datosUnificados.densidad || '-'}</div></div>
              <div><span style={labelStyle}>PH:</span><div style={valStyle}>{datosUnificados.ph || '-'}</div></div>
              <div><span style={labelStyle}>NITRITOS:</span><div style={valStyle}>{datosUnificados.nitritos || '-'}</div></div>
            </div>
          </fieldset>
          <fieldset style={fieldsetStyle}>
            <legend style={legendStyle}>🔬 EGO - SEDIMENTO MICROSCÓPICO</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <div><span style={labelStyle}>LEUCOCITOS:</span><div style={valStyle}>{datosUnificados.leucocitos || '-'}</div></div>
              <div><span style={labelStyle}>ERITROCITOS:</span><div style={valStyle}>{datosUnificados.eritrocitos || '-'}</div></div>
              <div><span style={labelStyle}>BACTERIAS:</span><div style={valStyle}>{datosUnificados.bacterias || '-'}</div></div>
            </div>
          </fieldset>
        </div>
      )}

      {tipoActivo === 'Lab_Glucosa_Curva' && (
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>📈 TEST DE TOLERANCIA A LA GLUCOSA</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div><span style={labelStyle}>MUESTRA BASAL:</span><div style={valStyle}>{datosUnificados.basal || '-'}</div></div>
            <div><span style={labelStyle}>HORA BASAL:</span><div style={valStyle}>{datosUnificados.hora_basal || '-'}</div></div>
            <div><span style={labelStyle}>MEDICIÓN 1 HORA:</span><div style={valStyle}>{datosUnificados.resultado_glucosa1 || '-'}</div></div>
            <div><span style={labelStyle}>HORA 1 HORA:</span><div style={valStyle}>{datosUnificados.hora_1h || '-'}</div></div>
            <div><span style={labelStyle}>MEDICIÓN 2 HORAS:</span><div style={valStyle}>{datosUnificados.resultado_glucosa2 || '-'}</div></div>
            <div><span style={labelStyle}>HORA 2 HORAS:</span><div style={valStyle}>{datosUnificados.hora_2h || '-'}</div></div>
          </div>
        </fieldset>
      )}

      <div style={{ fontSize: '11px', color: '#ffb300', textAlign: 'center', marginTop: '5px' }}>
        * Documento firmado digitalmente disponible para el Historial Clínico electrónico.
      </div>

    </div>
  );
}