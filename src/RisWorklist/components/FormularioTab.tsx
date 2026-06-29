import React, { useState, useEffect } from 'react';
import { FileDown, Eye, X, Clipboard, User, Calendar, FolderOpen, Layers } from 'lucide-react';
import RegistrarPaciente from '../../pages/RegistrarPacientes';
import RegistrarConsulta from '../../pages/RegistrarConsulta';

// 🚀 IMPORTACIÓN DE REPORTES MODULARES (Mantiene el código limpio y ordenado)
import { imprimirHematologiaCNS } from '../reports/ReporteHematologia';
import { imprimirGrupoSanguineoCNS } from '../reports/ReporteGrupoSanguineo';
// Aquí irás importando tus otros reportes a medida que los crees:
// import { imprimirOrinaCNS } from '../RisWorklist/reports/ReporteOrina';

export default function FormularioTab() {
  const [paso, setPaso] = useState(1);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null);
  const [verReportesGlobal, setVerReportesGlobal] = useState(false);
  
  // Estados para la gestión de la nueva bandeja de dos columnas
  const [pacienteFichaActiva, setPacienteFichaActiva] = useState<any>(null);

  // 💾 PERSISTENCIA: Carga inicial desde LocalStorage para evitar borrados al actualizar (F5)
  const [historialSimulado, setHistorialSimulado] = useState<any[]>(() => {
    const datosGuardados = localStorage.getItem('ris_historial_cns');
    return datosGuardados ? JSON.parse(datosGuardados) : [];
  });

  // Sincronización automática con LocalStorage al detectar cambios en el historial
  useEffect(() => {
    localStorage.setItem('ris_historial_cns', JSON.stringify(historialSimulado));
  }, [historialSimulado]);

  // 📥 MOTOR DE GUARDADO CONSOLIDADO (Une laboratorios consecutivos en una sola ficha)
  const guardarEnRisServer = async (nuevoDocumento: any) => {
    alert("🎉 ¡Registro Clínico guardado con éxito en la base de datos de RIS-SERVER!");
    
    const matriculaActual = pacienteSeleccionado?.cod || "S/M";
    const nombreCompleto = `${pacienteSeleccionado?.nombres || ''} ${pacienteSeleccionado?.paterno || ''}`.trim();
    
    // 🔍 EXTRACCIÓN ULTRA-SEGURA: Si los datos vienen dentro de "hematoDatos" o variables internas, los aplanamos
    const datosFormularioSueltos = nuevoDocumento?.hematoDatos || nuevoDocumento?.datos || nuevoDocumento || {};

    let listaActualizada: any[] = [];

    setHistorialSimulado(prev => {
      const indicePaciente = prev.findIndex(item => item.cod === matriculaActual);
      const tipoLab = nuevoDocumento?.tipoLaboratorio || "Lab_Hemato";

      if (indicePaciente !== -1) {
        // 🔄 SI EL PACIENTE YA EXISTE
        const historialActualizado = [...prev];
        const datosExistentes = historialActualizado[indicePaciente].datos || {};
        
        historialActualizado[indicePaciente] = {
          ...historialActualizado[indicePaciente],
          estudiosRealizados: Array.from(new Set([...(historialActualizado[indicePaciente].estudiosRealizados || []), tipoLab])),
          datos: {
            ...datosExistentes,
            ...nuevoDocumento,
            ...datosFormularioSueltos // Forzamos aplanar las llaves (hto, hb, seg, etc.) en la raíz
          }
        };
        listaActualizada = historialActualizado;
        return historialActualizado;
      } else {
        // 🆕 SI ES UN PACIENTE NUEVO
        const nuevoRegistro = {
          cod: matriculaActual,
          paciente: nombreCompleto,
          servicio: "Laboratorio",
          estado: "Completado",
          fecha: new Date().toLocaleDateString(),
          estudiosRealizados: [tipoLab],
          datos: { 
            ...nuevoDocumento,
            ...datosFormularioSueltos // Aseguramos que hto, hb, seg entren directamente aquí
          }
        };
        listaActualizada = [...prev, nuevoRegistro];
        return listaActualizada;
      }
    });

    // Escritura en memoria inmediata
    setTimeout(() => {
      localStorage.setItem('ris_historial_cns', JSON.stringify(listaActualizada));
    }, 50);

    reiniciarModulo();
  };

  const reiniciarModulo = () => {
    setPaso(1);
    setPacienteSeleccionado(null);
  };

  return (
    <div className="w-full text-white space-y-6 relative">
      
      {/* 🖥️ MODAL PANTALLA COMPLETA: BANDEJA CENTRAL DE AUDITORÍA (DISEÑO DE 2 COLUMNAS) */}
      {verReportesGlobal && (
        <div className="fixed inset-0 bg-[#060b09] z-50 flex flex-col p-6 overflow-y-auto">
          
          {/* Cabecera superior de la Bandeja */}
          <div className="flex justify-between items-center border-b border-[#1f332d] pb-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#00bfa5] flex items-center gap-2">
                <Clipboard className="w-5 h-5" /> EXPEDIENTES Y REPORTES CLÍNICOS - CNS
              </h2>
              <p className="text-xs text-gray-400 mt-1">Selecciona un paciente a la izquierda para desplegar sus carpetas e informes individuales oficiales.</p>
            </div>
            <button 
              onClick={() => { setVerReportesGlobal(false); setPacienteFichaActiva(null); }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-semibold hover:bg-red-600/20 transition-all"
            >
              <X className="w-4 h-4" /> Cerrar Módulo
            </button>
          </div>

          {/* Grilla Principal Reestructurada */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
            
            {/* 🚪 COLUMNA IZQUIERDA: SECTOR PERSONAS */}
            <div className="lg:col-span-1 bg-[#0e1715] border border-[#2a403a] rounded-xl p-4 space-y-3 flex flex-col">
              <span className="text-xs font-bold text-gray-400 uppercase block border-b border-[#1f332d] pb-2">
                👤 Directorio de Pacientes ({historialSimulado.length})
              </span>
              
              <div className="space-y-2 overflow-y-auto flex-1 max-h-[550px]">
                {historialSimulado.length === 0 ? (
                  <div className="text-center text-xs text-gray-500 py-12 italic">No hay pacientes registrados en esta sesión.</div>
                ) : (
                  historialSimulado.map((p, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setPacienteFichaActiva(p)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        pacienteFichaActiva?.cod === p.cod 
                          ? 'bg-[#162e28] border-[#00bfa5] shadow-md' 
                          : 'bg-[#050a09] border-[#1c352f] hover:border-[#2a403a]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#121b18] rounded-lg border border-[#2a403a] text-[#00bfa5]">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm truncate">{p.paciente}</div>
                          <div className="text-[11px] text-gray-400 mt-0.5 font-mono">MAT: {p.cod}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 📁 COLUMNA DERECHA: APARTADO DE REPORTES INDIVIDUALES */}
            <div className="lg:col-span-2 bg-[#0e1715] border border-[#2a403a] rounded-xl p-6 flex flex-col overflow-y-auto">
              {pacienteFichaActiva ? (
                <div className="space-y-6 flex-1 flex flex-col">
                  
                  {/* Encabezado del Expediente Clínico Seleccionado */}
                  <div className="border-b border-[#1f332d] pb-4 flex justify-between items-start">
                    <div>
                      <span className="text-[10px] bg-primary-light/10 text-[#00bfa5] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Expediente Clínico Activo</span>
                      <h3 className="text-lg font-bold text-white mt-1">📋 {pacienteFichaActiva.paciente}</h3>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">Código CNS: {pacienteFichaActiva.cod}</p>
                    </div>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Admisión: {pacienteFichaActiva.fecha}
                    </span>
                  </div>

                  {/* Listado de Formularios Mapeados de este paciente */}
                  <div className="space-y-3 flex-1">
                    <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 tracking-wider">
                      <FolderOpen className="w-4 h-4 text-[#00bfa5]" /> Informes Médicos Registrados en Servidor:
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      
                      {/* 🔴 EXAMEN 1: REPORTES DE HEMATOLOGÍA */}
                      {(pacienteFichaActiva.estudiosRealizados?.includes('Lab_Hemato') || pacienteFichaActiva.datos?.hemoglobina) && (
                        <div className="bg-[#050a09] border border-[#1f332d] rounded-xl p-4 flex flex-col justify-between hover:border-red-500/40 transition-all">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] bg-red-600/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-bold">HEMATOLOGÍA</span>
                              <Layers className="w-4 h-4 text-red-500" />
                            </div>
                            <h5 className="font-bold text-sm text-white mt-3">Hemograma Completo Oficial</h5>
                            <p className="text-[11px] text-gray-400 mt-1">Formato Estructurado del Policlínico CNS El Alto.</p>
                          </div>
                          <button 
                            // Llamamos limpiamente a la función importada modularmente
                            onClick={() => imprimirHematologiaCNS(pacienteFichaActiva)}
                            className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition-colors shadow-md shadow-red-900/10"
                          >
                            <FileDown className="w-3.5 h-3.5" /> Descargar PDF Oficial
                          </button>
                        </div>
                      )}
                      {/* 🔵 EXAMEN 2: REPORTES DE QUÍMICA SANGUÍNEA / GRUPO SANGUÍNEO */}
{(pacienteFichaActiva.estudiosRealizados?.includes('Lab_Quimica') || 
  pacienteFichaActiva.estudiosRealizados?.includes('Lab_Hemato') || 
  pacienteFichaActiva.estudiosRealizados?.includes('Lab_Coagulo') || 
  pacienteFichaActiva.datos?.gli || 
  pacienteFichaActiva.datos?.grupo_sanguineo) && (
  <div className="bg-[#050a09] border border-[#1f332d] rounded-xl p-4 flex flex-col justify-between hover:border-blue-500/40 transition-all">
    <div>
      <div className="flex justify-between items-start">
        <span className="text-[10px] bg-blue-600/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-bold">QUÍMICA SANGUÍNEA</span>
        <Layers className="w-4 h-4 text-blue-500" />
      </div>
      <h5 className="font-bold text-sm text-white mt-3">Examen de Químicas y Análisis</h5>
      <p className="text-[11px] text-gray-400 mt-1">Formato Oficial de la CNS con Identificador Correlativo.</p>
    </div>
    <button 
      onClick={() => imprimirGrupoSanguineoCNS(pacienteFichaActiva)}
      className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-md shadow-blue-900/10"
    >
      <FileDown className="w-3.5 h-3.5" /> Descargar PDF Oficial
    </button>
  </div>
)}

                      {/* 🟢 EXAMEN 2: REPORTES DE ORINA (EGO) */}
                      {(pacienteFichaActiva.estudiosRealizados?.includes('Lab_EGO') || pacienteFichaActiva.datos?.volumen) && (
                        <div className="bg-[#050a09] border border-[#1f332d] rounded-xl p-4 flex flex-col justify-between hover:border-teal-500/40 transition-all">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] bg-teal-600/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded font-bold">🧪 BIOQUÍMICA / EGO</span>
                              <Layers className="w-4 h-4 text-teal-500" />
                            </div>
                            <h5 className="font-bold text-sm text-white mt-3">Examen General de Orina</h5>
                            <p className="text-[11px] text-gray-400 mt-1">Físico-Químico y Sedimento Analítico.</p>
                          </div>
                          <button 
                            onClick={() => alert("Generando Formato Oficial EGO Modular...")}
                            className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs transition-colors"
                          >
                            <FileDown className="w-3.5 h-3.5" /> Descargar PDF Oficial
                          </button>
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center my-auto py-24 text-sm text-gray-500 italic flex flex-col items-center justify-center gap-2">
                  <FolderOpen className="w-8 h-8 text-gray-600 stroke-1" />
                  Seleccione un paciente de la lista izquierda para auditar su carpeta de informes clínicos oficiales.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* SECCIÓN PANTALLA PRINCIPAL TRADICIONAL DE ADMISIÓN */}
      <div className="border-b border-[#142823] pb-4 flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-lg font-bold text-[#00bfa5]">Admisión y Formularios CNS</h2>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => setVerReportesGlobal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-lg active:scale-95"
          >
            <Eye className="w-4 h-4" /> 👁️ Ver Carpeta de Reportes ({historialSimulado.length})
          </button>
        </div>
      </div>

      <div className="bg-primary-dark/40 border border-white/5 shadow-2xl rounded-xl p-6 min-h-[400px]">
        {paso === 1 ? (
          <RegistrarPaciente onSiguiente={(datos) => { setPacienteSeleccionado(datos); setPaso(2); }} />
        ) : (
          <RegistrarConsulta pacienteData={pacienteSeleccionado} onVolver={reiniciarModulo} onGuardarLocal={guardarEnRisServer} />
        )}
      </div>

    </div>
  );
}