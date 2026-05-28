import React, { useState, useEffect } from 'react';
import { Phone, Mail } from 'lucide-react';
import RisModal from './RisModal';

import { Patient } from '../types';

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
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'fullName') {
          aValue = `${a.lastName || ''} ${a.firstName || ''}`.trim().toLowerCase();
          bValue = `${b.lastName || ''} ${b.firstName || ''}`.trim().toLowerCase();
        } else if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = (bValue || '').toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
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

  // Open modal when editing is triggered externally
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
    <div className="bg-primary-main rounded-lg border border-secondary-dark p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Pacientes</h2>
        <button
          onClick={openCreateModal}
          className="bg-primary-dark border border-secondary-dark px-4 py-2 rounded text-sm hover:bg-primary-light hover:text-black transition-colors"
        >
          + Nuevo
        </button>
      </div>

      {/* ── Modal ──────────────────────────────────────────────────── */}
      <RisModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            isEditingPatient ? handleUpdate(e) : handleCreatePatient(e);
            setIsModalOpen(false);
            setIsCreatingPatient(false);
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Identificación */}
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 mb-1 block">MRN (ID Interno) *</label>
            <input
              required
              placeholder="Ej. MRN-12345"
              value={newPatient.patientId || ''}
              onChange={(e) => setNewPatient({ ...newPatient, patientId: e.target.value })}
              className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 mb-1 block">Cédula / DNI</label>
            <input
              placeholder="Número de identidad"
              value={newPatient.documentId || ''}
              onChange={(e) => setNewPatient({ ...newPatient, documentId: e.target.value })}
              className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
            />
          </div>

          {/* Nombre completo */}
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 mb-1 block">Nombre *</label>
            <input
              required
              placeholder="Nombres"
              value={newPatient.firstName || ''}
              onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
              className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 mb-1 block">Apellido *</label>
            <input
              required
              placeholder="Apellidos"
              value={newPatient.lastName || ''}
              onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
              className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
            />
          </div>

          {/* Demografía */}
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 mb-1 block">
              Fecha de nacimiento
            </label>
            <input
              type="date"
              value={newPatient.dateOfBirth?.split('T')[0] || ''}
              onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
              className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 mb-1 block">Sexo</label>
            <select
              value={newPatient.gender || 'U'}
              onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
              className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
            >
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
              <option value="U">Desconocido</option>
            </select>
          </div>

          {/* Contacto */}
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 mb-1 block">Teléfono</label>
            <input
              type="tel"
              placeholder="Ej. 0999999999"
              value={newPatient.phone || ''}
              onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
              className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 mb-1 block">Correo Electrónico</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={newPatient.email || ''}
              onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
              className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 mb-1 block">Dirección</label>
            <input
              placeholder="Dirección completa"
              value={newPatient.address || ''}
              onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
              className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
            />
          </div>

          <div className="col-span-2 flex gap-3 pt-4 border-t border-secondary-dark mt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 bg-black border border-gray-600 text-gray-300 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary-light text-black py-3 rounded-lg font-bold hover:bg-white transition-colors"
            >
              {isEditingPatient ? 'ACTUALIZAR' : 'GUARDAR'}
            </button>
          </div>
        </form>
      </RisModal>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-secondary-dark">
            <tr>
              <th className="p-3 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('patientId')}>MRN / ID <span className="ml-1 text-[10px]">{getSortIcon('patientId')}</span></th>
              <th className="p-3 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('fullName')}>Nombre Completo <span className="ml-1 text-[10px]">{getSortIcon('fullName')}</span></th>
              <th className="p-3 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('gender')}>Sexo <span className="ml-1 text-[10px]">{getSortIcon('gender')}</span></th>
              <th className="p-3 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('dateOfBirth')}>Nacimiento <span className="ml-1 text-[10px]">{getSortIcon('dateOfBirth')}</span></th>
              <th className="p-3">Contacto</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-dark">
            {sortedPatients.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-primary-light">
                  No hay pacientes que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              paginate(sortedPatients).map((p: any) => (
                <tr key={p._id} className="hover:bg-primary-dark">
                  <td className="p-3">
                    <span className="font-bold">{p.patientId}</span>
                    {p.documentId && <span className="block text-xs text-gray-400">{p.documentId}</span>}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => openPatientProfile?.(p)}
                      className="text-primary-light hover:text-white font-medium hover:underline transition-colors text-left"
                      title="Ver Perfil del Paciente"
                    >
                      {p.lastName}, {p.firstName}
                    </button>
                  </td>
                  <td className="p-3">{(p.gender || '').toLowerCase() === 'male' || (p.gender || '').toLowerCase() === 'masculino' || (p.gender || '').toLowerCase() === 'm' ? 'Masculino' : (p.gender || '').toLowerCase() === 'female' || (p.gender || '').toLowerCase() === 'femenino' || (p.gender || '').toLowerCase() === 'f' ? 'Femenino' : p.gender || 'No especificado'}</td>
                  <td className="p-3">
                    {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString('es-419') : '-'}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col text-xs text-gray-300 gap-1 mt-1">
                      {p.phone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-gray-400" /> {p.phone}</span>}
                      {p.email && <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-gray-400" /> {p.email}</span>}
                      {!p.phone && !p.email && '-'}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => { handleEdit('patient', p); setIsModalOpen(true); }}
                      className="text-primary-light hover:text-white mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete('patient', p._id)}
                      className="text-red-500 hover:text-red-400"
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
