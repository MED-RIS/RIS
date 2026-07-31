import React, { useState, useEffect } from 'react';
import { Phone, Mail, Sparkles, User, FileText, Tag, Building2, LayoutGrid, Stethoscope, CalendarDays } from 'lucide-react';
import RisModal from './RisModal';

import { Patient } from '../types';

// 📦 Importamos los 10 pacientes unificados de tu plantilla Excel locales
import { listaPacientesPrueba } from './pacientesMock';

// Helper local para cálculo dinámico de edad
const calcularEdadLocal = (dob: string | undefined): string => {
  if (!dob) return '-';
  const fecha = new Date(dob);
  if (isNaN(fecha.getTime())) return '-';
  const diff = Date.now() - fecha.getTime();
  const edad = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return edad >= 0 ? `${edad} años` : '-';
};

interface PatientsTabProps {
  patients: Patient[];
  fuzzySearch: (item: any) => boolean;
  paginate: (items: any[]) => any[];
  isCreatingPatient: boolean;
  setIsCreatingPatient: React.Dispatch<React.SetStateAction<boolean>>;
  isEditing: boolean;
  editingItem: any;
  handleCreatePatient: (e: React.FormEvent) => Promise<void>;
  handleUpdate: (e: React.FormEvent) => Promise<void>;
  handleCancelEdit: () => void;
  handleEdit: (type: string, item: any) => void;
  handleDelete: (type: string, id: string) => Promise<void>;
  newPatient: Partial<Patient> & Record<string, any>;
  setNewPatient: React.Dispatch<React.SetStateAction<any>>;
  PaginationControls: any;
  openPatientProfile?: (patient: Patient) => void;
}

