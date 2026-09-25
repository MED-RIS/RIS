import React, { useState, useEffect } from 'react';
import RisModal from './RisModal';
import { pingEquipment } from '../risService';
import { toast } from '@ohif/ui-next';
import { Wifi, Loader2 } from 'lucide-react';

export default function EquipmentTab({
  equipmentList,
  fuzzySearch,
  paginate,
  isCreatingEquipment,
  setIsCreatingEquipment,
  isEditing,
  editingItem,
  handleCreateEquipment,
  handleUpdate,
  handleCancelEdit,
  handleEdit,
  handleDelete,
  newEquipment,
  setNewEquipment,
  PaginationControls,
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const testConnection = async (equipment: any) => {
    if (!equipment.ipAddress || !equipment.aeTitle) {
      toast.error('Para probar la conexión, primero completa la IP y el AE Title del equipo.');
      return;
    }
    setTestingId(equipment._id);
    try {
      const result = await pingEquipment(equipment);
      toast.success(result.message || 'Conexión exitosa con el equipo (C-ECHO).');
    } catch (error) {
      toast.error(`Sin respuesta del equipo: ${(error as Error).message}`);
    } finally {
      setTestingId(null);
    }
  };

  useEffect(() => {
    if (isEditing && editingItem?.type === 'equipment') setIsModalOpen(true);
  }, [isEditing, editingItem]);

  const openCreateModal = () => {
    setIsModalOpen(true);
    setIsCreatingEquipment(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsCreatingEquipment(false);
    if (isEditing) handleCancelEdit();
  };

  const isEditingEquipment = isEditing && editingItem?.type === 'equipment';

  return (
    <div className="bg-primary-main rounded-lg border border-secondary-dark p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Equipos</h2>
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
        title={isEditingEquipment ? 'Editar Equipo' : 'Nuevo Equipo'}
      >
        <form
          onSubmit={(e) => {
            isEditingEquipment ? handleUpdate(e) : handleCreateEquipment(e);
            setIsModalOpen(false);
            setIsCreatingEquipment(false);
          }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <input
            required
            placeholder="Nombre del Equipo"
            value={newEquipment.name || ''}
            onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors col-span-2"
          />
          <input
            placeholder="Fabricante"
            value={newEquipment.manufacturer || ''}
            onChange={(e) => setNewEquipment({ ...newEquipment, manufacturer: e.target.value })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
          />
          <input
            placeholder="Modelo"
            value={newEquipment.model || ''}
            onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
          />
          <input
            placeholder="Número de Serie (S/N)"
            value={newEquipment.serial_number || ''}
            onChange={(e) => setNewEquipment({ ...newEquipment, serial_number: e.target.value })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors col-span-2"
          />

          <div className="col-span-2 border-t border-secondary-dark pt-4 mt-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Conexión DICOM (para el worklist y el PACS)</p>
          </div>
          <input
            placeholder="Modalidad (ej. CT, DX, US)"
            value={newEquipment.modality || ''}
            onChange={(e) => setNewEquipment({ ...newEquipment, modality: e.target.value.toUpperCase() })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
          />
          <input
            placeholder="AE Title"
            value={newEquipment.aeTitle || ''}
            onChange={(e) => setNewEquipment({ ...newEquipment, aeTitle: e.target.value.toUpperCase() })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
          />
          <input
            placeholder="Dirección IP"
            value={newEquipment.ipAddress || ''}
            onChange={(e) => setNewEquipment({ ...newEquipment, ipAddress: e.target.value })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
          />
          <input
            type="number"
            placeholder="Puerto DICOM"
            value={newEquipment.dicomPort ?? 104}
            onChange={(e) => setNewEquipment({ ...newEquipment, dicomPort: Number(e.target.value) })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
          />

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
              {isEditingEquipment ? 'ACTUALIZAR' : 'GUARDAR'}
            </button>
          </div>
        </form>
      </RisModal>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div className="overflow-x-auto w-full custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary-dark">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Fabricante</th>
              <th className="p-3">Modelo</th>
              <th className="p-3">S/N</th>
              <th className="p-3">Conexión DICOM</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-dark">
            {equipmentList.filter(fuzzySearch).length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-primary-light">
                  No hay equipos que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              paginate(equipmentList.filter(fuzzySearch)).map((e: any) => (
                <tr key={e._id} className="hover:bg-primary-dark">
                  <td className="p-3">{e.name}</td>
                  <td className="p-3">{e.manufacturer}</td>
                  <td className="p-3">{e.model}</td>
                  <td className="p-3">{e.serial_number}</td>
                  <td className="p-3">
                    {e.aeTitle && e.ipAddress ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-300">{e.aeTitle} · {e.ipAddress}:{e.dicomPort || 104}</span>
                        <button
                          type="button"
                          onClick={() => testConnection(e)}
                          disabled={testingId === e._id}
                          className="flex items-center gap-1.5 w-max px-2 py-1 rounded border border-cyan-500/40 bg-cyan-900/20 text-cyan-300 text-[10px] font-bold uppercase hover:bg-cyan-900/40 hover:text-white transition-colors disabled:opacity-50"
                        >
                          {testingId === e._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wifi className="w-3 h-3" />}
                          Probar conexión
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">Sin configurar</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => { handleEdit('equipment', e); setIsModalOpen(true); }}
                      className="text-primary-light hover:text-white mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete('equipment', e._id)}
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
      <PaginationControls totalItems={equipmentList.filter(fuzzySearch).length} />
    </div>
  );
}
