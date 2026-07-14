import React, { useState, useEffect } from 'react';
import { FileDown, Eye, X, Clipboard, User, Calendar, FolderOpen, Layers, Pencil } from 'lucide-react';
import RegistrarPaciente from '../../pages/RegistrarPacientes';
import RegistrarConsulta from '../../pages/RegistrarConsulta';
import EditarReporteModal from './EditarReporteModal';
import { obtenerCodigoBeneficiarioTexto } from '../../utils/helpers';
import { imprimirHematologiaCNS } from '../reports/ReporteHematologia';
import { imprimirGrupoSanguineoCNS as imprimirGrupoSanguineoUnicoCNS } from '../reports/ReporteGrupoSanguineo';
import { imprimirCoagulogramaCNS } from '../reports/ReporteCoagulograma';
import { imprimirEgoCNS } from '../reports/ReporteEgo';
import { imprimirQuimicaCNS } from '../reports/ReporteQuimica';
import { imprimirElectrolitosProtCNS } from '../reports/ReporteElectrolitos';
import { imprimirSerologiaCNS } from '../reports/ReporteSerologia';
import { imprimirToleranciaGlucosaCNS } from '../reports/ReporteToleranciaGlucosa';
import { imprimirHtoHbCNS } from '../reports/ReporteHtoHb';
import { imprimirHtoHbLeucoWidalCNS } from '../reports/ReporteHtoHbLeucoWidal';
import { imprimirLiquidosCNS } from '../reports/ReporteLiquidos';
import { imprimirEspermatoCNS } from '../reports/ReporteEspermato';


