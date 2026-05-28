import React, { useState, useEffect } from 'react';
import RisModal from './RisModal';

export default function BranchesTab({
  branches,
  organizations,
  fuzzySearch,
  paginate,
  isCreatingBranch,
  setIsCreatingBranch,
  isEditing,
  editingItem,
  handleCreateBranch,
  handleUpdate,
  handleCancelEdit,
  handleEdit,
  handleDelete,
  newBranch,
  setNewBranch,
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

  const sortedBranches = React.useMemo(() => {
    let sortableItems = [...branches.filter(fuzzySearch)];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'fk_organization_name') {
           aValue = a.fk_organization?.name || '';
           bValue = b.fk_organization?.name || '';
        }
        
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [branches, fuzzySearch, sortConfig]);

  const getSortIcon = (key: string) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return <span className="text-gray-500 opacity-50">↕</span>;
  };
  useEffect(() => {
    if (isEditing && editingItem?.type === 'branch') setIsModalOpen(true);
  }, [isEditing, editingItem]);

  const openCreateModal = () => {
    setIsModalOpen(true);
    setIsCreatingBranch(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsCreatingBranch(false);
    if (isEditing) handleCancelEdit();
  };

  const isEditingBranch = isEditing && editingItem?.type === 'branch';

  return (
    <div className="bg-primary-main rounded-lg border border-secondary-dark p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Sucursales</h2>
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
        title={isEditingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}
        maxWidth="max-w-lg"
      >
        <form
          onSubmit={(e) => {
            isEditingBranch ? handleUpdate(e) : handleCreateBranch(e);
            setIsModalOpen(false);
            setIsCreatingBranch(false);
          }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <input
            required
            placeholder="Nombre de la Sucursal"
            value={newBranch.name || ''}
            onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
          />
          <input
            required
            placeholder="Nombre Corto"
            value={newBranch.short_name || ''}
            onChange={(e) => setNewBranch({ ...newBranch, short_name: e.target.value })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
          />
          <input
            required
            placeholder="OID"
            value={newBranch.oid || ''}
            onChange={(e) => setNewBranch({ ...newBranch, oid: e.target.value })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
          />
          <input
            required
            placeholder="Código del País (BO)"
            value={newBranch.country_code || ''}
            onChange={(e) => setNewBranch({ ...newBranch, country_code: e.target.value })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
          />
          <input
            required
            placeholder="Structure ID"
            value={newBranch.structure_id || ''}
            onChange={(e) => setNewBranch({ ...newBranch, structure_id: e.target.value })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
          />
          <input
            required
            placeholder="Suffix"
            value={newBranch.suffix || ''}
            onChange={(e) => setNewBranch({ ...newBranch, suffix: e.target.value })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
          />

          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
              Organización
            </label>
            <select
              required
              value={newBranch.fk_organization?._id || newBranch.fk_organization || ''}
              onChange={(e) => setNewBranch({ ...newBranch, fk_organization: e.target.value })}
              className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
            >
              <option value="">Seleccione Organización</option>
              {organizations.map((org: any) => (
                <option key={org._id} value={org._id}>
                  {org.name}
                </option>
              ))}
            </select>
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
              {isEditingBranch ? 'ACTUALIZAR' : 'GUARDAR'}
            </button>
          </div>
        </form>
      </RisModal>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div className="overflow-x-auto w-full custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary-dark">
            <tr>
              <th className="p-3 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('name')}>Nombre <span className="ml-1 text-[10px]">{getSortIcon('name')}</span></th>
              <th className="p-3 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('short_name')}>Nombre Corto <span className="ml-1 text-[10px]">{getSortIcon('short_name')}</span></th>
              <th className="p-3 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('oid')}>OID <span className="ml-1 text-[10px]">{getSortIcon('oid')}</span></th>
              <th className="p-3 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('fk_organization_name')}>Organización <span className="ml-1 text-[10px]">{getSortIcon('fk_organization_name')}</span></th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-dark">
            {sortedBranches.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-primary-light">
                  No hay sucursales que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              paginate(sortedBranches).map((b: any) => (
                <tr key={b._id} className="hover:bg-primary-dark">
                  <td className="p-3 font-semibold">{b.name}</td>
                  <td className="p-3">{b.short_name}</td>
                  <td className="p-3 font-sans tracking-wide text-xs">{b.oid}</td>
                  <td className="p-3 text-primary-light">{b.fk_organization?.name || 'N/A'}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => { handleEdit('branch', b); setIsModalOpen(true); }}
                      className="text-primary-light hover:text-white mr-3 font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete('branch', b._id)}
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
      <PaginationControls totalItems={sortedBranches.length} />
    </div>
  );
}
