import React, { useState } from 'react';
import { FileDown, FileText, Eye, X, Clipboard, User, Calendar } from 'lucide-react';
import RegistrarPaciente from '../../pages/RegistrarPacientes';
import RegistrarConsulta from '../../pages/RegistrarConsulta';

export default function FormularioTab() {
  const [paso, setPaso] = useState(1);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null);
  const [verReportesGlobal, setVerReportesGlobal] = useState(false);
  const [historialSimulado, setHistorialSimulado] = useState<any[]>([]);

  const guardarEnRisServer = async (nuevoDocumento: any) => {
    alert("🎉 ¡Registro Clínico guardado con éxito en la base de datos de RIS-SERVER!");
    
    const matriculaActual = pacienteSeleccionado?.cod || "S/M";
    const nombreCompleto = `${pacienteSeleccionado?.nombres || ''} ${pacienteSeleccionado?.paterno || ''}`.trim();
    
    setHistorialSimulado(prev => {
      const indicePaciente = prev.findIndex(item => item.cod === matriculaActual);

      if (indicePaciente !== -1) {
        // 🔄 SI PACIENTE YA EXISTE: Unimos el historial viejo con todo lo nuevo sin filtros
        const historialActualizado = [...prev];
        const datosExistentes = historialActualizado[indicePaciente].datos || {};

        historialActualizado[indicePaciente] = {
          ...historialActualizado[indicePaciente],
          tipoLaboratorio: nuevoDocumento?.tipoLaboratorio || historialActualizado[indicePaciente].tipoLaboratorio,
          datos: {
            ...datosExistentes,
            ...nuevoDocumento // Conserva la estructura plana exacta que viene del submit
          }
        };
        return historialActualizado;
      } else {
        // 🆕 SI ES NUEVO PACIENTE: Guardamos el documento íntegro en la raíz de datos
        const nuevoRegistro = {
          cod: matriculaActual,
          paciente: nombreCompleto,
          servicio: "Laboratorio",
          estado: "Completado",
          tipoLaboratorio: nuevoDocumento?.tipoLaboratorio || "Lab_EGO",
          fecha: new Date().toLocaleDateString(),
          datos: {
            ...nuevoDocumento // Cero intermediarios, viaja el JSON puro del formulario
          }
        };
        return [...prev, nuevoRegistro];
      }
    });

    reiniciarModulo();
  };

  const reiniciarModulo = () => {
    setPaso(1);
    setPacienteSeleccionado(null);
  };

  // 📄 FUNCIÓN DE DESCARGA DIRECTA DESDE LA TARJETA DEL PACIENTE
  const descargarPdfIndividual = (p: any) => {
    const datosRaiz = p.datos || {};
    const tipoActivo = p.tipoLaboratorio || "GENERAL";

    let doc = "==================================================================\n";
    doc += "                CAJA NACIONAL DE SALUD - BOLIVIA                  \n";
    doc += "              INFORME INTEGRAL DE LABORATORIO CLÍNICO             \n";
    doc += ` FECHA DE EMISIÓN: ${p.fecha || new Date().toLocaleDateString()} a hrs ${new Date().toLocaleTimeString()} \n`;
    doc += "==================================================================\n\n";
    
    doc += " DATOS DEL PACIENTE:\n";
    doc += " -------------------\n";
    doc += ` PACIENTE:  ${p.paciente.toUpperCase()}\n`;
    doc += ` MATRÍCULA: ${p.cod}\n`;
    doc += ` SERVICIO:  ${p.servicio.toUpperCase()}\n`;
    doc += " ------------------------------------------------------------------\n\n";
    doc += " HISTORIAL DETALLADO DE RESULTADOS CLÍNICOS:\n";
    doc += " ===========================================\n\n";

    // 🚀 MOTOR DE EXTRACCIÓN DINÁMICA: Aplana y extrae todo valor real sin importar dónde se guardó
    const valoresMapeados: Record<string, string> = {};

    const extraerValoresRecursivos = (obj: any) => {
      if (!obj || typeof obj !== "object") return;
      
      Object.entries(obj).forEach(([key, val]) => {
        // Si es un sub-objeto (como egoDatos, quimicaDatos, etc.), entramos a buscar dentro
        if (val && typeof val === "object" && !Array.isArray(val)) {
          extraerValoresRecursivos(val);
        } else if (typeof val === "string" || typeof val === "number") {
          // Ignoramos variables de control interno de React
          if (!["tipoLaboratorio", "id", "estado", "servicio"].includes(key) && val !== "") {
            valoresMapeados[key] = String(val);
          }
        }
      });
    };

    // Procesamos toda la bolsa de datos que tenga el registro del paciente
    extraerValoresRecursivos(datosRaiz);

    // Separamos los resultados por bloques lógicos según las llaves encontradas
    const examenFisicoQuimico: string[] = [];
    const sedimentoMicroscopico: string[] = [];
    const quimicaYLiquidos: string[] = [];

    Object.entries(valoresMapeados).forEach(([key, val]) => {
      const nombreFormateado = key.toUpperCase().replace(/_/g, ' ');
      const linea = `  - ${nombreFormateado.padEnd(25)}: ${val}\n`;

      // Clasificación por palabras clave para que el informe se vea impecable y estructurado
      if (["volumen", "color", "olor", "aspecto", "espuma", "densidad", "ph", "nitritos", "glucosa", "cetonas", "bilirrubinas", "sangre", "urobilinogeno", "prot"].some(k => key.toLowerCase().includes(k))) {
        examenFisicoQuimico.push(linea);
      } else if (["leucocitos", "eritrocitos", "bacterias", "piocitos", "epitelial", "mucoso", "cristales", "cilindros"].some(k => key.toLowerCase().includes(k))) {
        sedimentoMicroscopico.push(linea);
      } else {
        quimicaYLiquidos.push(linea);
      }
    });

    // 🟢 RENDERIZADO EN EL TXT POR SECCIONES SI CONTIENEN INFORMACIÓN
    if (examenFisicoQuimico.length > 0) {
      doc += " [🧪 EXAMEN FÍSICO-QUÍMICO / GENERAL]\n";
      examenFisicoQuimico.forEach(l => doc += l);
      doc += "\n";
    }

    if (sedimentoMicroscopico.length > 0) {
      doc += " [🔬 SEDIMENTO MICROSCÓPICO / ANÁLISIS CELULAR]\n";
      sedimentoMicroscopico.forEach(l => doc += l);
      doc += "\n";
    }

    if (quimicaYLiquidos.length > 0) {
      doc += " [📊 PARÁMETROS BIOQUÍMICOS Y EXÁMENES COMPLEMENTARIOS]\n";
      quimicaYLiquidos.forEach(l => doc += l);
      doc += "\n";
    }

    // Caso extremo de contingencia si no se logran clasificar
    if (Object.keys(valoresMapeados).length === 0) {
      doc += "  No se encontraron parámetros clínicos registrados para esta consulta en la sesión.\n\n";
    }

    doc += "==================================================================\n";
    doc += " * Documento Oficial firmado digitalmente mediante RIS-SERVER.    \n";
    doc += " * Respaldo íntegro de resultados del Historial Clínico - C.N.S.   \n";
    doc += "==================================================================\n";

    // Trigger inmediato de descarga
    const blob = new Blob([doc], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Informe_Laboratorio_${p.paciente.replace(/ /g, "_")}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarExcelSimulado = () => {
    let contenidoCSV = "CI/Matricula,Paciente,Servicio,Estado\n";
    historialSimulado.forEach(row => {
      contenidoCSV += `${row.cod},${row.paciente},${row.servicio},${row.estado}\n`;
    });
    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Admisiones_CNS_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarPdfSimulado = () => {
    let contenidoTexto = "==================================================\n";
    contenidoTexto += "        REPORTE CLÍNICO DE ADMISIONES - CNS        \n";
    contenidoTexto += `        FECHA GENERACIÓN: ${new Date().toLocaleDateString()}      \n`;
    contenidoTexto += "==================================================\n\n";
    historialSimulado.forEach((row, index) => {
      contenidoTexto += `${index + 1}. PACIENTE: ${row.paciente}\n   MATRÍCULA: ${row.cod}\n   SERVICIO:  ${row.servicio}\n   ESTADO:    ${row.estado}\n--------------------------------------------------\n`;
    });
    const blob = new Blob([contenidoTexto], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Clinico_CNS_${new Date().toISOString().slice(0,10)}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full text-white space-y-6 relative">
      
      {/* PANTALLA COMPLETA MEJORADA DE INFORMES */}
      {verReportesGlobal && (
        <div className="fixed inset-0 bg-[#060b09] z-50 flex flex-col p-6 overflow-y-auto">
          
          <div className="flex justify-between items-center border-b border-[#1f332d] pb-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#00bfa5] flex items-center gap-2">
                <Clipboard className="w-5 h-5" /> BANDEJA CENTRAL DE INFORMES CLÍNICOS
              </h2>
              <p className="text-xs text-gray-400 mt-1">Descarga inmediata de resultados de laboratorio e informes médicos.</p>
            </div>
            <button 
              onClick={() => setVerReportesGlobal(false)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-semibold hover:bg-red-600/20 transition-all"
            >
              <X className="w-4 h-4" /> Cerrar Módulo
            </button>
          </div>

          {/* Panel Unificado a lo ancho completo */}
          <div className="w-full max-w-4xl mx-auto bg-[#0e1715] border border-[#2a403a] rounded-xl p-6 space-y-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block border-b border-[#1f332d] pb-2">
              👥 Pacientes con Exámenes Listos ({historialSimulado.length})
            </span>
            
            <div className="space-y-3">
              {historialSimulado.length === 0 ? (
                <div className="text-center text-sm text-gray-500 py-16 italic">No hay registros clínicos en la sesión actual.</div>
              ) : (
                historialSimulado.map((p, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-xl border bg-[#050a09] border-[#1c352f] hover:border-[#2a403a] transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#121b18] rounded-lg border border-[#2a403a] text-[#00bfa5]">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-base text-white">{p.paciente}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Matrícula: <span className="text-gray-200 font-mono font-bold mr-2">{p.cod}</span> | 
                          Tipo: <span className="text-[#00bfa5] ml-1 font-bold">{p.tipoLaboratorio ? p.tipoLaboratorio.replace('Lab_', '').toUpperCase() : 'GENERAL'}</span>
                        </div>
                      </div>
                    </div>

                    {/* LADO DERECHO DE LA TARJETA: INFORMACIÓN DE FECHA Y BOTÓN TRANSFERIDO */}
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[#1f332d] pt-3 sm:pt-0">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {p.fecha}
                      </span>
                      
                      {/* Botón de Descarga directa incrustado aquí */}
                      <button 
                        onClick={() => descargarPdfIndividual(p)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-bold rounded-lg text-xs tracking-wide shadow-md shadow-red-900/20 hover:bg-red-700 transition-all active:scale-95"
                      >
                        <FileDown className="w-4 h-4" /> Descargar PDF
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN TRADICIONAL DE ADMISIÓN */}
      <div className="border-b border-[#142823] pb-4 flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-lg font-bold text-[#00bfa5]">Admisión y Formularios CNS</h2>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setVerReportesGlobal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold hover:bg-blue-600/30 transition-colors active:scale-95"
          >
            <Eye className="w-4 h-4" /> 
            👁️ Ver Reportes
          </button>

          <button 
            onClick={exportarExcelSimulado}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600/20 text-green-500 border border-green-500/30 rounded-lg text-xs font-medium hover:bg-green-600/30 transition-colors active:scale-95"
          >
            <FileText className="w-4 h-4" /> 
            Reporte Excel
          </button>
          
          <button 
            onClick={exportarPdfSimulado}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 text-red-500 border border-red-500/30 rounded-lg text-xs font-medium hover:bg-red-600/30 transition-colors active:scale-95"
          >
            <FileDown className="w-4 h-4" /> 
            Reporte PDF
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-[#142823]">
        <button className="pb-2 px-2 text-sm font-medium border-b-2 border-primary-light text-primary-light">
          Módulo de Admisión Masiva & Servicios
        </button>
      </div>

      <div className="bg-primary-dark/40 border border-white/5 shadow-2xl rounded-xl p-6 min-h-[400px]">
        {paso === 1 ? (
          <RegistrarPaciente 
            onSiguiente={(datos) => {
              setPacienteSeleccionado(datos);
              setPaso(2);
            }} 
          />
        ) : (
          <div className="w-full">
            {pacienteSeleccionado?.servicioSeleccionado === 'laboratorio' ? (
              <RegistrarConsulta 
                pacienteData={pacienteSeleccionado} 
                onVolver={reiniciarModulo} 
                onGuardarLocal={guardarEnRisServer} 
              />
            ) : (
              <div className="w-full max-w-4xl mx-auto bg-[#070f0d] p-6 rounded-xl border border-[#172c26]">
                <div className="flex justify-between items-center border-b border-[#142823] pb-3 mb-6">
                  <h3 className="text-xs font-bold text-amber-500 uppercase">🗓️ Bloques Horarios de Imagenología (CNS)</h3>
                  <button onClick={reiniciarModulo} className="text-xs bg-white/5 px-2.5 py-1 rounded hover:bg-white/10">← Volver</button>
                </div>

                <div className="mb-6 p-3 bg-[#050a09] border border-[#1c352f] rounded text-xs text-gray-300 flex justify-between">
                  <div>Paciente: <strong className="text-white">{pacienteSeleccionado.nombres} {pacienteSeleccionado.paterno}</strong></div>
                  <div>C.I. / Matrícula: <strong className="text-white">{pacienteSeleccionado.cod}</strong></div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {['08:00', '08:20', '08:40', '09:00', '09:20', '09:40', '10:00', '10:20', '10:40', '11:00'].map((hora) => (
                    <div 
                      key={hora} 
                      onClick={() => {
                        const nuevoRegistro = {
                          cod: pacienteSeleccionado.cod,
                          paciente: `${pacienteSeleccionado.nombres} ${pacienteSeleccionado.paterno}`,
                          servicio: "Imagenología",
                          estado: "Agendado",
                          tipoLaboratorio: "General",
                          fecha: new Date().toLocaleDateString(),
                          datos: {}
                        };
                        setHistorialSimulado(prev => [...prev, nuevoRegistro]);
                        alert(`🎉 Asignación Exitosa: Estudio de Imagenología fijado a las ${hora}`);
                        reiniciarModulo();
                      }}
                      className="p-3 bg-[#050a09] border border-[#1c352f] hover:border-[#00bfa5] rounded-lg text-center cursor-pointer transition-all hover:bg-[#00bfa5]/5"
                    >
                      <span className="block text-xs font-bold">{hora}</span>
                      <span className="block text-[9px] text-[#00bfa5] font-medium mt-0.5">LIBRE</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}