export default function PatientsTab({
  patients,
  fuzzySearch,
  paginate,
  isCreatingPatient,
  setIsCreatingPatient,
  isEditing,
  editingItem,
  handleCreatePatient,
  handleUpdate,
  handleCancelEdit,
  handleEdit,
  handleDelete,
  newPatient,
  setNewPatient,
  PaginationControls,
  openPatientProfile,
}: PatientsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);

  // 📝 Variables de control para la simulación secuencial
  const [indiceExcel, setIndiceExcel] = useState(0);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<'laboratorio' | 'imagenologia'>('laboratorio');

  // 🌟 ESTADOS INDEPENDIENTES PARA NOMBRES Y APELLIDOS SEPARADOS
  const [paterno, setPaterno] = useState('');
  const [materno, setMaterno] = useState('');
  const [nombres, setNombres] = useState('');

  // 🗑️ FUNCIÓN CONTROLADA PARA ELIMINAR PACIENTE
  const ejecutarEliminacion = async (paciente: any) => {
    const targetId = paciente._id || paciente.id || paciente.patientId;
    if (!targetId) {
      alert("⚠️ Error: No se encontró el ID único del paciente para eliminar.");
      return;
    }

    const seguro = window.confirm(
      `🗑️ ¿Estás seguro de que deseas eliminar al paciente "${paciente.lastName || ''}, ${paciente.firstName || ''}"?\n\nEsta acción no se puede deshacer.`
    );

    if (seguro) {
      try {
        await handleDelete('patient', targetId);
      } catch (error) {
        console.error("Error al eliminar paciente:", error);
        alert("❌ Ocurrió un error al intentar eliminar el registro.");
      }
    }
  };

  // Sincroniza los estados separados cuando se va a editar un paciente existente
  useEffect(() => {
    if (newPatient) {
      setNombres(newPatient.firstName || '');
      const lastNameParts = (newPatient.lastName || '').trim().split(' ');
      if (lastNameParts.length > 1) {
        setPaterno(lastNameParts[0] || '');
        setMaterno(lastNameParts.slice(1).join(' ') || '');
      } else {
        setPaterno(lastNameParts[0] || '');
        setMaterno('');
      }
    }
  }, [newPatient.firstName, newPatient.lastName]);

  const manejarCargaPlantillaExcel = () => {
    if (!listaPacientesPrueba || listaPacientesPrueba.length === 0) return;
    
    const p = listaPacientesPrueba[indiceExcel] as any;
    
    setPaterno(p.paterno || '');
    setMaterno(p.materno || '');
    setNombres(p.nombres || '');

    setNewPatient({
      ...newPatient,
      patientId: `CNS-${p.cod}`,
      documentId: p.cod,
      firstName: p.nombres,
      lastName: `${p.paterno} ${p.materno}`.trim(),
      gender: p.genero === 'Masculino' ? 'M' : 'F',
      dateOfBirth: "1992-08-24", 
      edad: p.edad || "33",
      phone: p.telefono || "71524311",
      email: "cns.admision@gmail.com",
      codigoBeneficiario: p.codigoBeneficiario || "50",
      numeroAsegurado: p.cod
    });

    if (p.servicioSeleccionado) {
      setServicioSeleccionado(p.servicioSeleccionado);
    }
    setIndiceExcel((prev) => (prev + 1) % listaPacientesPrueba.length);
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedPatients = React.useMemo(() => {
    let sortableItems = [...patients.filter(fuzzySearch)];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key as keyof Patient] as any;
        let bValue = b[sortConfig.key as keyof Patient] as any;

        if (sortConfig.key === 'fullName') {
          aValue = `${a.lastName || ''} ${a.firstName || ''}`.trim().toLowerCase();
          bValue = `${b.lastName || ''} ${b.firstName || ''}`.trim().toLowerCase();
        } else if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = (bValue || '').toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [patients, fuzzySearch, sortConfig]);

  const getSortIcon = (key: string) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return <span className="text-gray-500 opacity-50">↕</span>;
  };

  useEffect(() => {
    if (isEditing && editingItem?.type === 'patient') setIsModalOpen(true);
  }, [isEditing, editingItem]);

  const openCreateModal = () => {
    setPaterno('');
    setMaterno('');
    setNombres('');
    setIsModalOpen(true);
    setIsCreatingPatient(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsCreatingPatient(false);
    if (isEditing) handleCancelEdit();
  };

  const isEditingPatient = isEditing && editingItem?.type === 'patient';

  return (
    <div className="bg-[#0e1715] rounded-lg border border-[#2a403a] p-6 text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Pacientes</h2>
        <button
          onClick={openCreateModal}
          className="bg-[#00bfa5] text-[#04140f] px-4 py-2 rounded text-sm hover:bg-[#00d4b8] transition-colors font-bold"
        >
          + Nuevo Registro Unificado
        </button>
      </div>

      {/* ── MODAL CON CAMPOS SEPARADOS DE NOMBRE Y APELLIDOS ── */}
      <RisModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditingPatient ? 'Editar Paciente' : 'Formulario de Admisión Unificada (CNS El Alto)'}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();

            newPatient.firstName = nombres.trim();
            newPatient.lastName = `${paterno} ${materno}`.trim();

            if (!newPatient.patientId) {
              newPatient.patientId = `CNS-${newPatient.documentId || Date.now()}`;
            }

            if (isEditingPatient) {
              await handleUpdate(e);
            } else {
              await handleCreatePatient(e);
              alert("🎉 ¡Paciente guardado y sincronizado con éxito!");
            }
            setIsModalOpen(false);
            setIsCreatingPatient(false);
          }}
          className="space-y-6"
        >
          {/* Botón superior de simulación */}
          <div className="flex justify-end">
            <button 
              type="button" 
              onClick={manejarCargaPlantillaExcel}
              className="px-3 py-1.5 bg-[#00bfa5]/10 text-[#00bfa5] border border-[#00bfa5]/30 rounded-lg text-xs font-semibold hover:bg-[#00bfa5]/20 transition-all active:scale-95 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              ✨ Cargar Fila Excel ({indiceExcel + 1}/10)
            </button>
          </div>

          {/* CAMINO PRIMARIO: PARSER QR */}
          <div className="p-4 bg-black/40 border border-[#2a403a] rounded-lg">
            <label className="block text-[11px] font-bold text-[#00bfa5] uppercase tracking-wider mb-2">
              📷 CAMINO PRIMARIO: PARSER QR BOLETA CNS EL ALTO
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Dispare la lectora QR sobre la boleta física..." 
                className="flex-1 p-2.5 bg-black border border-[#2a403a] rounded text-xs focus:outline-none focus:border-[#00bfa5] text-white"
              />
              <button type="button" className="px-5 bg-[#00bfa5] text-[#04140f] text-xs font-bold rounded hover:bg-[#00d4b8] transition-colors">Procesar</button>
            </div>
          </div>

          {/* DATOS DE FILIACIÓN CON APELLIDOS Y NOMBRES SEPARADOS */}
          <div className="space-y-4">
            <div className="border-b border-[#2a403a] pb-1">
              <span className="text-xs text-gray-400 font-medium">📋 Datos de Filiación Unificada</span>
            </div>

            {/* FILA 1: CÉDULA / MATRÍCULA */}
            <div>
              <label className="block text-gray-400 mb-1 font-bold text-xs">CÉDULA DE IDENTIDAD / MATRÍCULA CNS *</label>
              <input 
                required
                type="text" 
                placeholder="Ej. 6842105 ó MAT-20481-R" 
                value={newPatient.documentId || ''} 
                onChange={(e) => {
                  const val = e.target.value;
                  setNewPatient({ 
                    ...newPatient, 
                    documentId: val,
                    patientId: `CNS-${val}`
                  });
                }} 
                className="w-full p-3 rounded-lg bg-black border border-[#2a403a] text-white text-xs focus:border-[#00bfa5] outline-none" 
              />
            </div>

            {/* FILA 2: APELLIDO PATERNO, APELLIDO MATERNO Y NOMBRES SEPARADOS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-bold">APELLIDO PATERNO *</label>
                <input 
                  required 
                  type="text" 
                  placeholder="" 
                  value={paterno} 
                  onChange={(e) => setPaterno(e.target.value)} 
                  className="w-full p-3 rounded-lg bg-black border border-[#2a403a] text-white focus:border-[#00bfa5] outline-none" 
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-bold">APELLIDO MATERNO</label>
                <input 
                  type="text" 
                  placeholder="" 
                  value={materno} 
                  onChange={(e) => setMaterno(e.target.value)} 
                  className="w-full p-3 rounded-lg bg-black border border-[#2a403a] text-white focus:border-[#00bfa5] outline-none" 
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-bold">NOMBRES *</label>
                <input 
                  required 
                  type="text" 
                  placeholder="" 
                  value={nombres} 
                  onChange={(e) => setNombres(e.target.value)} 
                  className="w-full p-3 rounded-lg bg-black border border-[#2a403a] text-white focus:border-[#00bfa5] outline-none" 
                />
              </div>
            </div>

            {/* FILA 3: FECHA NACIMIENTO, EDAD Y SEXO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-bold">FECHA DE NACIMIENTO</label>
                <input 
                  type="date" 
                  value={newPatient.dateOfBirth?.split('T')[0] || ''} 
                  onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })} 
                  className="w-full p-3 rounded-lg bg-black border border-[#2a403a] text-white focus:border-[#00bfa5] outline-none" 
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-bold">EDAD (AÑOS)</label>
                <input 
                  type="text" 
                  placeholder="" 
                  value={newPatient.edad || (newPatient.dateOfBirth ? calcularEdadLocal(newPatient.dateOfBirth).replace(' años', '') : '')} 
                  onChange={(e) => setNewPatient({ ...newPatient, edad: e.target.value })} 
                  className="w-full p-3 rounded-lg bg-black border border-[#2a403a] text-white focus:border-[#00bfa5] outline-none font-mono" 
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-bold">GÉNERO / SEXO</label>
                <select value={newPatient.gender || 'U'} onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })} className="w-full p-3 rounded-lg bg-black border border-[#2a403a] text-white focus:border-[#00bfa5] outline-none">
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                  <option value="U">Desconocido</option>
                </select>
              </div>
            </div>

            {/* FILA 4: CÓDIGO BENEFICIARIO Y Nº ASEGURADO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-bold">CÓDIGO BENEFICIARIO</label>
                <input type="text" placeholder="Ej. 0 (Titular), 1 (Cónyuge)..." value={newPatient.codigoBeneficiario || ''} onChange={(e) => setNewPatient({ ...newPatient, codigoBeneficiario: e.target.value })} className="w-full p-3 rounded-lg bg-black border border-[#2a403a] text-white focus:border-[#00bfa5] outline-none" />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-bold">Nº DE ASEGURADO</label>
                <input type="text" placeholder="Nº de asegurado CNS" value={newPatient.numeroAsegurado || ''} onChange={(e) => setNewPatient({ ...newPatient, numeroAsegurado: e.target.value })} className="w-full p-3 rounded-lg bg-black border border-[#2a403a] text-white focus:border-[#00bfa5] outline-none" />
              </div>
            </div>
          </div>

          {/* 🌟 SELECTOR DE SERVICIO POST-REGISTRO (CONSERVADO INTACTO) */}
          <div className="space-y-3">
            <div className="border-b border-[#2a403a] pb-1">
              <span className="text-xs text-gray-400 font-medium">🔄 Selector de Servicio Post-Registro</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => setServicioSeleccionado('imagenologia')}
                className={`p-4 rounded-lg cursor-pointer border transition-all text-left ${servicioSeleccionado === 'imagenologia' ? 'border-[#00bfa5] bg-[#00bfa5]/5' : 'border-[#2a403a] bg-black'}`}
              >
                <span className="block font-bold text-xs">🗓️ Imagenología</span>
                <span className="block text-[11px] text-gray-400 mt-1">Flujo con agenda horaria fija.</span>
              </div>

              <div 
                onClick={() => setServicioSeleccionado('laboratorio')}
                className={`p-4 rounded-lg cursor-pointer border transition-all text-left ${servicioSeleccionado === 'laboratorio' ? 'border-[#00bfa5] bg-[#00bfa5]/5' : 'border-[#2a403a] bg-black'}`}
              >
                <span className="block font-bold text-xs">🧪 Laboratorio Clínico</span>
                <span className="block text-[11px] text-gray-400 mt-1">Sin agenda horaria. Proceso por lote.</span>
              </div>
            </div>
          </div>

          {/* BOTONES ACCIONES DEL FORMULARIO */}
          <div className="flex gap-3 pt-4 border-t border-[#2a403a] mt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 bg-black border border-gray-600 text-gray-300 py-3 rounded-lg font-bold text-xs hover:bg-gray-800 transition-colors"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#00bfa5] text-[#04140f] py-3 rounded-lg font-bold text-xs uppercase hover:bg-[#00d4b8] transition-colors"
            >
              {isEditingPatient ? 'ACTUALIZAR DATOS' : 'CONFIRMAR Y GUARDAR EN MONGO →'}
            </button>
          </div>
        </form>
      </RisModal>

      {/* ── TABLA ESTÁNDAR RESPONSIVA CON EDAD ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#0a1310] text-xs text-gray-400">
            <tr>
              <th className="p-3 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('documentId')}>Cédula / Matrícula <span className="ml-1 text-[10px]">{getSortIcon('documentId')}</span></th>
              <th className="p-3 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('fullName')}>Nombre Completo <span className="ml-1 text-[10px]">{getSortIcon('fullName')}</span></th>
              <th className="p-3">Edad</th>
              <th className="p-3 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('gender')}>Sexo <span className="ml-1 text-[10px]">{getSortIcon('gender')}</span></th>
              <th className="p-3 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('dateOfBirth')}>Nacimiento <span className="ml-1 text-[10px]">{getSortIcon('dateOfBirth')}</span></th>
              <th className="p-3">Contacto</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f332d] text-xs">
            {sortedPatients.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-[#00bfa5]">
                  No hay pacientes que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              paginate(sortedPatients).map((p: any) => (
                <tr key={p._id || p.id || p.patientId} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3">
                    <span className="font-bold text-[#00bfa5]">{p.documentId || p.patientId}</span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => openPatientProfile?.(p)}
                      className="text-white hover:text-[#00bfa5] font-medium hover:underline text-left"
                      title="Ver Perfil del Paciente"
                    >
                      {p.lastName}, {p.firstName}
                    </button>
                  </td>
                  <td className="p-3 font-mono font-bold text-gray-300">
                    {p.edad || calcularEdadLocal(p.dateOfBirth)}
                  </td>
                  <td className="p-3">
                    {['male', 'masculino', 'm'].includes((p.gender || '').toLowerCase()) ? 'Masculino' : 'Femenino'}
                  </td>
                  <td className="p-3">
                    {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString('es-419') : '-'}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col text-xs text-gray-300 gap-1">
                      {p.phone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-gray-400" /> {p.phone}</span>}
                      {p.email && <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-gray-400" /> {p.email}</span>}
                      {!p.phone && !p.email && '-'}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => { handleEdit('patient', p); setIsModalOpen(true); }}
                      className="text-[#00bfa5] hover:text-white mr-3 font-medium"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => ejecutarEliminacion(p)}
                      className="text-red-500 hover:text-red-400 font-medium transition-colors hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <PaginationControls totalItems={sortedPatients.length} />
    </div>
  );
}