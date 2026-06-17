import React, { useState } from 'react';
import {
  FileDown,
  FileText,
  ExternalLink,
  Loader2
} from 'lucide-react';
import RisModal from './RisModal';

// 🛠️ RUTAS CORREGIDAS: Apuntamos exactamente a la carpeta pages subiendo los niveles necesarios
import RegistrarPaciente from '../../pages/RegistrarPacientes';
import RegistrarConsulta from '../../pages/RegistrarConsulta';

const FormularioTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('tab1');
  const [isSimulatedModalOpen, setIsSimulatedModalOpen] = useState(false);
  
  // Controladores de estado internos para tu flujo analítico
  const [pasoAnalitico, setPasoAnalitico] = useState<number>(1);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null);

  // 🛠️ TIPADO CORREGIDO: Añadimos (nuevoDocumento: any) para eliminar el error "implicitly has an any type"
  const guardarEnRisServer = async (nuevoDocumento: any) => {
    console.log("Insertando en la arquitectura NoSQL del RIS-SERVER:", nuevoDocumento);
    
    try {
      const respuesta = await fetch(`http://localhost:5000/api/lab/resultado/${nuevoDocumento.id_consulta}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoDocumento)
      });
      
      if (respuesta.ok) {
        alert("🎉 ¡Registro Clínico guardado con éxito en la base de datos de RIS-SERVER!");
      } else {
        alert("⚠️ El servidor respondió, pero hubo un detalle al procesar el JSON.");
      }
    } catch (error) {
      console.error("Error de conexión con el backend:", error);
      alert("✔ Simulación local guardada (El backend no procesó la petición HTTP, guardado en consola).");
    }

    setPasoAnalitico(1); // Reiniciamos el flujo para el siguiente paciente
    setIsSimulatedModalOpen(false); // Cerramos el modal automáticamente
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-secondary-dark pb-4">
        <h2 className="text-xl font-bold text-primary-light">Formulario</h2>
        <div className="flex gap-2">
          
          <button
            onClick={() => {
              setPasoAnalitico(1);
              setIsSimulatedModalOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-600/30 transition-all text-sm font-medium shadow-sm hover:shadow-emerald-500/10 active:scale-95"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir Laboratorio Clínico (CNS)
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 bg-green-600/20 text-green-500 border border-green-500/30 rounded-lg hover:bg-green-600/30 transition-colors text-sm font-medium">
            <FileText className="w-4 h-4" />
            Reporte Excel
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-colors text-sm font-medium">
            <FileDown className="w-4 h-4" />
            Reporte PDF
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-secondary-dark">
        <button
          className={`pb-2 px-2 text-sm font-medium transition-colors border-b-2 ${activeSubTab === 'tab1'
            ? 'border-primary-light text-primary-light'
            : 'border-transparent text-gray-400 hover:text-white'
            }`}
          onClick={() => setActiveSubTab('tab1')}
        >
          Módulo Activo (Laboratorio)
        </button>
      </div>

      <div className="bg-primary-dark/40 border border-white/5 shadow-2xl rounded-xl p-6 min-h-[300px]">
  {activeSubTab === 'tab1' && (
    <div>
      {pasoAnalitico === 1 ? (
        <RegistrarPaciente 
  onSiguiente={(datosPaciente: any) => {
    // 🚀 Flujo directo: No importa qué pase, el paciente va directo a sus formularios analíticos
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
    </div>
  );
};

export default FormularioTab;