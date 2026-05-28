import React, { useState, useEffect, useMemo } from 'react';
import RisModal from './RisModal';
import {
  FileText,
  Eye,
  Copy,
  Edit3,
  Trash2,
  Plus,
  Search,
  LayoutGrid,
  List,
} from 'lucide-react';

export default function TemplatesTab({
  templatesList,
  fuzzySearch,
  paginate,
  isCreating,
  setIsCreating,
  isEditing,
  editingItem,
  handleCreate,
  handleUpdate,
  handleCancelEdit,
  handleEdit,
  handleDelete,
  newItemState,
  setNewItemState,
  PaginationControls,
  modalities = [],
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    if (isEditing && editingItem?.type === 'template') setIsModalOpen(true);
  }, [isEditing, editingItem]);

  const openCreateModal = () => {
    setIsModalOpen(true);
    setIsCreating(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsCreating(false);
    if (isEditing) handleCancelEdit();
  };

  const handleDuplicate = (template: any) => {
    setNewItemState({
      name: `${template.name} (Copia)`,
      modality: template.modality,
      contentHtml: template.contentHtml,
    });
    setIsCreating(true);
    setIsModalOpen(true);
  };

  const isEditingItem = isEditing && editingItem?.type === 'template';

  const filtered = useMemo(() => {
    return (templatesList || []).filter(fuzzySearch);
  }, [templatesList, fuzzySearch]);

  // Group by modality for the grid
  const groupedByModality = useMemo(() => {
    const map: Record<string, any[]> = {};
    filtered.forEach((t: any) => {
      const mod = t.modality || 'SIN MOD';
      if (!map[mod]) map[mod] = [];
      map[mod].push(t);
    });
    return map;
  }, [filtered]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Plantillas de Informe</h2>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex bg-black/40 rounded-lg border border-white/5 text-xs p-1 gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary-light/20 text-primary-light font-bold shadow' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <LayoutGrid className="w-3 h-3" /> Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-primary-light/20 text-primary-light font-bold shadow' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <List className="w-3 h-3" /> Tabla
            </button>
          </div>

          <button
            onClick={openCreateModal}
            className="bg-primary-dark border border-secondary-dark px-4 py-2 rounded-lg text-sm hover:bg-primary-light hover:text-black transition-colors font-medium flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Nueva Plantilla
          </button>
        </div>
      </div>

      {/* ── Create/Edit Modal ──────────────────────────────────────── */}
      <RisModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditingItem ? 'Editar Plantilla' : 'Nueva Plantilla'}
      >
        <form
          onSubmit={(e) => {
            isEditingItem ? handleUpdate(e, 'template') : handleCreate(e, 'template');
            setIsModalOpen(false);
            setIsCreating(false);
          }}
          className="grid grid-cols-1 gap-4"
        >
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Nombre</label>
              <input
                required
                placeholder="Ej. Tórax Normal"
                value={newItemState.name || ''}
                onChange={(e) => setNewItemState({ ...newItemState, name: e.target.value })}
                className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none"
              />
            </div>
            <div className="w-1/3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Modalidad</label>
              {modalities.length > 0 ? (
                <select
                  required
                  value={newItemState.modality || ''}
                  onChange={(e) => setNewItemState({ ...newItemState, modality: e.target.value })}
                  className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none"
                >
                  <option value="">Seleccionar…</option>
                  {modalities.map((m: any) => (
                    <option key={m._id} value={m.dicom_code}>
                      {m.dicom_code} — {m.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  required
                  placeholder="DX, CT, MR…"
                  value={newItemState.modality || ''}
                  onChange={(e) =>
                    setNewItemState({ ...newItemState, modality: e.target.value.toUpperCase() })
                  }
                  className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none"
                />
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Contenido de la Plantilla</label>
            <textarea
              required
              placeholder="Escriba el contenido de la plantilla aquí…"
              rows={12}
              value={newItemState.contentHtml || ''}
              onChange={(e) => setNewItemState({ ...newItemState, contentHtml: e.target.value })}
              className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none resize-y font-sans tracking-wide text-sm"
            />
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
              {isEditingItem ? 'ACTUALIZAR' : 'GUARDAR'}
            </button>
          </div>
        </form>
      </RisModal>

      {/* ── Preview Modal ──────────────────────────────────────────── */}
      <RisModal
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        title={previewTemplate ? `Vista Previa: ${previewTemplate.name}` : ''}
      >
        {previewTemplate && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="bg-primary-light/20 text-primary-light px-2.5 py-1 rounded-full font-bold">
                {previewTemplate.modality}
              </span>
              <span>{previewTemplate.name}</span>
            </div>
            <div
              className="bg-white text-black rounded-lg p-6 max-h-[60vh] overflow-y-auto text-sm leading-relaxed prose prose-sm"
              dangerouslySetInnerHTML={{ __html: previewTemplate.contentHtml || '<p class="text-gray-400">Sin contenido</p>' }}
            />
            <div className="flex gap-3 pt-4 border-t border-secondary-dark">
              <button
                onClick={() => {
                  setPreviewTemplate(null);
                  handleDuplicate(previewTemplate);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-black border border-gray-600 text-gray-300 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
              >
                <Copy className="w-4 h-4" /> DUPLICAR
              </button>
              <button
                onClick={() => {
                  setPreviewTemplate(null);
                  handleEdit('template', previewTemplate);
                  setIsModalOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-light text-black py-3 rounded-lg font-bold hover:bg-white transition-colors"
              >
                <Edit3 className="w-4 h-4" /> EDITAR
              </button>
            </div>
          </div>
        )}
      </RisModal>

      {/* ── Content ─────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="bg-primary-main rounded-lg border border-secondary-dark p-12 text-center">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No hay plantillas que coincidan con la búsqueda.</p>
          <button
            onClick={openCreateModal}
            className="mt-4 text-primary-light hover:text-white text-sm font-bold"
          >
            + Crear primera plantilla
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── Grid View ────────────────────────────────────────────── */
        <div className="space-y-6">
          {Object.entries(groupedByModality).map(([modality, templates]) => (
            <div key={modality}>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-primary-light/20 text-primary-light px-2.5 py-1 rounded-full text-xs font-bold">
                  {modality}
                </span>
                <span className="text-xs text-gray-500">{templates.length} plantilla{templates.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((t: any) => (
                  <div
                    key={t._id}
                    className="bg-black/40 backdrop-blur-md border border-white/5 rounded-xl p-4 hover:border-primary-light/30 hover:scale-[1.01] transition-all duration-200 group cursor-pointer"
                    onClick={() => setPreviewTemplate(t)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary-light" />
                        <h4 className="font-bold text-white text-sm truncate">{t.name}</h4>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setPreviewTemplate(t)}
                          className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          title="Vista previa"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(t)}
                          className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          title="Duplicar"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            handleEdit('template', t);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete('template', t._id)}
                          className="p-1.5 rounded-md hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {/* Preview snippet */}
                    <div className="bg-white/5 rounded-lg p-3 text-xs text-gray-400 line-clamp-4 leading-relaxed h-20 overflow-hidden">
                      {t.contentHtml
                        ? t.contentHtml.replace(/<[^>]*>/g, ' ').substring(0, 200)
                        : 'Sin contenido'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <PaginationControls totalItems={filtered.length} />
        </div>
      ) : (
        /* ── Table View ───────────────────────────────────────────── */
        <div className="bg-primary-main rounded-lg border border-secondary-dark p-6">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary-dark">
              <tr>
                <th className="p-3 rounded-tl-lg w-1/4">Nombre</th>
                <th className="p-3 w-1/6">Modalidad</th>
                <th className="p-3">Vista Previa</th>
                <th className="p-3 text-right w-1/4 rounded-tr-lg">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-dark">
              {paginate(filtered).map((t: any) => (
                <tr key={t._id} className="hover:bg-primary-dark transition-colors">
                  <td className="p-3 font-medium">{t.name}</td>
                  <td className="p-3">
                    <span className="bg-primary-light/20 text-primary-light px-2 py-0.5 rounded-full text-xs font-bold">
                      {t.modality}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400 truncate max-w-[250px] text-xs">
                    {t.contentHtml?.replace(/<[^>]*>/g, ' ').substring(0, 80)}...
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setPreviewTemplate(t)}
                      className="text-primary-light hover:text-white mr-2 text-xs font-bold"
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      Ver
                    </button>
                    <button
                      onClick={() => handleDuplicate(t)}
                      className="text-gray-400 hover:text-white mr-2 text-xs font-bold"
                    >
                      <Copy className="w-4 h-4 inline mr-1" />
                      Duplicar
                    </button>
                    <button
                      onClick={() => {
                        handleEdit('template', t);
                        setIsModalOpen(true);
                      }}
                      className="text-primary-light hover:text-white mr-2 text-xs font-bold"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete('template', t._id)}
                      className="text-red-500 hover:text-red-400 text-xs font-bold"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <PaginationControls totalItems={filtered.length} />
        </div>
      )}
    </div>
  );
}
