import React, { useState, useMemo } from 'react';
import { toast } from '@ohif/ui-next';
import { Wrench, AlertTriangle, CheckCircle2, Clock, Plus, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { addMaintenanceRecord } from '../risService';
import RisModal from './RisModal';

// ── Helpers ───────────────────────────────────────────────────────────────────
const daysBetween = (a: Date, b: Date) => Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));

function getMaintenanceStatus(eq: any): { status: string; label: string; color: string; daysLeft: number | null } {
  if (!eq.nextMaintenanceDate) return { status: 'UNKNOWN', label: 'Sin programar', color: 'bg-gray-800/60 text-gray-400 border-gray-600/30', daysLeft: null };
  const daysLeft = daysBetween(new Date(), new Date(eq.nextMaintenanceDate));
  if (daysLeft < 0) return { status: 'OVERDUE', label: `Vencido (${Math.abs(daysLeft)}d)`, color: 'bg-red-900/50 text-red-300 border-red-600/40', daysLeft };
  if (daysLeft <= 14) return { status: 'DUE_SOON', label: `En ${daysLeft}d`, color: 'bg-yellow-900/50 text-yellow-300 border-yellow-600/40', daysLeft };
  return { status: 'OK', label: `En ${daysLeft}d`, color: 'bg-green-900/50 text-green-300 border-green-600/40', daysLeft };
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MaintenanceTab({ equipmentList, loadAll }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ date: '', description: '', technician: '', cost: 0 });

  // Sort: overdue first, then due_soon, then ok, then unknown
  const sortedEquipment = useMemo(() => {
    const priority: Record<string, number> = { OVERDUE: 0, DUE_SOON: 1, UNKNOWN: 2, OK: 3 };
    return [...equipmentList].sort((a, b) => {
      const sa = getMaintenanceStatus(a);
      const sb = getMaintenanceStatus(b);
      return (priority[sa.status] ?? 4) - (priority[sb.status] ?? 4);
    });
  }, [equipmentList]);

  const overdue = sortedEquipment.filter(eq => getMaintenanceStatus(eq).status === 'OVERDUE').length;
  const dueSoon = sortedEquipment.filter(eq => getMaintenanceStatus(eq).status === 'DUE_SOON').length;
  const ok = sortedEquipment.filter(eq => getMaintenanceStatus(eq).status === 'OK').length;

  const openMaintenanceModal = (eq: any) => {
    setSelectedEquipment(eq);
    setForm({ date: new Date().toISOString().slice(0, 10), description: '', technician: '', cost: 0 });
    setIsModalOpen(true);
  };

  const handleSubmitMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMaintenanceRecord(selectedEquipment._id, form);
      toast.success(`Mantenimiento registrado para ${selectedEquipment.name}`);
      setIsModalOpen(false);
      loadAll();
    } catch (err) {
      toast.error('Error: ' + (err as any).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
          <Wrench className="w-6 h-6 text-orange-400" />
          Mantenimiento Preventivo
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">Control de mantenimiento y alertas para equipos médicos</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl p-4 border bg-red-900/40 border-red-600/30 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-red-400/70">Vencidos</span>
          <span className="text-3xl font-black text-white">{overdue}</span>
        </div>
        <div className="rounded-xl p-4 border bg-yellow-900/40 border-yellow-600/30 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-yellow-400/70">Próximos (14d)</span>
          <span className="text-3xl font-black text-white">{dueSoon}</span>
        </div>
        <div className="rounded-xl p-4 border bg-green-900/40 border-green-600/30 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-green-400/70">Al Día</span>
          <span className="text-3xl font-black text-white">{ok}</span>
        </div>
        <div className="rounded-xl p-4 border bg-blue-900/40 border-blue-600/30 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-main/70">Total Equipos</span>
          <span className="text-3xl font-black text-white">{equipmentList.length}</span>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdue > 0 && (
        <div className="flex items-center gap-3 bg-red-900/30 border border-red-500/40 rounded-xl p-4 text-red-300">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="font-bold">⚠ {overdue} equipo(s) con mantenimiento vencido. Se requiere acción inmediata.</span>
        </div>
      )}

      {/* Equipment List */}
      <div className="bg-plom-main border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
            <span className="text-orange-400 text-sm font-bold">01</span>
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Estado de Equipos</h3>
        </div>

        <div className="divide-y divide-white/5">
          {sortedEquipment.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Wrench className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p>No hay equipos registrados.</p>
            </div>
          ) : sortedEquipment.map((eq: any) => {
            const ms = getMaintenanceStatus(eq);
            const isExpanded = expandedId === eq._id;
            return (
              <div key={eq._id} className="hover:bg-white/[.02] transition-colors">
                {/* Main row */}
                <div className="flex items-center p-4 gap-4">
                  {/* Status indicator */}
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${ms.status === 'OVERDUE' ? 'bg-red-500 animate-pulse' : ms.status === 'DUE_SOON' ? 'bg-yellow-500' : ms.status === 'OK' ? 'bg-green-500' : 'bg-gray-500'}`} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white">{eq.name}</div>
                    <div className="text-xs text-gray-500">{eq.manufacturer} · {eq.model} · S/N: {eq.serial_number || '—'}</div>
                  </div>

                  {/* Status badge */}
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${ms.color}`}>
                    {ms.status === 'OVERDUE' && <AlertTriangle className="w-3 h-3 inline mr-1 -mt-0.5" />}
                    {ms.status === 'OK' && <CheckCircle2 className="w-3 h-3 inline mr-1 -mt-0.5" />}
                    {ms.status === 'DUE_SOON' && <Clock className="w-3 h-3 inline mr-1 -mt-0.5" />}
                    {ms.label}
                  </span>

                  {/* Next date */}
                  <div className="text-xs text-gray-400 w-28 text-center hidden md:block">
                    <Calendar className="w-3 h-3 inline mr-1 -mt-0.5" />
                    {eq.nextMaintenanceDate ? new Date(eq.nextMaintenanceDate).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openMaintenanceModal(eq)}
                      className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-all"
                      title="Registrar Mantenimiento"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : eq._id)}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition-all"
                      title="Ver Historial"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded: Maintenance History */}
                {isExpanded && (
                  <div className="px-4 pb-4 ml-7">
                    <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Historial de Mantenimiento</h4>
                      {(!eq.maintenanceHistory || eq.maintenanceHistory.length === 0) ? (
                        <p className="text-sm text-gray-500 text-center py-4">Sin registros de mantenimiento.</p>
                      ) : (
                        <div className="space-y-2">
                          {eq.maintenanceHistory.slice().reverse().map((h: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 text-sm">
                              <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                              <span className="text-gray-400 font-sans tracking-wide text-xs w-24">{new Date(h.date).toLocaleDateString('es')}</span>
                              <span className="text-white flex-1">{h.description || 'Mantenimiento general'}</span>
                              <span className="text-gray-500 text-xs">{h.technician || '—'}</span>
                              {h.cost > 0 && <span className="text-green-300 font-sans tracking-wide text-xs">${h.cost}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Modal: Register Maintenance ────────────────────────────────── */}
      <RisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Registrar Mantenimiento — ${selectedEquipment?.name || ''}`}
      >
        <form onSubmit={handleSubmitMaintenance} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Fecha</label>
            <input
              required
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-orange-400/70 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Descripción del Trabajo</label>
            <textarea
              required
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Ej: Cambio de tubo de rayos X, limpieza de detectores..."
              className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-orange-400/70 outline-none transition-colors resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Técnico</label>
              <input
                type="text"
                value={form.technician}
                onChange={e => setForm({ ...form, technician: e.target.value })}
                placeholder="Nombre del técnico"
                className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-orange-400/70 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Costo ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.cost || ''}
                onChange={e => setForm({ ...form, cost: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-orange-400/70 outline-none transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-secondary-dark mt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-black border border-gray-600 text-gray-300 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors">
              CANCELAR
            </button>
            <button type="submit" className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-400 transition-colors">
              REGISTRAR MANTENIMIENTO
            </button>
          </div>
        </form>
      </RisModal>
    </div>
  );
}
