import React, { useState, useEffect } from 'react';
import RisModal from './RisModal';

export default function ServicesTab({
  services,
  branches,
  modalities,
  fuzzySearch,
  paginate,
  isCreatingService,
  setIsCreatingService,
  isEditing,
  editingItem,
  handleCreateService,
  handleUpdate,
  handleCancelEdit,
  handleEdit,
  handleDelete,
  newService,
  setNewService,
  PaginationControls,
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModalityFilter, setSelectedModalityFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredServices = services
    .filter((s: any) => selectedModalityFilter ? s.fk_modality?._id === selectedModalityFilter : true)
    .filter(fuzzySearch);

  const sortedServices = React.useMemo(() => {
    let sortableItems = [...filteredServices];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'fk_modality_name') {
           aValue = a.fk_modality?.name || '';
           bValue = b.fk_modality?.name || '';
        }
        if (sortConfig.key === 'fk_branch_name') {
           aValue = a.fk_branch?.name || '';
           bValue = b.fk_branch?.name || '';
        }
        
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredServices, sortConfig]);

  const getSortIcon = (key: string) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return <span className="text-gray-500 opacity-50">↕</span>;
  };

  useEffect(() => {
    if (isEditing && editingItem?.type === 'service') setIsModalOpen(true);
  }, [isEditing, editingItem]);

  const openCreateModal = () => {
    setIsModalOpen(true);
    setIsCreatingService(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsCreatingService(false);
    if (isEditing) handleCancelEdit();
  };

  const isEditingService = isEditing && editingItem?.type === 'service';

  return (
    <div className="bg-primary-main rounded-lg border border-secondary-dark p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Servicios / Procedimientos</h2>
        <div className="flex items-center gap-4">
          <select
            value={selectedModalityFilter}
            onChange={(e) => setSelectedModalityFilter(e.target.value)}
            className="p-2 rounded bg-black border border-secondary-dark text-white text-sm outline-none"
          >
            <option value="">Todas las Modalidades</option>
            {modalities.map((m: any) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
          <button
            onClick={openCreateModal}
            className="bg-primary-dark border border-secondary-dark px-4 py-2 rounded text-sm hover:bg-primary-light hover:text-black transition-colors"
          >
            + Nuevo
          </button>
        </div>
      </div>

      {/* ── Modal ──────────────────────────────────────────────────── */}
      <RisModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditingService ? 'Editar Servicio' : 'Nuevo Servicio / Procedimiento'}
      >
        <form
          onSubmit={(e) => {
            isEditingService ? handleUpdate(e) : handleCreateService(e);
            setIsModalOpen(false);
            setIsCreatingService(false);
          }}
          className="flex flex-col gap-4"
        >
          <input
            required
            placeholder="Nombre del Procedimiento"
            value={newService.name || ''}
            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
          />
          <select
            required
            value={newService.fk_branch || ''}
            onChange={(e) => setNewService({ ...newService, fk_branch: e.target.value })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
          >
            <option value="">Seleccione Sucursal</option>
            {branches.map((b: any) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
          <select
            required
            value={newService.fk_modality || ''}
            onChange={(e) => setNewService({ ...newService, fk_modality: e.target.value })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
          >
            <option value="">Seleccione Modalidad</option>
            {modalities.map((m: any) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Precio Base Sugerido"
            value={newService.price || ''}
            onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
          />
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Protocolo de Adquisición</label>
            <textarea
              value={newService.protocolDescription || ''}
              onChange={(e) => setNewService({ ...newService, protocolDescription: e.target.value })}
              rows={3}
              placeholder="Ej: CT abdomen con contraste yodado IV, fase arterial a 25s, portal a 70s, equilibrio a 180s. Cortes de 1.25mm..."
              className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors resize-none text-sm"
            />
            <p className="text-[10px] text-gray-500 mt-1">Instrucciones técnicas que el técnico verá antes de realizar el estudio.</p>
          </div>

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
              {isEditingService ? 'ACTUALIZAR' : 'GUARDAR'}
            </button>
          </div>
        </form>
      </RisModal>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <table className="w-full text-left text-sm">
        <thead className="bg-secondary-dark">
          <tr>
            <th className="p-3 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('name')}>Nombre <span className="ml-1 text-[10px]">{getSortIcon('name')}</span></th>
            <th className="p-3 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('fk_modality_name')}>Modalidad <span className="ml-1 text-[10px]">{getSortIcon('fk_modality_name')}</span></th>
            <th className="p-3 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('fk_branch_name')}>Sucursal <span className="ml-1 text-[10px]">{getSortIcon('fk_branch_name')}</span></th>
            <th className="p-3 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('price')}>Precio Base <span className="ml-1 text-[10px]">{getSortIcon('price')}</span></th>
            <th className="p-3 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('protocolDescription')}>Protocolo <span className="ml-1 text-[10px]">{getSortIcon('protocolDescription')}</span></th>
            <th className="p-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary-dark">
          {sortedServices.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-6 text-primary-light">
                No hay servicios que coincidan con la búsqueda.
              </td>
            </tr>
          ) : (
            paginate(sortedServices).map((s: any) => (
              <tr key={s._id} className="hover:bg-primary-dark">
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.fk_modality?.name}</td>
                <td className="p-3">{s.fk_branch?.name}</td>
                <td className="p-3 font-sans tracking-wide text-green-300">
                  ${s.price?.toFixed(2) || '0.00'}
                </td>
                <td className="p-3 text-gray-400 text-xs max-w-[180px] truncate" title={s.protocolDescription || ''}>
                  {s.protocolDescription ? s.protocolDescription.slice(0, 50) + (s.protocolDescription.length > 50 ? '...' : '') : <span className="text-gray-600">—</span>}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => { handleEdit('service', s); setIsModalOpen(true); }}
                    className="text-primary-light hover:text-white mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete('service', s._id)}
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
      <PaginationControls totalItems={filteredServices.length} />
    </div>
  );
}
