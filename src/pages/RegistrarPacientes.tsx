import React, { useState, useRef, useEffect } from 'react';
import { Calendar, FlaskConical, ClipboardList, Sparkles } from 'lucide-react';
import { obtenerCodigoBeneficiarioTexto } from '../utils/helpers';
import { listaPacientesPrueba } from '../RisWorklist/components/pacientesMock'; 
interface RegistrarPacienteProps {
  onSiguiente: (datos: any) => void;
}

export default function RegistrarPaciente({ onSiguiente }: RegistrarPacienteProps) {
  const [paciente, setPaciente] = useState({
    cod: '', paterno: '', materno: '', nombres: '', edad: '', genero: 'Femenino', cod_asegurado: '', codigoBeneficiario: ''
  });
  const [servicio, setServicio] = useState<'laboratorio' | 'imagenologia'>('laboratorio');
  const [indiceExcel, setIndiceExcel] = useState(0);

  // Carga dinámicamente un registro sin alterar la entrada manual
  const manejarCargaPlantilla = () => {
    const p = listaPacientesPrueba[indiceExcel];
    setPaciente({
      cod: p.cod,
      paterno: p.paterno,
      materno: p.materno,
      nombres: p.nombres,
      edad: String(p.edad),
      genero: p.genero,
      cod_asegurado: (p as any).cod_asegurado ?? '',
      codigoBeneficiario: (p as any).codigoBeneficiario ?? ''
     
    });
    setIndiceExcel((prev) => (prev + 1) % listaPacientesPrueba.length);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPaciente({ ...paciente, [e.target.name]: e.target.value });
  };

  const procesarContinuar = () => {
  if (!paciente.nombres || !paciente.cod) {
    alert("Por favor rellene los campos de filiación del paciente.");
    return;
  }

  onSiguiente({ 
    ...paciente, 
    id_paciente: paciente.codigoBeneficiario, 
    codBeneficiario: paciente.codigoBeneficiario, 
    servicioSeleccionado: servicio 
  });
};

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#070f0d] p-6 rounded-xl border border-[#172c26] text-white">
      
      {/* Botón de control superior para la simulación */}
      <div className="flex justify-end mb-4">
        <button 
          type="button" 
          onClick={manejarCargaPlantilla}
          className="px-3 py-1.5 bg-[#00bfa5]/10 text-[#00bfa5] border border-[#00bfa5]/30 rounded-lg text-xs font-semibold hover:bg-[#00bfa5]/20 transition-all active:scale-95"
        >
          ✨ Cargar Fila Excel ({indiceExcel + 1}/10)
        </button>
      </div>

      {/* CAMINO PRIMARIO: PARSER QR (Exacto a tu captura) */}
      <div className="p-4 bg-[#0a1412] border border-[#182e29] rounded-lg mb-6">
        <label className="block text-[11px] font-bold text-[#00bfa5] uppercase tracking-wider mb-2">
          📷 CAMINO PRIMARIO: PARSER QR BOLETA CNS EL ALTO
        </label>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Dispare la lectora QR sobre la boleta física..." 
            className="flex-1 p-2.5 bg-[#050a09] border border-[#1c352f] rounded text-xs focus:outline-none focus:border-[#00bfa5]"
          />
          <button type="button" className="px-5 bg-[#005c47] hover:bg-[#007358] text-white text-xs font-bold rounded transition-colors">Procesar</button>
        </div>
      </div>

      {/* DATOS DE FILIACIÓN (Exacto a tu captura) */}
      <div className="space-y-4 mb-6">
        <div className="border-b border-[#142823] pb-1">
          <span className="text-xs text-gray-400 font-medium">📋 Datos de Filiación Unificada (Principio P1)</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1">CI / MATRÍCULA:</label>
            <input type="text" name="cod" value={paciente.cod} onChange={handleInputChange} className="w-full p-2 bg-[#050a09] border border-[#1c352f] rounded text-white" />
          </div>
          <div>
  <label className="block text-gray-400 mb-1">CÓDIGO BENEFICIARIO:</label>
  <input 
    type="text" 
    name="codigoBeneficiario" 
    value={paciente.codigoBeneficiario} 
    onChange={handleInputChange} 
    placeholder="Ej. 0, 50, 51..."
    className="w-full p-2 bg-[#050a09] border border-[#1c352f] rounded text-white focus:outline-none focus:border-[#00bfa5]" 
  />
  <span className="text-[11px] text-[#00bfa5] font-semibold mt-1 block">
    Interpretación: {obtenerCodigoBeneficiarioTexto(paciente.codigoBeneficiario)}
  </span>
</div>
          <div>
            <label className="block text-gray-400 mb-1">APELLIDO PATERNO:</label>
            <input type="text" name="paterno" value={paciente.paterno} onChange={handleInputChange} className="w-full p-2 bg-[#050a09] border border-[#1c352f] rounded text-white" />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">APELLIDO MATERNO:</label>
            <input type="text" name="materno" value={paciente.materno} onChange={handleInputChange} className="w-full p-2 bg-[#050a09] border border-[#1c352f] rounded text-white" />
          </div>
           
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1">NOMBRES:</label>
            <input type="text" name="nombres" value={paciente.nombres} onChange={handleInputChange} className="w-full p-2 bg-[#050a09] border border-[#1c352f] rounded text-white" />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">EDAD:</label>
            <input type="number" name="edad" value={paciente.edad} onChange={handleInputChange} className="w-full p-2 bg-[#050a09] border border-[#1c352f] rounded text-white" />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">GÉNERO:</label>
            <select name="genero" value={paciente.genero} onChange={handleInputChange} className="w-full p-2 bg-[#050a09] border border-[#1c352f] rounded text-white focus:outline-none">
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
            </select>
          </div>
        </div>
      </div>

      {/* SELECTOR DE SERVICIO POST-REGISTRO (Exacto a tu captura) */}
      <div className="space-y-3 mb-6">
        <div className="border-b border-[#142823] pb-1">
          <span className="text-xs text-gray-400 font-medium">🔄 Selector de Servicio Post-Registro</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            onClick={() => setServicio('imagenologia')}
            className={`p-4 rounded-lg cursor-pointer border transition-all text-left ${servicio === 'imagenologia' ? 'border-[#00bfa5] bg-[#00bfa5]/5' : 'border-[#1c352f] bg-[#050a09]'}`}
          >
            <span className="block font-bold text-xs">🗓️ Imagenología</span>
            <span className="block text-[11px] text-gray-400 mt-1">Flujo con agenda horaria fija.</span>
          </div>

          <div 
            onClick={() => setServicio('laboratorio')}
            className={`p-4 rounded-lg cursor-pointer border transition-all text-left ${servicio === 'laboratorio' ? 'border-[#00bfa5] bg-[#00bfa5]/5' : 'border-[#1c352f] bg-[#050a09]'}`}
          >
            <span className="block font-bold text-xs">🧪 Laboratorio Clínico</span>
            <span className="block text-[11px] text-gray-400 mt-1">Sin agenda horaria. Proceso por lote.</span>
          </div>
        </div>
      </div>

      {/* BOTÓN DE ACCIÓN PRINCIPAL (Exacto a tu captura) */}
      <button
        type="button"
        onClick={procesarContinuar}
        className="w-full py-3 bg-[#005c47] hover:bg-[#007358] text-white font-bold text-xs rounded-lg uppercase tracking-wider transition-all active:scale-95"
      >
        Continuar al servicio seleccionado →
      </button>

    </div>
  );
}