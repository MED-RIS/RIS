import React, { useState, useEffect } from 'react';
import { toast } from '@ohif/ui-next';
import { Radio, UserCheck, BarChart3, Zap, RefreshCw, Clock, CheckCircle2, FileText } from 'lucide-react';
import { fetchRadiologistWorkload } from '../risService';

export default function TeleradiologyTab({ orders, reports, medicalUsers }: any) {
  const [workload, setWorkload] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadWorkload = async () => {
    setIsLoading(true);
    try {
      const data = await fetchRadiologistWorkload();
      setWorkload(data);
    } catch (err) {
      // Fallback: compute from local data if endpoint is unavailable
      const map: Record<string, any> = {};
      medicalUsers.forEach((u: any) => {
        map[u.nombre] = { _id: u._id, nombre: u.nombre, role: u.role, pendingReports: 0, signedToday: 0, totalSigned: 0 };
      });
      reports.forEach((r: any) => {
        const k = r.radiologist || 'Sin asignar';
        if (!map[k]) map[k] = { _id: k, nombre: k, role: 'N/A', pendingReports: 0, signedToday: 0, totalSigned: 0 };
        if (r.status === 'DRAFT') map[k].pendingReports++;
        if (r.status === 'SIGNED') {
          map[k].totalSigned++;
          const d = new Date(r.signedAt || r.updatedAt);
          if (d.toDateString() === new Date().toDateString()) map[k].signedToday++;
        }
      });
      setWorkload(Object.values(map).sort((a: any, b: any) => a.pendingReports - b.pendingReports));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadWorkload(); }, []);

  const totalPending = workload.reduce((s, w) => s + w.pendingReports, 0);
  const totalSignedToday = workload.reduce((s, w) => s + w.signedToday, 0);
  const maxPending = Math.max(...workload.map(w => w.pendingReports), 1);
  const leastBusy = workload.length > 0 ? workload[0] : null;

  // Unassigned DRAFT reports (no radiologist)
  const unassigned = reports.filter((r: any) => r.status === 'DRAFT' && !r.radiologist).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Radio className="w-6 h-6 text-primary-light" />
            Teleradiología — Balanceo de Carga
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">Distribución de estudios entre radiólogos remotos y locales</p>
        </div>
        <button
          onClick={loadWorkload}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg text-sm font-bold bg-primary-light/10 border border-primary-light/20 text-primary-light hover:bg-indigo-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl p-4 border bg-indigo-900/40 border-indigo-600/30 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-light/70">Radiólogos Activos</span>
          <span className="text-3xl font-black text-white">{workload.length}</span>
        </div>
        <div className="rounded-xl p-4 border bg-yellow-900/40 border-yellow-600/30 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-yellow-400/70">Borradores Pendientes</span>
          <span className="text-3xl font-black text-white">{totalPending}</span>
        </div>
        <div className="rounded-xl p-4 border bg-green-900/40 border-green-600/30 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-green-400/70">Firmados Hoy</span>
          <span className="text-3xl font-black text-white">{totalSignedToday}</span>
        </div>
        <div className="rounded-xl p-4 border bg-red-900/40 border-red-600/30 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-red-400/70">Sin Asignar</span>
          <span className="text-3xl font-black text-white">{unassigned}</span>
        </div>
      </div>

      {/* Auto-Assign Suggestion */}
      {leastBusy && unassigned > 0 && (
        <div className="flex items-center gap-3 bg-primary-dark/30 border border-indigo-500/40 rounded-xl p-4 text-primary-light">
          <Zap className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">
            <strong>Sugerencia:</strong> Hay <strong>{unassigned}</strong> estudios sin asignar. El radiólogo con menor carga es <strong>{leastBusy.nombre}</strong> ({leastBusy.pendingReports} pendientes).
          </span>
        </div>
      )}

      {/* Radiology Workload Table */}
      <div className="bg-plom-main border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary-light" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Carga de Trabajo por Radiólogo</h3>
        </div>

        <table className="w-full text-sm text-left">
          <thead className="bg-black/30">
            <tr>
              {['#', 'Radiólogo', 'Rol', 'Pendientes', 'Firmados Hoy', 'Total Firmados', 'Carga'].map(h => (
                <th key={h} className="p-3 text-xs font-bold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {workload.length === 0 ? (
              <tr><td colSpan={7} className="p-12 text-center text-gray-500">
                <UserCheck className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                <p>No hay radiólogos registrados o datos de carga disponibles.</p>
              </td></tr>
            ) : workload.map((w, i) => {
              const loadPct = (w.pendingReports / maxPending) * 100;
              const loadColor = w.pendingReports === 0 ? 'bg-green-400' : w.pendingReports <= 3 ? 'bg-yellow-400' : 'bg-red-400';
              return (
                <tr key={w._id} className="hover:bg-white/[.02] transition-colors">
                  <td className="p-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-green-500/30 text-green-300 border border-green-500/40' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-white">{w.nombre}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-primary-dark/30 text-primary-light text-xs font-sans tracking-wide border border-primary-light/20">{w.role}</span>
                  </td>
                  <td className="p-3">
                    <span className={`font-sans tracking-wide font-bold ${w.pendingReports === 0 ? 'text-green-300' : w.pendingReports <= 3 ? 'text-yellow-300' : 'text-red-300'}`}>
                      {w.pendingReports === 0 ? (
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> 0</span>
                      ) : (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {w.pendingReports}</span>
                      )}
                    </span>
                  </td>
                  <td className="p-3 font-sans tracking-wide text-primary-light">{w.signedToday}</td>
                  <td className="p-3 font-sans tracking-wide text-white">{w.totalSigned}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-white/5 rounded-full h-2">
                        <div className={`${loadColor} h-2 rounded-full transition-all duration-500`} style={{ width: `${loadPct}%` }} />
                      </div>
                      <span className="text-gray-400 text-xs">{Math.round(loadPct)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Recent unassigned studies */}
      {unassigned > 0 && (
        <div className="bg-plom-main border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center gap-3 p-6 border-b border-white/10">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-red-400" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Estudios Sin Radiólogo Asignado ({unassigned})</h3>
          </div>
          <div className="divide-y divide-white/5">
            {reports.filter((r: any) => r.status === 'DRAFT' && !r.radiologist).slice(0, 10).map((r: any) => (
              <div key={r._id} className="flex items-center p-4 gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm">
                    {r.order?.patient?.lastName || 'Sin nombre'}, {r.order?.patient?.firstName || ''}
                  </div>
                  <div className="text-xs text-gray-500">
                    {r.order?.procedureDescription || r.order?.modality || 'N/A'} · {new Date(r.createdAt).toLocaleDateString('es')}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-900/40 text-yellow-300 border border-yellow-600/30">
                  BORRADOR
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
