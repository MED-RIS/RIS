import React, { useState } from 'react';
import { Briefcase, ShieldCheck, ShieldOff, Plus, Pencil, Trash2, X, Building2 } from 'lucide-react';
import { useInsuranceList } from '../hooks/useInsuranceList';

export default function CompaniesTab({
  companies,
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
}: any) {
  const isEditingThis = isEditing && editingItem?.type === 'company';
  const showModal = isCreating || isEditingThis;
  const { allInsurers, custom, exists, addCustomInsurer, removeCustomInsurer } = useInsuranceList();

  const filtered = companies.filter(fuzzySearch);
  const paginated = paginate(filtered);

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary-light" />
            Empresas y Empleadores
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Gestiona empresas/empleadores y sus seguros médicos. Aparecerán como opciones en el Registro de Consulta.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-indigo-600/30 text-primary-light border border-indigo-500/40 hover:bg-indigo-600/50 hover:border-indigo-400/60 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Nueva Empresa
        </button>
      </div>

      {/* ── Stats Bar ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/20 border border-primary-light/20 rounded-xl p-4">
          <div className="text-3xl font-black text-white">{companies.length}</div>
          <div className="text-xs text-primary-light font-bold uppercase tracking-wider mt-1">Total Empresas</div>
        </div>
        <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-500/20 rounded-xl p-4">
          <div className="text-3xl font-black text-white">{companies.filter((c: any) => c.hasInsurance).length}</div>
          <div className="text-xs text-green-300 font-bold uppercase tracking-wider mt-1">Con Seguro</div>
        </div>
        <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/20 border border-gray-500/20 rounded-xl p-4">
          <div className="text-3xl font-black text-white">{companies.filter((c: any) => c.status !== false).length}</div>
          <div className="text-xs text-gray-300 font-bold uppercase tracking-wider mt-1">Activas</div>
        </div>
      </div>

      {/* ── Company Cards Grid ─────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-700" />
          <p className="font-bold text-gray-400 mb-1">No hay empresas registradas</p>
          <p className="text-sm">Crea la primera empresa para que aparezca en el Registro de Consulta.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginated.map((c: any) => (
            <div
              key={c._id}
              className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-5 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-900/20 transition-all duration-200"
            >
              {/* Card header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-primary-light" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm leading-tight">{c.name}</h3>
                    {c.ruc && <p className="text-xs text-gray-500 mt-0.5">RUC: {c.ruc}</p>}
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${c.status !== false ? 'bg-green-900/40 text-green-300 border-green-500/30' : 'bg-gray-900/40 text-gray-500 border-gray-600/30'}`}>
                  {c.status !== false ? 'Activa' : 'Inactiva'}
                </span>
              </div>

              {/* Insurance info */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold mb-4 ${c.hasInsurance ? 'bg-primary-dark/30 border border-blue-500/20 text-primary-light' : 'bg-gray-900/30 border border-gray-700/20 text-gray-500'}`}>
                {c.hasInsurance ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-primary-main flex-shrink-0" />
                    <span>Con Seguro: <span className="text-white">{c.insuranceName || '—'}</span></span>
                    {c.insurancePolicy && <span className="ml-auto text-primary-main/70">#{c.insurancePolicy}</span>}
                  </>
                ) : (
                  <>
                    <ShieldOff className="w-4 h-4 flex-shrink-0" />
                    Sin seguro médico
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit('company', c)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold bg-primary-light/10 text-primary-light border border-primary-light/20 hover:bg-indigo-500/20 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete('company', c._id)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PaginationControls totalItems={filtered.length} />

      {/* ── Create / Edit Modal ─────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-primary-dark border border-primary-light/20 rounded-2xl shadow-2xl shadow-indigo-900/30 w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
            {/* Modal header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary-light" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {isEditingThis ? 'Editar Empresa' : 'Nueva Empresa'}
                </h3>
              </div>
              <button
                onClick={() => {
                  if (isEditing) handleCancelEdit();
                  else setIsCreating(false);
                }}
                className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={isEditing ? handleUpdate : handleCreate}
              className="space-y-4"
            >
              {/* Nombre */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  (*) Nombre de la Empresa
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej: Empresa Nacional S.A."
                  value={newItemState.name || ''}
                  onChange={e => setNewItemState({ ...newItemState, name: e.target.value })}
                  className="w-full text-sm p-3 rounded-lg bg-black/60 border border-white/10 text-white focus:border-indigo-400/70 outline-none transition-all hover:border-white/20"
                />
              </div>

              {/* RUC */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  RUC / NIT / ID Fiscal
                </label>
                <input
                  type="text"
                  placeholder="Ej: 1234567890001"
                  value={newItemState.ruc || ''}
                  onChange={e => setNewItemState({ ...newItemState, ruc: e.target.value })}
                  className="w-full text-sm p-3 rounded-lg bg-black/60 border border-white/10 text-white focus:border-indigo-400/70 outline-none transition-all hover:border-white/20"
                />
              </div>

              {/* Tiene Seguro */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  ¿Tiene Seguro Médico?
                </label>
                <div className="flex gap-3">
                  {[
                    { val: false, label: 'Sin Seguro', icon: <ShieldOff className="w-4 h-4" /> },
                    { val: true,  label: 'Con Seguro', icon: <ShieldCheck className="w-4 h-4" /> },
                  ].map(opt => (
                    <button
                      key={String(opt.val)}
                      type="button"
                      onClick={() => setNewItemState({ ...newItemState, hasInsurance: opt.val })}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold border transition-all ${
                        newItemState.hasInsurance === opt.val
                          ? opt.val
                            ? 'bg-blue-600/30 text-primary-light border-blue-500/50'
                            : 'bg-gray-700/60 text-gray-300 border-gray-500/50'
                          : 'bg-black/40 text-gray-500 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Datos de Seguro (condicional) */}
              {newItemState.hasInsurance && (
                <div className="grid grid-cols-2 gap-3 p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      (*) Nombre Aseguradora
                    </label>
                    <datalist id="seguros-bolivia-list">
                      {allInsurers.map(s => (
                        <option key={s.nombre} value={s.nombre} />
                      ))}
                    </datalist>
                    <div className="flex gap-2">
                      <input
                        required={newItemState.hasInsurance}
                        type="text"
                        list="seguros-bolivia-list"
                        placeholder="Ej: CNS, BISA Seguros, COSSMIL…"
                        value={newItemState.insuranceName || ''}
                        onChange={e => {
                          const match = allInsurers.find(s => s.nombre === e.target.value);
                          setNewItemState({
                            ...newItemState,
                            insuranceName: e.target.value,
                            ...(match && !newItemState.insurancePolicy ? { insurancePolicy: match.poliza } : {}),
                          });
                        }}
                        className="flex-1 text-sm p-2.5 rounded-lg bg-black/60 border border-white/10 text-white focus:border-primary-light/70 outline-none transition-all"
                      />
                      {/* Botón + Agregar — aparece solo cuando el valor no está en el catálogo */}
                      {newItemState.insuranceName?.trim() && !exists(newItemState.insuranceName) && (
                        <button
                          type="button"
                          title="Guardar en el catálogo para uso futuro"
                          onClick={() => addCustomInsurer(newItemState.insuranceName)}
                          className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold bg-blue-600/30 text-primary-light border border-blue-500/40 hover:bg-blue-600/50 transition-colors whitespace-nowrap"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Agregar
                        </button>
                      )}
                      {/* Badge "En catálogo" cuando ya existe */}
                      {newItemState.insuranceName?.trim() && exists(newItemState.insuranceName) && (
                        <span className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold bg-green-900/30 text-green-400 border border-green-500/30">
                          ✓ En lista
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      # Póliza / Tipo
                    </label>
                    <input
                      type="text"
                      placeholder="POL-0000 o tipo de póliza"
                      value={newItemState.insurancePolicy || ''}
                      onChange={e => setNewItemState({ ...newItemState, insurancePolicy: e.target.value })}
                      className="w-full text-sm p-2.5 rounded-lg bg-black/60 border border-white/10 text-white focus:border-primary-light/70 outline-none transition-all"
                    />
                  </div>
                  {/* Lista de aseguradoras personalizadas */}
                  {custom.length > 0 && (
                    <div className="col-span-2 mt-1">
                      <p className="text-xs text-gray-500 mb-1.5 font-bold uppercase tracking-wider">Personalizadas guardadas:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {custom.map(name => (
                          <span key={name} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-indigo-900/40 text-primary-light border border-indigo-500/30">
                            {name}
                            <button
                              type="button"
                              onClick={() => removeCustomInsurer(name)}
                              className="hover:text-red-400 transition-colors ml-0.5"
                              title="Quitar del catálogo"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Estado */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNewItemState({ ...newItemState, status: !(newItemState.status ?? true) })}
                  className={`w-12 h-6 rounded-full border transition-all relative flex-shrink-0 ${
                    (newItemState.status ?? true)
                      ? 'bg-green-500/40 border-green-400/50'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
                    (newItemState.status ?? true)
                      ? 'left-6 bg-green-400'
                      : 'left-0.5 bg-gray-500'
                  }`} />
                </button>
                <span className="text-sm text-gray-300">
                  Empresa <strong>{(newItemState.status ?? true) ? 'Activa' : 'Inactiva'}</strong>
                </span>
              </div>

              {/* Actions */}
              <div className="pt-4 flex gap-3 border-t border-white/10 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isEditing) handleCancelEdit();
                    else setIsCreating(false);
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white/5 text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 hover:bg-indigo-600/60 hover:text-white transition-all"
                >
                  {isEditingThis ? 'Actualizar Empresa' : 'Crear Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
