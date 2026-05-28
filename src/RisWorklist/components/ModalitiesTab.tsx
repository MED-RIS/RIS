import React, { useState, useEffect } from 'react';
import RisModal from './RisModal';

export default function ModalitiesTab({
  modalities,
  fuzzySearch,
  paginate,
  isCreatingModality,
  setIsCreatingModality,
  isEditing,
  editingItem,
  handleCreateModality,
  handleUpdate,
  handleCancelEdit,
  handleEdit,
  handleDelete,
  newModality,
  setNewModality,
  PaginationControls,
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedModalities = React.useMemo(() => {
    let sortableItems = [...modalities.filter(fuzzySearch)];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [modalities, fuzzySearch, sortConfig]);

  const getSortIcon = (key: string) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return <span className="text-gray-500 opacity-50">↕</span>;
  };

  useEffect(() => {
    if (isEditing && editingItem?.type === 'modality') setIsModalOpen(true);
  }, [isEditing, editingItem]);

  const openCreateModal = () => {
    setIsModalOpen(true);
    setIsCreatingModality(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsCreatingModality(false);
    if (isEditing) handleCancelEdit();
  };

  const isEditingModality = isEditing && editingItem?.type === 'modality';

  return (
    <div className="bg-primary-main rounded-lg border border-secondary-dark p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Modalidades</h2>
        <button
          onClick={openCreateModal}
          className="bg-primary-dark border border-secondary-dark px-4 py-2 rounded text-sm hover:bg-primary-light hover:text-black transition-colors"
        >
          + Nueva
        </button>
      </div>

      {/* ── Modal ──────────────────────────────────────────────────── */}
      <RisModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditingModality ? 'Editar Modalidad' : 'Nueva Modalidad'}
      >
        <form
          onSubmit={(e) => {
            isEditingModality ? handleUpdate(e) : handleCreateModality(e);
            setIsModalOpen(false);
            setIsCreatingModality(false);
          }}
          className="flex flex-col gap-4"
        >
          <input
            required
            placeholder="Nombre (ej: Rayos X)"
            value={newModality.name || ''}
            onChange={(e) => setNewModality({ ...newModality, name: e.target.value })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
          />
          <input
            required
            placeholder="Código DICOM (ej: DX)"
            value={newModality.dicom_code || ''}
            onChange={(e) => setNewModality({ ...newModality, dicom_code: e.target.value })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
          />
          <input
            placeholder="Descripción"
            value={newModality.description || ''}
            onChange={(e) => setNewModality({ ...newModality, description: e.target.value })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
          />

          <div className="flex gap-3 pt-4 border-t border-secondary-dark mt-2">
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
              {isEditingModality ? 'ACTUALIZAR' : 'GUARDAR'}
            </button>
          </div>
        </form>
      </RisModal>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <table className="w-full text-left text-sm">
        <thead className="bg-secondary-dark">
          <tr>
            <th className="p-3 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('dicom_code')}>Código <span className="ml-1 text-[10px]">{getSortIcon('dicom_code')}</span></th>
            <th className="p-3 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('name')}>Nombre <span className="ml-1 text-[10px]">{getSortIcon('name')}</span></th>
            <th className="p-3 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('description')}>Descripción <span className="ml-1 text-[10px]">{getSortIcon('description')}</span></th>
            <th className="p-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary-dark">
          {sortedModalities.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-6 text-primary-light">
                No hay modalidades que coincidan con la búsqueda.
              </td>
            </tr>
          ) : (
            paginate(sortedModalities).map((m: any) => (
              <tr key={m._id} className="hover:bg-primary-dark">
                <td className="p-3 font-bold">{m.dicom_code}</td>
                <td className="p-3">{m.name}</td>
                <td className="p-3 text-gray-400">{m.description}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => { handleEdit('modality', m); setIsModalOpen(true); }}
                    className="text-primary-light hover:text-white mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete('modality', m._id)}
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
      <PaginationControls totalItems={sortedModalities.length} />
    </div>
  );
}