export default function FormularioTab() {
  const [paso, setPaso] = useState(1);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null);
  const [verReportesGlobal, setVerReportesGlobal] = useState(false);
  
  const [pacienteFichaActiva, setPacienteFichaActiva] = useState<any>(null);
  const [resetKey, setResetKey] = useState(0);

  // Reporte que se está editando: { id, paciente }. null = modal cerrado.
  const [reporteEnEdicion, setReporteEnEdicion] = useState<{ id: string; paciente: any } | null>(null);

  const [historialSimulado, setHistorialSimulado] = useState<any[]>(() => {
    const datosGuardados = localStorage.getItem('ris_historial_cns');
    return datosGuardados ? JSON.parse(datosGuardados) : [];
  });

  useEffect(() => {
  if (!verReportesGlobal) {
    document.body.style.overflow = 'unset';
  } else {
    document.body.style.overflow = 'hidden';
  }
}, [verReportesGlobal]);


  const guardarEnRisServer = async (nuevoDocumento: any) => {
    alert("🎉 ¡Registro Clínico guardado con éxito en la base de datos de RIS-SERVER!");
    
    const matriculaActual = pacienteSeleccionado?.cod || "S/M";
    const idPaciente = pacienteSeleccionado?.id || pacienteSeleccionado?.id_paciente || pacienteSeleccionado?.cod || "S/M";
    const nombreCompleto = `${pacienteSeleccionado?.nombres || ''} ${pacienteSeleccionado?.paterno || ''}`.trim();
 
    const edadPaciente = pacienteSeleccionado?.edad || "-";

    const datosFormularioSueltos = nuevoDocumento?.hematoDatos || nuevoDocumento?.datos || nuevoDocumento || {};

    let listaActualizada: any[] = [];

    setHistorialSimulado(prev => {
      const indicePaciente = prev.findIndex(item => item.cod === matriculaActual);
      const tipoLab = nuevoDocumento?.tipoLaboratorio || "Lab_Hemato";

      // Número correlativo secuencial (1, 2, 3...) basado en el mayor ya asignado.
      const maxOrden = prev.reduce((max, item) => Math.max(max, Number(item.orden) || 0), 0);

      if (indicePaciente !== -1) {

        const historialActualizado = [...prev];
        const datosExistentes = historialActualizado[indicePaciente].datos || {};
        // El mismo paciente conserva su número; no se reasigna en cada estudio.
        const ordenPaciente = historialActualizado[indicePaciente].orden ?? (maxOrden + 1);

        historialActualizado[indicePaciente] = {
          ...historialActualizado[indicePaciente],
          edad: edadPaciente,
          id_paciente: idPaciente,
          orden: ordenPaciente,
          estudiosRealizados: Array.from(new Set([...(historialActualizado[indicePaciente].estudiosRealizados || []), tipoLab])),
          datos: {
            ...datosExistentes,
            ...nuevoDocumento,
            ...datosFormularioSueltos,
            orden: ordenPaciente
          }
        };
        listaActualizada = historialActualizado;
        return historialActualizado;
      } else {

        const nuevoOrden = maxOrden + 1;
        const nuevoRegistro = {
          cod: matriculaActual,
          orden: nuevoOrden,
          paciente: nombreCompleto,
          edad: edadPaciente,
          id_paciente: idPaciente,
          servicio: "Laboratorio",
          estado: "Completado",
          fecha: new Date().toLocaleDateString(),
          estudiosRealizados: [tipoLab],
          datos: {
            ...nuevoDocumento,
            ...datosFormularioSueltos,
            orden: nuevoOrden
          }
        };
        listaActualizada = [...prev, nuevoRegistro];
        return listaActualizada;
      }
    });

    setTimeout(() => {
      localStorage.setItem('ris_historial_cns', JSON.stringify(listaActualizada));
    }, 50);

    reiniciarModulo();
  };

  const reiniciarModulo = () => {
    setPaso(1);
    setPacienteSeleccionado(null);
    setResetKey(prev => prev + 1); 
  };

  // Un valor cuenta como "llenado" si no es vacío ni el default 0.
  const tieneValor = (val: any) =>
    val !== undefined && val !== null && String(val).trim() !== '' && String(val).trim() !== '0';
  // Una bolsa de datos está "llenada" si al menos uno de sus campos clave tiene valor real.
  const algunCampo = (obj: any, campos: string[]) =>
    !!obj && campos.some((c) => tieneValor(obj[c]));

  // Botón "Editar" uniforme para las cards de reporte.
  const botonEditar = (idReporte: string) => (
    <button
      type="button"
      onClick={() => setReporteEnEdicion({ id: idReporte, paciente: pacienteFichaActiva })}
      className="flex items-center justify-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 rounded-lg text-xs font-bold transition-colors"
      title="Editar reporte"
    >
      <Pencil className="w-3.5 h-3.5" /> Editar
    </button>
  );

  // Persiste la edición: reemplaza `datos` del paciente por `cod`, guarda en
  // localStorage y refresca la ficha activa para que las cards se re-evalúen.
  const guardarEdicion = (nuevoDatos: any) => {
    if (!reporteEnEdicion) return;
    const cod = reporteEnEdicion.paciente.cod;
    const actualizado = historialSimulado.map((item) =>
      item.cod === cod ? { ...item, datos: nuevoDatos } : item
    );
    setHistorialSimulado(actualizado);
    localStorage.setItem('ris_historial_cns', JSON.stringify(actualizado));
    setPacienteFichaActiva(actualizado.find((i) => i.cod === cod) || null);
    setReporteEnEdicion(null);
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
                      
                      {/* 🔴 EXAMEN 1: REPORTES DE HEMATOLOGÍA (hemograma completo: clave la serie blanca) */}
                      {(pacienteFichaActiva.estudiosRealizados?.includes('Lab_Hemato') ||
                        algunCampo(pacienteFichaActiva.datos, ['globulos_blancos', 'globulos_rojos', 'plaquetas', 'seg', 'linf', 'mon'])) && (
                        <div className="bg-[#050a09] border border-[#1f332d] rounded-xl p-4 flex flex-col justify-between hover:border-red-500/40 transition-all">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] bg-red-600/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-bold">HEMATOLOGÍA</span>
                              <Layers className="w-4 h-4 text-red-500" />
                            </div>
                            <h5 className="font-bold text-sm text-white mt-3">Hemograma Completo Oficial</h5>
                            <p className="text-[11px] text-gray-400 mt-1">Formato Estructurado del Policlínico CNS El Alto.</p>
                          </div>
                          <div className="mt-4 flex gap-2">
                            {botonEditar('hematologia')}
                            <button
                              onClick={() => imprimirHematologiaCNS(pacienteFichaActiva)}
                              className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition-colors shadow-md shadow-red-900/10"
                            >
                              <FileDown className="w-3.5 h-3.5" /> Descargar
                            </button>
                          </div>
                        </div>
                      )}
                      {/* 🔵 EXAMEN 2: GRUPO SANGUÍNEO (derivado de Hematología) */}
{tieneValor(pacienteFichaActiva.datos?.grupo_sanguineo) && (
  <div className="bg-[#050a09] border border-[#1f332d] rounded-xl p-4 flex flex-col justify-between hover:border-blue-500/40 transition-all">
    <div>
      <div className="flex justify-between items-start">
        <span className="text-[10px] bg-blue-600/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-bold">GRUPO SANGUÍNEO</span>
        <Layers className="w-4 h-4 text-blue-500" />
      </div>
      <h5 className="font-bold text-sm text-white mt-3">Grupo Sanguíneo y Factor Rh</h5>
      <p className="text-[11px] text-gray-400 mt-1">Derivado del Hemograma. Formato Oficial CNS con correlativo.</p>
    </div>
    <div className="mt-4 flex gap-2">
      {botonEditar('grupo_sanguineo')}
      <button
        onClick={() => imprimirGrupoSanguineoUnicoCNS(pacienteFichaActiva)}
        className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-md shadow-blue-900/10"
      >
        <FileDown className="w-3.5 h-3.5" /> Descargar
      </button>
    </div>
  </div>
)}

                      {/* 🟢 EXAMEN 3: REPORTE DE ORINA (EGO) */}
                      {(pacienteFichaActiva.estudiosRealizados?.includes('Lab_EGO') ||
                        algunCampo(pacienteFichaActiva.datos?.egoDatos, ['volumen', 'color', 'ph', 'densidad', 'aspecto', 'leucocitos', 'sedimento'])) && (
                        <div className="bg-[#050a09] border border-[#1f332d] rounded-xl p-4 flex flex-col justify-between hover:border-teal-500/40 transition-all">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] bg-teal-600/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded font-bold">🧪 BIOQUÍMICA / EGO</span>
                              <Layers className="w-4 h-4 text-teal-500" />
                            </div>
                            <h5 className="font-bold text-sm text-white mt-3">Examen General de Orina</h5>
                            <p className="text-[11px] text-gray-400 mt-1">Físico-Químico y Sedimento Analítico.</p>
                          </div>
                          <div className="mt-4 flex gap-2">
                            {botonEditar('ego')}
                            <button
                              onClick={() => imprimirEgoCNS(pacienteFichaActiva)}
                              className="flex-1 flex items-center justify-center gap-2 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs transition-colors"
                            >
                              <FileDown className="w-3.5 h-3.5" /> Descargar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 🟣 EXAMEN 4: REPORTE DE COAGULOGRAMA / TIEMPO DE PROTROMBINA */}
                      {(pacienteFichaActiva.estudiosRealizados?.includes('Lab_Coagulo') ||
                        algunCampo(pacienteFichaActiva.datos, ['t_protrombina', 'actividad', 't_coagulacion_min', 't_coagulacion_seg', 't_sangria_min', 't_sangria_seg'])) && (
                        <div className="bg-[#050a09] border border-[#1f332d] rounded-xl p-4 flex flex-col justify-between hover:border-purple-500/40 transition-all">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] bg-purple-600/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-bold">COAGULOGRAMA</span>
                              <Layers className="w-4 h-4 text-purple-500" />
                            </div>
                            <h5 className="font-bold text-sm text-white mt-3">Tiempo de Protrombina y Hemostasia</h5>
                            <p className="text-[11px] text-gray-400 mt-1">TP, Actividad, INR y Tiempos de Coagulación/Sangría.</p>
                          </div>
                          <div className="mt-4 flex gap-2">
                            {botonEditar('coagulograma')}
                            <button
                              onClick={() => imprimirCoagulogramaCNS(pacienteFichaActiva)}
                              className="flex-1 flex items-center justify-center gap-2 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition-colors shadow-md shadow-purple-900/10"
                            >
                              <FileDown className="w-3.5 h-3.5" /> Descargar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 🔵 EXAMEN 5: QUÍMICA SANGUÍNEA */}
                      {algunCampo(pacienteFichaActiva.datos?.quimicaDatos, ['gli', 'crea', 'urea', 'nus', 'acido_urico', 'col', 'tri', 'got', 'gpt', 'prot', 'alb']) && (
                        <div className="bg-[#050a09] border border-[#1f332d] rounded-xl p-4 flex flex-col justify-between hover:border-sky-500/40 transition-all">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] bg-sky-600/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded font-bold">QUÍMICA SANGUÍNEA</span>
                              <Layers className="w-4 h-4 text-sky-500" />
                            </div>
                            <h5 className="font-bold text-sm text-white mt-3">Perfil Bioquímico Completo</h5>
                            <p className="text-[11px] text-gray-400 mt-1">Glucosa, renal, hepático, lípidos y proteínas con rangos.</p>
                          </div>
                          <div className="mt-4 flex gap-2">
                            {botonEditar('quimica')}
                            <button
                              onClick={() => imprimirQuimicaCNS(pacienteFichaActiva)}
                              className="flex-1 flex items-center justify-center gap-2 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs transition-colors shadow-md"
                            >
                              <FileDown className="w-3.5 h-3.5" /> Descargar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 🟦 EXAMEN 6: ELECTROLITOS / PROTEÍNAS / MICROALBUMINURIA */}
                      {(algunCampo(pacienteFichaActiva.datos?.quimicaDatos, ['sodio_meql', 'potasio_meql', 'cloro_meql']) ||
                        algunCampo(pacienteFichaActiva.datos?.microDatos, ['micro_albumina', 'micro_creatinina', 'relacion_ac']) ||
                        algunCampo(pacienteFichaActiva.datos?.egoDatos, ['volumen_24h', 'prot_24h', 'crea_orina_24h'])) && (
                        <div className="bg-[#050a09] border border-[#1f332d] rounded-xl p-4 flex flex-col justify-between hover:border-cyan-500/40 transition-all">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-bold">ELECTROLITOS / PROT</span>
                              <Layers className="w-4 h-4 text-cyan-500" />
                            </div>
                            <h5 className="font-bold text-sm text-white mt-3">Electrolitos, Prot. en Orina y Microalbuminuria</h5>
                            <p className="text-[11px] text-gray-400 mt-1">Na/K/Cl, Orina 24h e índice Albúmina/Creatinina.</p>
                          </div>
                          <div className="mt-4 flex gap-2">
                            {botonEditar('electrolitos')}
                            <button
                              onClick={() => imprimirElectrolitosProtCNS(pacienteFichaActiva)}
                              className="flex-1 flex items-center justify-center gap-2 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg text-xs transition-colors shadow-md"
                            >
                              <FileDown className="w-3.5 h-3.5" /> Descargar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 🟪 EXAMEN 7: SEROLOGÍA */}
                      {algunCampo(pacienteFichaActiva.datos?.serologiaDatos, ['pcr', 'fr', 'asto', 'hiv', 'test_embarazo', 'rpr', 'psa_prueba_rapida', 'h_pylori_suero', 'hepatitis_b']) && (
                        <div className="bg-[#050a09] border border-[#1f332d] rounded-xl p-4 flex flex-col justify-between hover:border-fuchsia-500/40 transition-all">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] bg-fuchsia-600/10 text-fuchsia-400 border border-fuchsia-500/20 px-2 py-0.5 rounded font-bold">SEROLOGÍA</span>
                              <Layers className="w-4 h-4 text-fuchsia-500" />
                            </div>
                            <h5 className="font-bold text-sm text-white mt-3">Pruebas Inmunológicas</h5>
                            <p className="text-[11px] text-gray-400 mt-1">PCR, FR, ASTO, VIH, RPR, H. Pylori, Hepatitis B.</p>
                          </div>
                          <div className="mt-4 flex gap-2">
                            {botonEditar('serologia')}
                            <button
                              onClick={() => imprimirSerologiaCNS(pacienteFichaActiva)}
                              className="flex-1 flex items-center justify-center gap-2 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold rounded-lg text-xs transition-colors shadow-md"
                            >
                              <FileDown className="w-3.5 h-3.5" /> Descargar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 🟩 EXAMEN 8: TOLERANCIA A LA GLUCOSA */}
                      {algunCampo(pacienteFichaActiva.datos?.glucosaFija, ['basal', 'resultado_glucosa1', 'resultado_glucosa2']) && (
                        <div className="bg-[#050a09] border border-[#1f332d] rounded-xl p-4 flex flex-col justify-between hover:border-green-500/40 transition-all">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] bg-green-600/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded font-bold">TOLERANCIA GLUCOSA</span>
                              <Layers className="w-4 h-4 text-green-500" />
                            </div>
                            <h5 className="font-bold text-sm text-white mt-3">Curva de Tolerancia a la Glucosa</h5>
                            <p className="text-[11px] text-gray-400 mt-1">Basal, 60' y 120' post-carga con criterios OMS.</p>
                          </div>
                          <div className="mt-4 flex gap-2">
                            {botonEditar('tolerancia_glucosa')}
                            <button
                              onClick={() => imprimirToleranciaGlucosaCNS(pacienteFichaActiva)}
                              className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xs transition-colors shadow-md"
                            >
                              <FileDown className="w-3.5 h-3.5" /> Descargar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 🟥 EXAMEN 9: HTO-HB AISLADO (deriva de Hematología, sin fórmula diferencial) */}
                      {((tieneValor(pacienteFichaActiva.datos?.hto) || tieneValor(pacienteFichaActiva.datos?.hb)) &&
                        !algunCampo(pacienteFichaActiva.datos, ['globulos_blancos', 'seg', 'linf', 'mon', 'eosi'])) && (
                        <div className="bg-[#050a09] border border-[#1f332d] rounded-xl p-4 flex flex-col justify-between hover:border-rose-500/40 transition-all">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] bg-rose-600/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-bold">HTO - HB</span>
                              <Layers className="w-4 h-4 text-rose-500" />
                            </div>
                            <h5 className="font-bold text-sm text-white mt-3">Hematocrito y Hemoglobina</h5>
                            <p className="text-[11px] text-gray-400 mt-1">Estudio aislado derivado de Hematología.</p>
                          </div>
                          <div className="mt-4 flex gap-2">
                            {botonEditar('hto_hb')}
                            <button
                              onClick={() => imprimirHtoHbCNS(pacienteFichaActiva)}
                              className="flex-1 flex items-center justify-center gap-2 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors shadow-md"
                            >
                              <FileDown className="w-3.5 h-3.5" /> Descargar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 🩷 EXAMEN 10: HTO-HB-LEUCO + WIDAL (deriva de Hematología + Widal) */}
                      {algunCampo(pacienteFichaActiva.datos?.widalDatos, ['widal_o', 'widal_h', 'widal_a', 'widal_b']) && (
                        <div className="bg-[#050a09] border border-[#1f332d] rounded-xl p-4 flex flex-col justify-between hover:border-pink-500/40 transition-all">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] bg-pink-600/10 text-pink-400 border border-pink-500/20 px-2 py-0.5 rounded font-bold">HTO-HB-LEUCO + WIDAL</span>
                              <Layers className="w-4 h-4 text-pink-500" />
                            </div>
                            <h5 className="font-bold text-sm text-white mt-3">Hematología + Reacción de Widal</h5>
                            <p className="text-[11px] text-gray-400 mt-1">Hto, Hb, leucocitos, diferencial y títulos Widal.</p>
                          </div>
                          <div className="mt-4 flex gap-2">
                            {botonEditar('hto_hb_widal')}
                            <button
                              onClick={() => imprimirHtoHbLeucoWidalCNS(pacienteFichaActiva)}
                              className="flex-1 flex items-center justify-center gap-2 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg text-xs transition-colors shadow-md"
                            >
                              <FileDown className="w-3.5 h-3.5" /> Descargar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 🟫 EXAMEN 11: ANÁLISIS DE LÍQUIDOS BIOLÓGICOS */}
                      {algunCampo(pacienteFichaActiva.datos?.liquidosDatos, ['tipo_liquido', 'volumen', 'color', 'quimico_glucosa', 'micro_leucocitos']) && (
                        <div className="bg-[#050a09] border border-[#1f332d] rounded-xl p-4 flex flex-col justify-between hover:border-amber-700/40 transition-all">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] bg-amber-700/10 text-amber-500 border border-amber-700/20 px-2 py-0.5 rounded font-bold">LÍQUIDOS</span>
                              <Layers className="w-4 h-4 text-amber-600" />
                            </div>
                            <h5 className="font-bold text-sm text-white mt-3">Análisis de Líquidos Biológicos</h5>
                            <p className="text-[11px] text-gray-400 mt-1">Físico, químico, citológico y sedimento.</p>
                          </div>
                          <div className="mt-4 flex gap-2">
                            {botonEditar('liquidos')}
                            <button
                              onClick={() => imprimirLiquidosCNS(pacienteFichaActiva)}
                              className="flex-1 flex items-center justify-center gap-2 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg text-xs transition-colors shadow-md"
                            >
                              <FileDown className="w-3.5 h-3.5" /> Descargar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ⬜ EXAMEN 12: ESPERMATOGRAMA */}
                      {(pacienteFichaActiva.estudiosRealizados?.includes('Lab_Espermato') ||
                        algunCampo(pacienteFichaActiva.datos?.espermatoDatos, ['volumen', 'concentracion', 'motilidad_progresiva', 'color', 'ph', 'morfologia_normal'])) && (
                        <div className="bg-[#050a09] border border-[#1f332d] rounded-xl p-4 flex flex-col justify-between hover:border-slate-400/40 transition-all">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] bg-slate-500/10 text-slate-300 border border-slate-400/20 px-2 py-0.5 rounded font-bold">ESPERMATOGRAMA</span>
                              <Layers className="w-4 h-4 text-slate-400" />
                            </div>
                            <h5 className="font-bold text-sm text-white mt-3">Espermatograma Completo</h5>
                            <p className="text-[11px] text-gray-400 mt-1">Examen macroscópico y microscópico (OMS).</p>
                          </div>
                          <div className="mt-4 flex gap-2">
                            {botonEditar('espermato')}
                            <button
                              onClick={() => imprimirEspermatoCNS(pacienteFichaActiva)}
                              className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg text-xs transition-colors shadow-md"
                            >
                              <FileDown className="w-3.5 h-3.5" /> Descargar
                            </button>
                          </div>
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

      {/* ✏️ MODAL DE EDICIÓN DE REPORTE (enfocado al reporte seleccionado) */}
      {reporteEnEdicion && (
        <EditarReporteModal
          reporte={reporteEnEdicion.paciente}
          idReporte={reporteEnEdicion.id}
          onGuardar={guardarEdicion}
          onCerrar={() => setReporteEnEdicion(null)}
        />
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
          <RegistrarPaciente 
            key={resetKey}
            onSiguiente={(datos) => { setPacienteSeleccionado(datos); setPaso(2); }} 
          />
        ) : (
          <RegistrarConsulta 
            key={resetKey} 
            pacienteData={pacienteSeleccionado} 
            onVolver={reiniciarModulo} 
            onGuardarLocal={guardarEnRisServer} 
          />
        )}
      </div>

    </div>
  );
}