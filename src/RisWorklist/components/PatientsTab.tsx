// src/RisWorklist/components/PatientsTab.tsx
import React, { useState, useEffect } from 'react';
import { Phone, Mail, Sparkles, ClipboardList } from 'lucide-react';
import RisModal from './RisModal';

import { Patient } from '../types';

// 📦 Importamos los 10 pacientes unificados de tu plantilla Excel locales
import { listaPacientesPrueba } from './pacientesMock';

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

  // 📝 Variables de control para la simulación secuencial de tu plantilla Excel
  const [indiceExcel, setIndiceExcel] = useState(0);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<'laboratorio' | 'imagenologia'>('laboratorio');

  // 🪄 FUNCIÓN MÁGICA: Carga la fila de Excel traduciendo los datos al molde del estado de React
  const manejarCargaPlantillaExcel = () => {
    if (!listaPacientesPrueba || listaPacientesPrueba.length === 0) return;
    
    const p = listaPacientesPrueba[indiceExcel] as any;
    
    // Mapeamos los campos en español de la plantilla a las variables tipadas de tu base de datos NoSQL
    setNewPatient({
      ...newPatient,
      patientId: `MRN-${p.cod}`, // Formato PACS / MRN exigido por el modelo
      documentId: p.cod,         // Tu Cédula / Matrícula CNS
      firstName: p.nombres,
      lastName: `${p.paterno} ${p.materno}`.trim(),
      gender: p.genero === 'Masculino' ? 'M' : 'F',
      dateOfBirth: "1992-08-24", // Fecha estructurada por defecto
      phone: p.telefono || "71524311",
      email: "cns.admision@gmail.com"
    });

    // Cambiamos el selector dinámicamente si la plantilla viene amarrada a un servicio específico
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
    <div className="bg-primary-main rounded-lg border border-secondary-dark p-6 text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Pacientes</h2>
        <button
          onClick={openCreateModal}
          className="bg-primary-dark border border-secondary-dark px-4 py-2 rounded text-sm hover:bg-primary-light hover:text-black transition-colors font-bold"
        >
          + Nuevo Registro Unificado
        </button>
      </div>

      {/* ── MODAL COMPLETAMENTE TRADUCIDO A TU DISEÑO CNS EL ALTO ── */}
      <RisModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditingPatient ? 'Editar Paciente' : 'Formulario de Admisión Unificada (CNS El Alto)'}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            // Ejecutamos tus funciones nativas del dashboard que crean en MongoDB usando el método POST limpio
            if (isEditingPatient) {
              await handleUpdate(e);
            } else {
              await handleCreatePatient(e);
              alert("🎉 ¡Paciente guardado y sincronizado con éxito en MongoDB!");
            }
            setIsModalOpen(false);
            setIsCreatingPatient(false);
          }}
          className="space-y-6"
        >
          {/* Botón superior de carga para la simulación */}
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
          <div className="p-4 bg-black/40 border border-secondary-dark rounded-lg">
            <label className="block text-[11px] font-bold text-[#00bfa5] uppercase tracking-wider mb-2">
              📷 CAMINO PRIMARIO: PARSER QR BOLETA CNS EL ALTO
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Dispare la lectora QR sobre la boleta física..." 
                className="flex-1 p-2.5 bg-black border border-secondary-dark rounded text-xs focus:outline-none focus:border-primary-light text-white"
              />
              <button type="button" className="px-5 bg-primary-dark border border-secondary-dark text-white text-xs font-bold rounded hover:bg-primary-light hover:text-black transition-colors">Procesar</button>
            </div>
          </div>

          {/* DATOS DE FILIACIÓN (Vinculados a tu estado native newPatient) */}
          <div className="space-y-4">
            <div className="border-b border-secondary-dark pb-1">
              <span className="text-xs text-gray-400 font-medium">📋 Datos de Filiación Unificada (Principio P1)</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-bold">MRN / ID INTERNO PACS *</label>
                <input required type="text" placeholder="Ej. MRN-12345" value={newPatient.patientId || ''} onChange={(e) => setNewPatient({ ...newPatient, patientId: e.target.value })} className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none" />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-bold">CÉDULA DE IDENTIDAD / MATRÍCULA</label>
                <input type="text" placeholder="Número de identidad" value={newPatient.documentId || ''} onChange={(e) => setNewPatient({ ...newPatient, documentId: e.target.value })} className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-bold">NOMBRES COMPLETOS *</label>
                <input required type="text" placeholder="Nombres" value={newPatient.firstName || ''} onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })} className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none" />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-bold">APELLIDOS COMPLETOS *</label>
                <input required type="text" placeholder="Apellidos" value={newPatient.lastName || ''} onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })} className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-bold">FECHA DE NACIMIENTO</label>
                <input type="date" value={newPatient.dateOfBirth?.split('T')[0] || ''} onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })} className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none" />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-bold">GÉNERO / SEXO</label>
                <select value={newPatient.gender || 'U'} onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })} className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none">
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                  <option value="U">Desconocido</option>
                </select>
              </div>
            </div>
          </div>

          {/* SELECTOR DE SERVICIO POST-REGISTRO */}
          <div className="space-y-3">
            <div className="border-b border-secondary-dark pb-1">
              <span className="text-xs text-gray-400 font-medium">🔄 Selector de Servicio Post-Registro</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => setServicioSeleccionado('imagenologia')}
                className={`p-4 rounded-lg cursor-pointer border transition-all text-left ${servicioSeleccionado === 'imagenologia' ? 'border-[#00bfa5] bg-[#00bfa5]/5' : 'border-secondary-dark bg-black'}`}
              >
                <span className="block font-bold text-xs">🗓️ Imagenología</span>
                <span className="block text-[11px] text-gray-400 mt-1">Flujo con agenda horaria fija.</span>
              </div>

              <div 
                onClick={() => setServicioSeleccionado('laboratorio')}
                className={`p-4 rounded-lg cursor-pointer border transition-all text-left ${servicioSeleccionado === 'laboratorio' ? 'border-[#00bfa5] bg-[#00bfa5]/5' : 'border-secondary-dark bg-black'}`}
              >
                <span className="block font-bold text-xs">🧪 Laboratorio Clínico</span>
                <span className="block text-[11px] text-gray-400 mt-1">Sin agenda horaria. Proceso por lote.</span>
              </div>
            </div>
          </div>

          {/* BOTONES ACCIONES DEL FORMULARIO */}
          <div className="col-span-2 flex gap-3 pt-4 border-t border-secondary-dark mt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 bg-black border border-gray-600 text-gray-300 py-3 rounded-lg font-bold text-xs hover:bg-gray-800 transition-colors"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary-light text-black py-3 rounded-lg font-bold text-xs uppercase hover:bg-white transition-colors"
            >
              {isEditingPatient ? 'ACTUALIZAR DATOS' : 'CONFIRMAR Y GUARDAR EN MONGO →'}
            </button>
          </div>
        </form>
      </RisModal>

      {/* ── TABLA ESTÁNDAR RESPONSIVA ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-secondary-dark text-xs text-gray-400">
            <tr>
              <th className="p-3 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('patientId')}>MRN / ID <span className="ml-1 text-[10px]">{getSortIcon('patientId')}</span></th>
              <th className="p-3 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('fullName')}>Nombre Completo <span className="ml-1 text-[10px]">{getSortIcon('fullName')}</span></th>
              <th className="p-3 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('gender')}>Sexo <span className="ml-1 text-[10px]">{getSortIcon('gender')}</span></th>
              <th className="p-3 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('dateOfBirth')}>Nacimiento <span className="ml-1 text-[10px]">{getSortIcon('dateOfBirth')}</span></th>
              <th className="p-3">Contacto</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-dark text-xs">
            {sortedPatients.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-primary-light">
                  No hay pacientes que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              paginate(sortedPatients).map((p: any) => (
                <tr key={p._id} className="hover:bg-primary-dark/40 transition-colors">
                  <td className="p-3">
                    <span className="font-bold text-[#00bfa5]">{p.patientId}</span>
                    {p.documentId && <span className="block text-xs text-gray-400">{p.documentId}</span>}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => openPatientProfile?.(p)}
                      className="text-primary-light hover:text-white font-medium hover:underline text-left"
                      title="Ver Perfil del Paciente"
                    >
                      {p.lastName}, {p.firstName}
                    </button>
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
                      className="text-primary-light hover:text-white mr-3 font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete('patient', p._id)}
                      className="text-red-500 hover:text-red-400 font-medium"
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