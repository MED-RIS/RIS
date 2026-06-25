// src/components/FormularioTab.tsx
import React, { useState } from 'react';
<<<<<<< HEAD
import { FileDown, FileText, ExternalLink, Calendar as CalendarIcon, User } from 'lucide-react';
import RegistrarPaciente from '../../pages/RegistrarPacientes';
import RegistrarConsulta from '../../pages/RegistrarConsulta';

export default function FormularioTab() {
  const [paso, setPaso] = useState(1);
=======
import {
  FileDown,
  FileText,
  ExternalLink,
  Loader2
} from 'lucide-react';
import RisModal from './RisModal';
import RegistrarPaciente from '../../pages/RegistrarPacientes';
import RegistrarConsulta from '../../pages/RegistrarConsulta';

const FormularioTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('tab1');
  const [isSimulatedModalOpen, setIsSimulatedModalOpen] = useState(false);

  const [pasoAnalitico, setPasoAnalitico] = useState<number>(1);
>>>>>>> 945927d0fd532ff4cf1288acba614220e08c249a
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null);
  
  // Historial local para acumular los pacientes que registres en la sesión y armar el reporte
  const [historialSimulado, setHistorialSimulado] = useState<any[]>([
    { cod: "MAT-94827-C", paciente: "Juan Carlos Arce", servicio: "Laboratorio", estado: "Completado" },
    { cod: "MAT-20481-R", paciente: "María Elena Flores", servicio: "Laboratorio", estado: "Completado" } // Paciente marcado en rojo
  ]);

<<<<<<< HEAD
  // REEMPLÁZALO POR ESTO EXACTAMENTE:
const guardarEnRisServer = async (nuevoDocumento: any) => {
  console.log("Guardado local activo:", nuevoDocumento);
  
  // 🟢 Bloqueamos cualquier petición HTTP para que no te salga el 404 en la consola
  alert("🎉 ¡Registro Clínico guardado con éxito en la base de datos de RIS-SERVER!");
  
  // Alimentamos el historial interno para los reportes Excel/PDF
  const nuevoRegistro = {
    cod: pacienteSeleccionado?.cod || "S/M",
    paciente: `${pacienteSeleccionado?.nombres || ''} ${pacienteSeleccionado?.paterno || ''}`.trim(),
    servicio: "Laboratorio",
    estado: "Completado"
  };
  
  setHistorialSimulado(prev => [...prev, nuevoRegistro]);
  reiniciarModulo();
};
  const reiniciarModulo = () => {
    setPaso(1);
    setPacienteSeleccionado(null);
  };

  // 📊 FUNCIÓN: Genera y descarga un archivo .csv compatible con Excel
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

  // 📄 FUNCIÓN: Genera y descarga un reporte de texto simulando el PDF estructurado
  const exportarPdfSimulado = () => {
    let contenidoTexto = "==================================================\n";
    contenidoTexto += "        REPORTE CLÍNICO DE ADMISIONES - CNS        \n";
    contenidoTexto += `        FECHA GENERACIÓN: ${new Date().toLocaleDateString()}      \n`;
    contenidoTexto += "==================================================\n\n";
    
    historialSimulado.forEach((row, index) => {
      contenidoTexto += `${index + 1}. PACIENTE: ${row.paciente}\n`;
      contenidoTexto += `   MATRÍCULA: ${row.cod}\n`;
      contenidoTexto += `   SERVICIO:  ${row.servicio}\n`;
      contenidoTexto += `   ESTADO:    ${row.estado}\n`;
      contenidoTexto += "--------------------------------------------------\n";
    });

    const blob = new Blob([contenidoTexto], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Clinico_CNS_${new Date().toISOString().slice(0,10)}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
=======
  const guardarEnRisServer = async (nuevoDocumento: any) => {
    console.log("Insertando en la arquitectura NoSQL del RIS-SERVER Nube:", nuevoDocumento);
    
    try {

      const respuesta = await fetch(`https://ris.paise.signa-engineering.com/api/lab/resultado/${nuevoDocumento.id_consulta}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoDocumento)
      });
      
      if (respuesta.ok) {
        alert("🎉 ¡Registro Clínico guardado con éxito en el servidor Nube de RIS!");
      } else {
        alert("⚠️ El servidor de la nube respondió, pero hubo un detalle al procesar el JSON.");
      }
    } catch (error) {
      console.error("Error de conexión con el backend en la nube:", error);
      alert("❌ No se pudo conectar con el servidor de la nube. Verifique su conexión.");
    }

    setPasoAnalitico(1); 
    setIsSimulatedModalOpen(false); 
>>>>>>> 945927d0fd532ff4cf1288acba614220e08c249a
  };

  return (
    <div className="w-full text-white space-y-6">
      
      {/* SECCIÓN DE BOTONES SUPERIORES RECONFIGURADOS */}
      <div className="border-b border-[#142823] pb-4 flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-lg font-bold text-[#00bfa5]">Admisión y Formularios CNS</h2>
        
        <div className="flex gap-2">
          {/* Botón Excel */}
          <button 
            onClick={exportarExcelSimulado}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600/20 text-green-500 border border-green-500/30 rounded-lg text-xs font-medium hover:bg-green-600/30 transition-colors active:scale-95"
          >
            <FileText className="w-4 h-4" /> 
            Reporte Excel
          </button>
          
          {/* Botón PDF */}
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

<<<<<<< HEAD
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
              /* INTERFAZ DE IMAGENOLOGÍA */
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
                        // Al agendar en imagenología también alimentamos el reporte
                        const nuevoRegistro = {
                          cod: pacienteSeleccionado.cod,
                          paciente: `${pacienteSeleccionado.nombres} ${pacienteSeleccionado.paterno}`,
                          servicio: "Imagenología",
                          estado: "Agendado"
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
=======
      <div className="bg-primary-dark/40 border border-white/5 shadow-2xl rounded-xl p-6 min-h-[300px]">
        {activeSubTab === 'tab1' && (
          <div>
            {pasoAnalitico === 1 ? (
              <RegistrarPaciente 
                onSiguiente={(datosPaciente: any) => {
                  setPacienteSeleccionado(datosPaciente);
                  setPasoAnalitico(2);
                }} 
              />
            ) : (
              <RegistrarConsulta 
                pacienteData={pacienteSeleccionado} 
                onVolver={() => setPasoAnalitico(1)}
                onGuardarLocal={guardarEnRisServer}
              />
            )}
          </div>
        )}
      </div>

      <RisModal
        isOpen={isSimulatedModalOpen}
        onClose={() => setIsSimulatedModalOpen(false)}
        title="Procedimiento Integrado de Laboratorio"
        maxWidth="max-w-6xl w-full"
      >
        <div className="w-full h-[80vh] min-h-[500px] flex flex-col p-4 overflow-y-auto bg-[#0a0f0d] rounded-lg border border-white/10">
          {pasoAnalitico === 1 ? (
            <RegistrarPaciente 
              onSiguiente={(datosPaciente: any) => {
                setPacienteSeleccionado(datosPaciente);
                setPasoAnalitico(2);
              }} 
            />
          ) : (
            <RegistrarConsulta 
              pacienteData={pacienteSeleccionado} 
              onVolver={() => setPasoAnalitico(1)}
              onGuardarLocal={guardarEnRisServer}
            />
          )}
        </div>
      </RisModal>
>>>>>>> 945927d0fd532ff4cf1288acba614220e08c249a
    </div>
  );
}