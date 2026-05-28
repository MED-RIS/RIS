import React, { useState, useEffect, useMemo } from 'react';
import RisModal from './RisModal';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Boxes,
  Search,
} from 'lucide-react';

const fmtMoney = (n: number) =>
  new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const LOW_STOCK_THRESHOLD = 5;

export default function InventoryTab({
  inventoryList,
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'OK'>('ALL');

  useEffect(() => {
    if (isEditing && editingItem?.type === 'inventory') setIsModalOpen(true);
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

  const isEditingItem = isEditing && editingItem?.type === 'inventory';

  /* ── Derived data ─────────────────────────────────────────────── */
  const summary = useMemo(() => {
    const items = inventoryList || [];
    const totalItems = items.length;
    const totalStockValue = items.reduce((acc: number, i: any) => acc + (i.stockQuantity || 0) * (i.costPrice || 0), 0);
    const totalSaleValue = items.reduce((acc: number, i: any) => acc + (i.stockQuantity || 0) * (i.sellingPrice || 0), 0);
    const lowStockCount = items.filter((i: any) => (i.stockQuantity || 0) <= LOW_STOCK_THRESHOLD).length;
    const outOfStockCount = items.filter((i: any) => (i.stockQuantity || 0) <= 0).length;
    return { totalItems, totalStockValue, totalSaleValue, lowStockCount, outOfStockCount };
  }, [inventoryList]);

  const filtered = useMemo(() => {
    let list = (inventoryList || []).filter(fuzzySearch);
    if (stockFilter === 'LOW') list = list.filter((i: any) => (i.stockQuantity || 0) <= LOW_STOCK_THRESHOLD);
    if (stockFilter === 'OK') list = list.filter((i: any) => (i.stockQuantity || 0) > LOW_STOCK_THRESHOLD);
    return list;
  }, [inventoryList, fuzzySearch, stockFilter]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── Summary Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<Boxes className="w-5 h-5" />}
          label="Total Ítems"
          value={summary.totalItems}
          accent="text-primary-main"
          bg="from-blue-600/20 to-blue-900/10"
          border="border-blue-500/20"
        />
        <SummaryCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Valor en Stock"
          value={`$${fmtMoney(summary.totalStockValue)}`}
          sub={`Venta: $${fmtMoney(summary.totalSaleValue)}`}
          accent="text-green-400"
          bg="from-green-600/20 to-green-900/10"
          border="border-green-500/20"
        />
        <SummaryCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Stock Bajo"
          value={summary.lowStockCount}
          sub={`≤ ${LOW_STOCK_THRESHOLD} unidades`}
          accent={summary.lowStockCount > 0 ? 'text-amber-400' : 'text-gray-400'}
          bg={summary.lowStockCount > 0 ? 'from-amber-600/20 to-amber-900/10' : 'from-gray-600/10 to-gray-900/5'}
          border={summary.lowStockCount > 0 ? 'border-amber-500/20' : 'border-gray-500/20'}
        />
        <SummaryCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Margen Promedio"
          value={
            summary.totalItems > 0
              ? `${Math.round(
                  ((inventoryList || []).reduce(
                    (acc: number, i: any) =>
                      acc + ((i.sellingPrice || 0) - (i.costPrice || 0)),
                    0
                  ) /
                    summary.totalItems) *
                    100
                ) / 100}%`
              : '0%'
          }
          accent="text-primary-light"
          bg="from-purple-600/20 to-purple-900/10"
          border="border-purple-500/20"
        />
      </div>

      {/* ── Main Table Section ─────────────────────────────────────── */}
      <div className="bg-primary-main rounded-lg border border-secondary-dark p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold">Inventario de Insumos</h2>
          <div className="flex items-center gap-3">
            {/* Stock filter pills */}
            <div className="flex bg-black/40 rounded-lg border border-white/5 text-xs overflow-hidden">
              {[
                { id: 'ALL' as const, label: 'Todos' },
                { id: 'LOW' as const, label: '⚠ Stock Bajo', count: summary.lowStockCount },
                { id: 'OK' as const, label: '✓ Normal' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStockFilter(f.id)}
                  className={`flex items-center gap-1 px-3 py-2 transition-colors ${stockFilter === f.id ? 'bg-primary-light/20 text-primary-light font-bold' : 'text-gray-400 hover:text-white'}`}
                >
                  {f.label}
                  {f.count !== undefined && f.count > 0 && (
                    <span className="bg-amber-500/30 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">{f.count}</span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={openCreateModal}
              className="bg-primary-dark border border-secondary-dark px-4 py-2 rounded-lg text-sm hover:bg-primary-light hover:text-black transition-colors font-medium"
            >
              + Nuevo Ítem
            </button>
          </div>
        </div>

        {/* ── Modal ──────────────────────────────────────────────── */}
        <RisModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={isEditingItem ? 'Editar Ítem' : 'Nuevo Ítem'}
        >
          <form
            onSubmit={(e) => {
              isEditingItem ? handleUpdate(e, 'inventory') : handleCreate(e, 'inventory');
              setIsModalOpen(false);
              setIsCreating(false);
            }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Nombre del Insumo</label>
              <input
                required
                placeholder="Ej. Gel para Ultrasonido"
                value={newItemState.itemName || ''}
                onChange={(e) => setNewItemState({ ...newItemState, itemName: e.target.value })}
                className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Descripción</label>
              <textarea
                placeholder="Descripción del insumo (opcional)"
                rows={2}
                value={newItemState.description || ''}
                onChange={(e) => setNewItemState({ ...newItemState, description: e.target.value })}
                className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none resize-y"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Unidad</label>
              <input
                placeholder="ml, un, mg"
                value={newItemState.unit || ''}
                onChange={(e) => setNewItemState({ ...newItemState, unit: e.target.value })}
                className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Cantidad en Stock</label>
              <input
                required
                type="number"
                placeholder="0"
                value={newItemState.stockQuantity ?? ''}
                onChange={(e) =>
                  setNewItemState({ ...newItemState, stockQuantity: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Costo ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newItemState.costPrice ?? ''}
                onChange={(e) =>
                  setNewItemState({ ...newItemState, costPrice: parseFloat(e.target.value) || 0 })
                }
                className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Precio Venta ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newItemState.sellingPrice ?? ''}
                onChange={(e) =>
                  setNewItemState({ ...newItemState, sellingPrice: parseFloat(e.target.value) || 0 })
                }
                className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none"
              />
            </div>

            {/* Live margin preview */}
            {(newItemState.costPrice > 0 || newItemState.sellingPrice > 0) && (
              <div className="col-span-2 bg-black/30 rounded-lg p-3 border border-white/5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Margen unitario:</span>
                  <span className={`font-bold font-sans tracking-wide ${(newItemState.sellingPrice || 0) >= (newItemState.costPrice || 0) ? 'text-green-400' : 'text-red-400'}`}>
                    ${fmtMoney((newItemState.sellingPrice || 0) - (newItemState.costPrice || 0))}
                    {newItemState.costPrice > 0 && (
                      <span className="text-gray-500 ml-2">
                        ({Math.round(((newItemState.sellingPrice - newItemState.costPrice) / newItemState.costPrice) * 100)}%)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}

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
                {isEditingItem ? 'ACTUALIZAR' : 'GUARDAR'}
              </button>
            </div>
          </form>
        </RisModal>

        {/* ── Table ──────────────────────────────────────────────── */}
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary-dark">
            <tr>
              <th className="p-3 rounded-tl-lg">Nombre</th>
              <th className="p-3">Descripción</th>
              <th className="p-3 text-center">Unidad</th>
              <th className="p-3 text-center">Stock</th>
              <th className="p-3 text-center">Costo</th>
              <th className="p-3 text-center">Precio</th>
              <th className="p-3 text-center">Margen</th>
              <th className="p-3 text-right rounded-tr-lg">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-dark">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-primary-light">
                  No hay insumos que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              paginate(filtered).map((item: any) => {
                const margin = (item.sellingPrice || 0) - (item.costPrice || 0);
                const marginPct = item.costPrice > 0 ? Math.round((margin / item.costPrice) * 100) : 0;
                const isLow = (item.stockQuantity || 0) <= LOW_STOCK_THRESHOLD;
                const isOut = (item.stockQuantity || 0) <= 0;

                return (
                  <tr key={item._id} className="hover:bg-primary-dark transition-colors">
                    <td className="p-3 font-medium">{item.itemName}</td>
                    <td className="p-3 text-gray-400 text-xs max-w-[200px] truncate">
                      {item.description || '-'}
                    </td>
                    <td className="p-3 text-center">{item.unit || '-'}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`font-bold ${isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-white'}`}>
                          {item.stockQuantity}
                        </span>
                        {isOut && (
                          <span className="bg-red-500/20 text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-red-500/30">
                            AGOTADO
                          </span>
                        )}
                        {!isOut && isLow && (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center font-sans tracking-wide text-gray-400">${fmtMoney(item.costPrice || 0)}</td>
                    <td className="p-3 text-center font-sans tracking-wide">${fmtMoney(item.sellingPrice || 0)}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`font-sans tracking-wide text-xs font-bold ${margin >= 0 ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {margin >= 0 ? '+' : ''}${fmtMoney(margin)}
                        {marginPct !== 0 && (
                          <span className="text-gray-500 ml-1">({marginPct}%)</span>
                        )}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          handleEdit('inventory', item);
                          setIsModalOpen(true);
                        }}
                        className="text-primary-light hover:text-white mr-3 text-xs font-bold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete('inventory', item._id)}
                        className="text-red-500 hover:text-red-400 text-xs font-bold"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <PaginationControls totalItems={filtered.length} />
      </div>
    </div>
  );
}

/* ── Summary Card sub-component ──────────────────────────────────────── */

function SummaryCard({
  icon,
  label,
  value,
  sub,
  accent,
  bg,
  border,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
  bg: string;
  border: string;
}) {
  return (
    <div
      className={`bg-gradient-to-br ${bg} backdrop-blur-md rounded-xl border ${border} p-5 hover:scale-[1.02] transition-transform duration-200`}
    >
      <div className={`${accent} mb-3`}>{icon}</div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white leading-none">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}
