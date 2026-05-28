import React, { useState } from 'react';

export default function OrganizationsTab({
  organizations,
  fuzzySearch,
  paginate,
  isCreatingOrganization,
  setIsCreatingOrganization,
  isEditing,
  editingItem,
  handleCreateOrganization,
  handleUpdate,
  handleCancelEdit,
  handleEdit,
  handleDelete,
  newOrganization,
  setNewOrganization,
  PaginationControls
}: any) {
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);
  const isEditingThis = isEditing && editingItem?.type === 'organization';

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedOrganizations = React.useMemo(() => {
    let sortableItems = [...organizations.filter(fuzzySearch)];
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
  }, [organizations, fuzzySearch, sortConfig]);

  const getSortIcon = (key: string) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return <span className="text-gray-500 opacity-50">↕</span>;
  };

  return (
    <div className="bg-primary-main rounded-lg border border-secondary-dark p-6">
      <div className="mb-6 border-b border-secondary-dark pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">Organizaciones</h2>
            <p className="text-sm text-primary-light mt-1 max-w-2xl">
              Módulo para la gestión de entidades legales superiores (Organizaciones) que agrupan diferentes sucursales y centros médicos.
              Aquí se definen los datos fiscales, OIDs raíces y logotipos corporativos.
            </p>
          </div>
          <button
            onClick={() => setIsCreatingOrganization(!isCreatingOrganization)}
            className="bg-primary-dark border border-secondary-dark px-4 py-2 rounded text-sm hover:bg-primary-light hover:text-black transition-colors"
          >
            {isCreatingOrganization ? 'Cancelar' : '+ Nueva Organización'}
          </button>
        </div>
      </div>

      {(isCreatingOrganization || isEditingThis) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-primary-dark border border-secondary-dark rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4 text-primary-light">
              {isEditingThis ? 'Editar Organización' : 'Nueva Organización'}
            </h3>
            <form onSubmit={isEditing ? handleUpdate : handleCreateOrganization} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 ml-1">Nombre Legal</label>
                  <input
                    required
                    placeholder="Ej: Centro Médico San José"
                    value={newOrganization.name || ''}
                    onChange={e => setNewOrganization({ ...newOrganization, name: e.target.value })}
                    className="p-2.5 rounded-lg bg-black border border-secondary-dark focus:border-primary-light outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400 ml-1">Nombre Corto</label>
                    <input
                      required
                      placeholder="CMSJ"
                      value={newOrganization.short_name || ''}
                      onChange={e => setNewOrganization({ ...newOrganization, short_name: e.target.value })}
                      className="p-2.5 rounded-lg bg-black border border-secondary-dark focus:border-primary-light outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400 ml-1">OID</label>
                    <input
                      required
                      placeholder="1.2.3.4"
                      value={newOrganization.oid || ''}
                      onChange={e => setNewOrganization({ ...newOrganization, oid: e.target.value })}
                      className="p-2.5 rounded-lg bg-black border border-secondary-dark focus:border-primary-light outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400 ml-1">País</label>
                    <input
                      required
                      placeholder="BO"
                      value={newOrganization.country_code || ''}
                      onChange={e => setNewOrganization({ ...newOrganization, country_code: e.target.value })}
                      className="p-2.5 rounded-lg bg-black border border-secondary-dark focus:border-primary-light outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400 ml-1">Estructura</label>
                    <input
                      required
                      placeholder="ID"
                      value={newOrganization.structure_id || ''}
                      onChange={e => setNewOrganization({ ...newOrganization, structure_id: e.target.value })}
                      className="p-2.5 rounded-lg bg-black border border-secondary-dark focus:border-primary-light outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400 ml-1">Sufijo</label>
                    <input
                      required
                      placeholder="SRL"
                      value={newOrganization.suffix || ''}
                      onChange={e => setNewOrganization({ ...newOrganization, suffix: e.target.value })}
                      className="p-2.5 rounded-lg bg-black border border-secondary-dark focus:border-primary-light outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-secondary-dark mt-6">
                <button
                  type="button"
                  onClick={() => {
                    if (isEditing) handleCancelEdit();
                    else setIsCreatingOrganization(false);
                  }}
                  className="px-6 py-2.5 rounded-lg font-bold text-sm bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg font-bold text-sm bg-primary-light text-black hover:bg-white transition-colors"
                >
                  {isEditing ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary-dark/50">
            <tr>
              <th className="p-4 rounded-tl-lg font-bold uppercase tracking-wider text-xs text-gray-400 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('name')}>Nombre <span className="ml-1 text-[10px]">{getSortIcon('name')}</span></th>
              <th className="p-4 font-bold uppercase tracking-wider text-xs text-gray-400 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('short_name')}>Nombre Corto <span className="ml-1 text-[10px]">{getSortIcon('short_name')}</span></th>
              <th className="p-4 font-bold uppercase tracking-wider text-xs text-gray-400 cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('oid')}>OID <span className="ml-1 text-[10px]">{getSortIcon('oid')}</span></th>
              <th className="p-4 font-bold uppercase tracking-wider text-xs text-gray-400 text-right rounded-tr-lg">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-dark">
            {sortedOrganizations.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12 text-primary-light italic bg-black/20">No hay organizaciones registradas.</td></tr>
            ) : paginate(sortedOrganizations).map((o: any) => (
              <tr key={o._id} className="hover:bg-primary-dark/50 transition-colors group">
                <td className="p-4 font-semibold text-white">{o.name} {o.suffix && <span className="text-[10px] bg-secondary-dark px-1.5 py-0.5 rounded ml-2 opacity-60 uppercase">{o.suffix}</span>}</td>
                <td className="p-4 text-gray-300">{o.short_name}</td>
                <td className="p-4 font-sans tracking-wide text-xs text-primary-light">{o.oid}</td>
                <td className="p-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => handleEdit('organization', o)}
                    className="text-primary-light hover:text-white mr-4 font-medium transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete('organization', o._id)}
                    className="text-red-500 hover:text-red-400 font-medium transition-colors"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationControls totalItems={sortedOrganizations.length} />
    </div>
  );
}
