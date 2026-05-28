import React, { useState, useEffect, useMemo } from 'react';
import RisModal from './RisModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  DollarSign,
  Banknote,
  CreditCard,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  Filter,
  AlertTriangle,
} from 'lucide-react';

const PAYMENT_ICONS: Record<string, React.ReactNode> = {
  CASH: <Banknote className="w-4 h-4" />,
  CARD: <CreditCard className="w-4 h-4" />,
  TRANSFER: <ArrowUpRight className="w-4 h-4" />,
  INSURANCE: <CheckCircle2 className="w-4 h-4" />,
};
const PAYMENT_LABELS: Record<string, string> = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
  INSURANCE: 'Seguro',
  OTHER: 'Otro',
};

const fmtMoney = (n: number) =>
  new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export default function CashRegisterTab({
  registersList,
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
  orders = [],
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');

  useEffect(() => {
    if (isEditing && editingItem?.type === 'cash-register') setIsModalOpen(true);
  }, [isEditing, editingItem]);

  const openCreateModal = () => {
    setIsClosing(false);
    setIsModalOpen(true);
    setIsCreating(true);
    setNewItemState({ openingBalance: 0 });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsCreating(false);
    if (isEditing) handleCancelEdit();
  };

  /* ── Derived data ─────────────────────────────────────────────── */
  const activeShift = useMemo(() => registersList.find((r: any) => r.status === 'OPEN'), [registersList]);

  // Calculate payments received during the active shift
  const shiftPayments = useMemo(() => {
    if (!activeShift) return { total: 0, byMethod: {}, count: 0 };
    const openedAt = new Date(activeShift.openedAt).getTime();
    const paidOrders = orders.filter(
      (o: any) =>
        o.paymentStatus === 'PAID' &&
        o.paidAt &&
        new Date(o.paidAt).getTime() >= openedAt
    );
    const byMethod: Record<string, number> = {};
    let total = 0;
    paidOrders.forEach((o: any) => {
      const method = o.paymentMethod || 'OTHER';
      byMethod[method] = (byMethod[method] || 0) + (o.totalAmount || 0);
      total += o.totalAmount || 0;
    });
    return { total, byMethod, count: paidOrders.length };
  }, [activeShift, orders]);

  const expectedCash = activeShift
    ? (activeShift.openingBalance || 0) + (shiftPayments.byMethod['CASH'] || 0)
    : 0;

  // Filter list
  const filtered = useMemo(() => {
    let list = registersList.filter(fuzzySearch);
    if (statusFilter !== 'ALL') list = list.filter((r: any) => r.status === statusFilter);
    return list;
  }, [registersList, fuzzySearch, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── Active Shift Summary ──────────────────────────────────── */}
      {activeShift && (
        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/10 backdrop-blur-md border border-green-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Unlock className="w-5 h-5 text-green-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-green-400">Turno Activo</h3>
            <span className="ml-auto text-xs text-gray-400">
              Abierta {format(new Date(activeShift.openedAt), "dd MMM yyyy, HH:mm", { locale: es })}
              {activeShift.user && ` · ${activeShift.user}`}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Opening balance */}
            <div className="bg-black/30 rounded-lg p-4 border border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Fondo Apertura</p>
              <p className="text-xl font-bold text-white">${fmtMoney(activeShift.openingBalance || 0)}</p>
            </div>

            {/* Payments received */}
            <div className="bg-black/30 rounded-lg p-4 border border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Pagos Recibidos</p>
              <p className="text-xl font-bold text-green-400">${fmtMoney(shiftPayments.total)}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{shiftPayments.count} transacciones</p>
            </div>

            {/* Expected cash in drawer */}
            <div className="bg-black/30 rounded-lg p-4 border border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Esperado en Caja</p>
              <p className="text-xl font-bold text-cyan-400">${fmtMoney(expectedCash)}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Fondo + Efectivo</p>
            </div>

            {/* Breakdown by method */}
            <div className="bg-black/30 rounded-lg p-4 border border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Desglose</p>
              {Object.entries(shiftPayments.byMethod).length === 0 ? (
                <p className="text-xs text-gray-500">Sin pagos aún</p>
              ) : (
                <div className="space-y-1.5">
                  {Object.entries(shiftPayments.byMethod).map(([method, amount]) => (
                    <div key={method} className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        {PAYMENT_ICONS[method] || <DollarSign className="w-3.5 h-3.5" />}
                        {PAYMENT_LABELS[method] || method}
                      </span>
                      <span className="text-[11px] font-sans tracking-wide font-bold text-white">${fmtMoney(amount as number)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Header + Filters ──────────────────────────────────────── */}
      <div className="bg-primary-main rounded-lg border border-secondary-dark p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold">Cajas y Arqueo Diario</h2>
          <div className="flex items-center gap-3">
            {/* Status filter pills */}
            <div className="flex bg-black/40 rounded-lg border border-white/5 text-xs overflow-hidden">
              {[
                { id: 'ALL' as const, label: 'Todas' },
                { id: 'OPEN' as const, label: 'Abiertas', icon: <Unlock className="w-3 h-3" /> },
                { id: 'CLOSED' as const, label: 'Cerradas', icon: <Lock className="w-3 h-3" /> },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`flex items-center gap-1 px-3 py-2 transition-colors ${statusFilter === f.id ? 'bg-primary-light/20 text-primary-light font-bold' : 'text-gray-400 hover:text-white'}`}
                >
                  {f.icon}
                  {f.label}
                </button>
              ))}
            </div>

            <button
              onClick={openCreateModal}
              className="bg-primary-dark border border-secondary-dark px-4 py-2 rounded-lg text-sm hover:bg-primary-light hover:text-black transition-colors font-medium"
            >
              + Abrir Turno de Caja
            </button>
          </div>
        </div>

        {/* ── Modal ──────────────────────────────────────────────── */}
        <RisModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={isClosing ? 'Cerrar Caja' : 'Apertura de Caja'}
        >
          <form
            onSubmit={(e) => {
              if (isClosing) {
                handleUpdate(e, 'cash-register-close');
              } else {
                handleCreate(e, 'cash-register');
              }
              setIsModalOpen(false);
              setIsCreating(false);
            }}
            className="grid grid-cols-1 gap-4"
          >
            {!isClosing ? (
              <>
                <label className="text-gray-400 text-sm">Fondo de Caja (Monto Inicial)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 font-bold">$</span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newItemState.openingBalance ?? ''}
                    onChange={(e) =>
                      setNewItemState({ ...newItemState, openingBalance: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full pl-8 p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none text-lg font-sans tracking-wide font-bold"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary-dark p-4 rounded-lg">
                    <p className="text-[10px] font-bold uppercase text-gray-500">Fondo Apertura</p>
                    <p className="text-lg font-bold text-white">${fmtMoney(newItemState.openingBalance || 0)}</p>
                  </div>
                  <div className="bg-green-900/20 border border-green-500/20 p-4 rounded-lg">
                    <p className="text-[10px] font-bold uppercase text-gray-500">Total Esperado</p>
                    <p className="text-lg font-bold text-green-400">${fmtMoney(newItemState.expectedCash || expectedCash)}</p>
                  </div>
                </div>

                <label className="text-gray-400 text-sm">Total Real en Caja (Arqueo Físico)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 font-bold">$</span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newItemState.actualCash ?? ''}
                    onChange={(e) =>
                      setNewItemState({ ...newItemState, actualCash: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full pl-8 p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none text-lg font-sans tracking-wide font-bold"
                  />
                </div>

                {/* Difference indicator */}
                {newItemState.actualCash > 0 && (
                  <DifferenceIndicator
                    actual={newItemState.actualCash}
                    expected={newItemState.expectedCash || expectedCash}
                  />
                )}

                <textarea
                  placeholder="Notas u Observaciones (ej. Faltante o Sobrante)..."
                  rows={3}
                  value={newItemState.notes || ''}
                  onChange={(e) => setNewItemState({ ...newItemState, notes: e.target.value })}
                  className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none resize-y"
                />
              </>
            )}

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
                {isClosing ? 'CERRAR CAJA' : 'ABRIR CAJA'}
              </button>
            </div>
          </form>
        </RisModal>

        {/* ── Table ──────────────────────────────────────────────── */}
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary-dark">
            <tr>
              <th className="p-3 rounded-tl-lg">Apertura</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Usuario</th>
              <th className="p-3 text-center">Fondo</th>
              <th className="p-3 text-center">Real / Esperado</th>
              <th className="p-3 text-center">Diferencia</th>
              <th className="p-3 text-right rounded-tr-lg">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-dark">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-primary-light">
                  No hay cajas que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              paginate(filtered).map((item: any) => {
                const diff = item.status === 'CLOSED' ? (item.actualCash || 0) - (item.expectedCash || 0) : null;
                return (
                  <tr key={item._id} className="hover:bg-primary-dark transition-colors">
                    <td className="p-3">
                      <div>
                        {item.openedAt ? format(new Date(item.openedAt), "dd MMM yyyy, HH:mm", { locale: es }) : '-'}
                      </div>
                      {item.closedAt && (
                        <div className="text-[10px] text-gray-500">
                          Cerrada: {format(new Date(item.closedAt), "dd MMM, HH:mm", { locale: es })}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${item.status === 'OPEN' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}
                      >
                        {item.status === 'OPEN' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {item.status === 'OPEN' ? 'ABIERTA' : 'CERRADA'}
                      </span>
                    </td>
                    <td className="p-3">{item.user || '-'}</td>
                    <td className="p-3 text-center font-sans tracking-wide">${fmtMoney(item.openingBalance || 0)}</td>
                    <td className="p-3 text-center font-sans tracking-wide">
                      {item.status === 'CLOSED'
                        ? `$${fmtMoney(item.actualCash || 0)} / $${fmtMoney(item.expectedCash || 0)}`
                        : '-'}
                    </td>
                    <td className="p-3 text-center">
                      {diff !== null ? (
                        <span
                          className={`font-sans tracking-wide font-bold text-xs ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-gray-400'}`}
                        >
                          {diff > 0 ? '+' : ''}${fmtMoney(diff)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {item.status === 'OPEN' && (
                        <button
                          onClick={() => {
                            handleEdit('cash-register', item);
                            setIsClosing(true);
                            setNewItemState({
                              ...item,
                              expectedCash: expectedCash || item.openingBalance,
                            });
                            setIsModalOpen(true);
                          }}
                          className="text-primary-light hover:text-white text-xs font-bold uppercase"
                        >
                          Ejecutar Cierre
                        </button>
                      )}
                      {item.status === 'CLOSED' && item.notes && (
                        <span className="text-gray-300 text-xs" title={item.notes}>
                          Sin Acciones
                        </span>
                      )}
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

/* ── Sub-component: Difference indicator ──────────────────────────────── */

function DifferenceIndicator({ actual, expected }: { actual: number; expected: number }) {
  const diff = actual - expected;
  if (Math.abs(diff) < 0.01) {
    return (
      <div className="flex items-center gap-2 bg-green-900/20 border border-green-500/20 rounded-lg p-3">
        <CheckCircle2 className="w-5 h-5 text-green-400" />
        <span className="text-sm text-green-400 font-bold">Cuadre perfecto</span>
      </div>
    );
  }
  const isOver = diff > 0;
  return (
    <div
      className={`flex items-center gap-2 rounded-lg p-3 ${isOver ? 'bg-primary-dark/20 border border-blue-500/20' : 'bg-red-900/20 border border-red-500/20'}`}
    >
      {isOver ? (
        <DollarSign className="w-5 h-5 text-primary-main" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-red-400" />
      )}
      <div>
        <span className={`text-sm font-bold ${isOver ? 'text-primary-main' : 'text-red-400'}`}>
          {isOver ? 'Sobrante' : 'Faltante'}: ${fmtMoney(Math.abs(diff))}
        </span>
      </div>
    </div>
  );
}
