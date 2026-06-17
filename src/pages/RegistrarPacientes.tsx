import React, { useState, useRef, useEffect } from 'react';

interface PacienteEstructura {
  id_paciente: number;
  paterno: string;
  materno: string;
  nombres: string;
  edad: number;
  genero: string;
  cod: string;
  telefono: string;
  tipo_seguro: string;
}

interface RegistrarPacienteProps {
  onSiguiente: (datosPaciente: PacienteEstructura) => void;
}

export default function RegistrarPaciente({ onSiguiente }: RegistrarPacienteProps) {
  const [paciente, setPaciente] = useState<PacienteEstructura>({
    id_paciente: 12345,
    paterno: '',
    materno: '',
    nombres: '',
    edad: 0,
    genero: 'Femenino',
    cod: '', 
    telefono: '',
    tipo_seguro: 'CNS'
  });

  const [qrInput, setQrInput] = useState<string>('');
  const qrFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (qrFieldRef && qrFieldRef.current) {
      qrFieldRef.current.focus();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPaciente({ 
      ...paciente, 
      [name]: name === 'edad' ? parseInt(value, 10) || 0 : value 
    });
  };

  // Parser automático de la Boleta Física de la CNS El Alto
  const handleQrScan = (e: React.FormEvent) => {
    e.preventDefault();
    const cadenaQr = qrInput.trim();
    if (!cadenaQr) return;

    // Desglosamos la cadena nativa: CI|PATERNO|MATERNO|NOMBRES|EDAD|GENERO
    const datosPartidos: string[] = cadenaQr.split('|');

    if (datosPartidos.length >= 6) {
      setPaciente({
        id_paciente: Date.now(),       
        cod: datosPartidos[0] || '',       
        paterno: datosPartidos[1] || '',   
        materno: datosPartidos[2] || '',   
        nombres: datosPartidos[3] || '',   
        edad: parseInt(datosPartidos[4], 10) || 0,
        genero: datosPartidos[5] || 'Femenino',
        telefono: '',
        tipo_seguro: 'CNS'
      });
    } else {
      setPaciente({ ...paciente, cod: cadenaQr });
    }
    setQrInput('');
  };

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    onSiguiente(paciente); // Envía los datos directo al paso 2 sin preguntar servicio
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#0c1311] p-6 rounded-xl border border-[#005a43]/40 shadow-xl text-white">
      
      {/* ENTRADA DE ESCÁNER AUTOMÁTICO */}
      <div className="mb-6 p-4 bg-[#050807] border-2 border-[#00bfa5]/40 rounded-lg">
        <label className="block text-xs font-bold text-[#00bfa5] uppercase tracking-wider mb-2">
          📷 Escáner de Boleta Física (CNS El Alto)
        </label>
        <form onSubmit={handleQrScan} className="flex gap-2">
          <input
            ref={qrFieldRef}
            type="text"
            placeholder="Dispare la lectora QR aquí para auto-completar..."
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            className="flex-1 p-2.5 bg-[#121b18] border border-[#2a403a] rounded-md text-white text-sm focus:outline-none focus:border-[#00bfa5]"
          />
          <button type="submit" className="px-4 py-2 bg-[#005a43] hover:bg-[#007a5c] text-white text-sm font-bold rounded-md transition-colors">
            Procesar
          </button>
        </form>
      </div>

      {/* FORMULARIO DE FILIACIÓN UNIFICADA */}
      <form onSubmit={manejarEnvio} className="flex flex-col gap-5">
        <div className="border-b border-[#1f332d] pb-2">
          <h3 className="text-sm font-semibold text-[#00bfa5] tracking-wide">
            📋 Datos de Filiación Unificada (Principio P1)
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] text-gray-400 font-medium mb-1">CI / MATRÍCULA:</label>
            <input type="text" name="cod" value={paciente.cod} onChange={handleChange} required className="w-full p-2 bg-[#050807] border border-[#2a403a] rounded-md text-white text-sm focus:outline-none focus:border-[#00bfa5]" />
          </div>
          <div>
            <label className="block text-[11px] text-gray-400 font-medium mb-1">APELLIDO PATERNO:</label>
            <input type="text" name="paterno" value={paciente.paterno} onChange={handleChange} required className="w-full p-2 bg-[#050807] border border-[#2a403a] rounded-md text-white text-sm focus:outline-none focus:border-[#00bfa5]" />
          </div>
          <div>
            <label className="block text-[11px] text-gray-400 font-medium mb-1">APELLIDO MATERNO:</label>
            <input type="text" name="materno" value={paciente.materno} onChange={handleChange} className="w-full p-2 bg-[#050807] border border-[#2a403a] rounded-md text-white text-sm focus:outline-none focus:border-[#00bfa5]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] text-gray-400 font-medium mb-1">NOMBRES:</label>
            <input type="text" name="nombres" value={paciente.nombres} onChange={handleChange} required className="w-full p-2 bg-[#050807] border border-[#2a403a] rounded-md text-white text-sm focus:outline-none focus:border-[#00bfa5]" />
          </div>
          <div>
            <label className="block text-[11px] text-gray-400 font-medium mb-1">EDAD:</label>
            <input type="number" name="edad" value={paciente.edad === 0 ? '' : paciente.edad} onChange={handleChange} required className="w-full p-2 bg-[#050807] border border-[#2a403a] rounded-md text-white text-sm focus:outline-none focus:border-[#00bfa5]" />
          </div>
          <div>
            <label className="block text-[11px] text-gray-400 font-medium mb-1">GÉNERO:</label>
            <select name="genero" value={paciente.genero} onChange={handleChange} className="w-full p-2 bg-[#050807] border border-[#2a403a] rounded-md text-white text-sm focus:outline-none focus:border-[#00bfa5]">
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
            </select>
          </div>
        </div>

        {/* BOTÓN DIRECTO DE FLUJO LINEAL */}
        <button type="submit" className="w-full mt-2 p-3 bg-[#005a43] hover:bg-[#007a5c] text-white font-bold rounded-lg tracking-wide transition-all text-sm shadow-md active:scale-[0.99]">
          CONTINUAR A CARGA DE EXÁMENES →
        </button>
      </form>
    </div>
  );
}