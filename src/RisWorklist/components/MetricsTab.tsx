import React, { useMemo } from 'react';
import {
  Users,
  CalendarCheck,
  DollarSign,
  FileCheck,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Banknote,
  ArrowUpRight,
  Package,
} from 'lucide-react';

/* ── Helpers ──────────────────────────────────────────────────────────── */

const fmt = (n: number) =>
  new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  SCHEDULED:   { label: 'Agendado',   color: 'text-gray-300',   bg: 'bg-gray-600' },
  ARRIVED:     { label: 'Llegó',      color: 'text-primary-light',   bg: 'bg-blue-600' },
  IN_PROGRESS: { label: 'En Equipo',  color: 'text-yellow-300', bg: 'bg-yellow-600' },
  COMPLETED:   { label: 'Completado', color: 'text-green-300',  bg: 'bg-green-600' },
  CANCELED:    { label: 'Cancelado',  color: 'text-red-300',    bg: 'bg-red-600' },
};

const PAYMENT_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  CASH:      { label: 'Efectivo',            icon: <Banknote className="w-4 h-4" /> },
  CARD:      { label: 'Tarjeta',             icon: <CreditCard className="w-4 h-4" /> },
  TRANSFER:  { label: 'Transferencia',       icon: <ArrowUpRight className="w-4 h-4" /> },
  INSURANCE: { label: 'Seguro',              icon: <FileCheck className="w-4 h-4" /> },
  OTHER:     { label: 'Otro',                icon: <DollarSign className="w-4 h-4" /> },
};

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/* ── Component ────────────────────────────────────────────────────────── */

export default function MetricsTab({
  analytics,
  orders = [],
}: any) {
  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary-light/30 border-t-primary-light rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Cargando métricas…</p>
        </div>
      </div>
    );
  }

  const { summary, charts, alerts } = analytics;

  /* ── Derived client-side stats ─────────────────────────────────────── */
  const signedReports = charts.reportStatuses?.find((s: any) => s._id === 'SIGNED')?.count || 0;
  const signRate = summary.reports > 0 ? Math.round((signedReports / summary.reports) * 100) : 0;

  const { ordersTodayCalculated, revenueTodayCalculated } = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todays = orders.filter((o: any) => o.scheduledDate && o.scheduledDate.startsWith(todayStr));
    const revenue = todays.filter((o: any) => o.paymentStatus === 'PAID').reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
    return { ordersTodayCalculated: todays.length, revenueTodayCalculated: revenue };
  }, [orders]);

  // Fill 7-day array (even if backend has gaps)
  const last7days = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {};
    (charts.ordersByDay || []).forEach((d: any) => {
      map[d._id] = { count: d.count, revenue: d.revenue };
    });
    const result: { date: string; dayLabel: string; count: number; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayLabel = DAY_NAMES[d.getDay()];
      result.push({ date: key, dayLabel, count: map[key]?.count || 0, revenue: map[key]?.revenue || 0 });
    }
    return result;
  }, [charts.ordersByDay]);

  const maxDayCount = Math.max(...last7days.map(d => d.count), 1);

  // Max for modality bar
  const maxModalityCount = Math.max(...(charts.modalities || []).map((m: any) => m.count), 1);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── KPI Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Users className="w-6 h-6" />}
          label="Pacientes"
          value={summary.patients}
          color="from-blue-600/20 to-blue-900/10"
          accent="text-primary-main"
          border="border-blue-500/20"
        />
        <KpiCard
          icon={<CalendarCheck className="w-6 h-6" />}
          label="Citas Hoy"
          value={summary.ordersToday || ordersTodayCalculated || 0}
          sub={`${summary.orders} totales`}
          color="from-cyan-600/20 to-cyan-900/10"
          accent="text-cyan-400"
          border="border-cyan-500/20"
        />
        <KpiCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Ingresos Hoy"
          value={`$${fmt(summary.revenueToday || revenueTodayCalculated || 0)}`}
          sub={`$${fmt(summary.revenue || 0)} total`}
          color="from-green-600/20 to-green-900/10"
          accent="text-green-400"
          border="border-green-500/20"
        />
        <KpiCard
          icon={<FileCheck className="w-6 h-6" />}
          label="Tasa Firmados"
          value={`${signRate}%`}
          sub={`${signedReports} de ${summary.reports}`}
          color="from-purple-600/20 to-purple-900/10"
          accent="text-primary-light"
          border="border-purple-500/20"
        />
      </div>

      {/* ── Charts Row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Trend */}
        <div className="lg:col-span-2 bg-black/40 backdrop-blur-md border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-primary-light" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Tendencia — Últimos 7 días</h3>
          </div>
          <div className="flex items-end gap-2 h-44">
            {last7days.map((d, i) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-500 font-sans tracking-wide">{d.count}</span>
                <div className="w-full relative rounded-t-md overflow-hidden" style={{ height: `${(d.count / maxDayCount) * 100}%`, minHeight: '4px' }}>
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-primary-light/80 to-primary-light/30 rounded-t-md"
                    style={{ animation: `growUp 0.6s ${i * 0.08}s ease-out both` }}
                  />
                </div>
                <span className="text-[11px] text-gray-400 font-medium">{d.dayLabel}</span>
              </div>
            ))}
          </div>
          <style>{`
            @keyframes growUp {
              from { transform: scaleY(0); transform-origin: bottom; }
              to   { transform: scaleY(1); transform-origin: bottom; }
            }
          `}</style>
        </div>

        {/* Revenue by Method */}
        <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <DollarSign className="w-5 h-5 text-green-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Ingresos × Método</h3>
          </div>
          {(charts.revenueByMethod || []).length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Sin pagos registrados</p>
          ) : (
            <div className="space-y-3">
              {charts.revenueByMethod.map((m: any) => {
                const pm = PAYMENT_LABELS[m._id] || { label: m._id, icon: <DollarSign className="w-4 h-4" /> };
                const pct = summary.revenue > 0 ? Math.round((m.total / summary.revenue) * 100) : 0;
                return (
                  <div key={m._id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-2 text-gray-300">
                        {pm.icon} {pm.label}
                      </span>
                      <span className="font-sans tracking-wide font-bold text-white">${fmt(m.total)}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-right text-[10px] text-gray-500 mt-0.5">{m.count} pagos · {pct}%</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modalities */}
        <div className="lg:col-span-1 bg-black/40 backdrop-blur-md border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Estudios × Modalidad</h3>
          <div className="space-y-3">
            {(charts.modalities || []).map((m: any) => {
              const pct = Math.round((m.count / maxModalityCount) * 100);
              return (
                <div key={m._id} className="flex items-center gap-3">
                  <span className="w-10 text-xs font-bold text-primary-light text-right">{m._id}</span>
                  <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-light/70 to-primary-light rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-xs text-gray-400 text-right font-sans tracking-wide">{m.count}</span>
                </div>
              );
            })}
            {(charts.modalities || []).length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">Sin datos</p>
            )}
          </div>
        </div>

        {/* Order Statuses */}
        <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Órdenes × Estado</h3>
          <div className="grid grid-cols-2 gap-3">
            {(charts.orderStatuses || []).map((s: any) => {
              const st = STATUS_LABELS[s._id] || { label: s._id, color: 'text-gray-300', bg: 'bg-gray-600' };
              return (
                <div
                  key={s._id}
                  className="bg-white/5 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${st.bg}`} />
                    <span className={`text-xs font-medium ${st.color}`}>{st.label}</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{s.count}</span>
                </div>
              );
            })}
          </div>
          {(charts.orderStatuses || []).length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">Sin datos</p>
          )}
        </div>

        {/* Report Statuses + Low Stock Alerts */}
        <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-xl p-5 flex flex-col gap-5">
          {/* Report Statuses */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Estado de Informes</h3>
            <div className="grid grid-cols-2 gap-3">
              {(charts.reportStatuses || []).map((s: any) => {
                const isSigned = s._id === 'SIGNED';
                return (
                  <div
                    key={s._id}
                    className={`rounded-lg p-3 border ${isSigned ? 'bg-green-900/20 border-green-500/20' : 'bg-yellow-900/20 border-yellow-500/20'}`}
                  >
                    <span className={`text-xs font-bold uppercase ${isSigned ? 'text-green-400' : 'text-yellow-400'}`}>
                      {isSigned ? '✓ Firmados' : '✎ Borrador'}
                    </span>
                    <p className="text-2xl font-bold text-white mt-1">{s.count}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Low Stock Alerts */}
          {(alerts?.lowStockItems || []).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">Stock Bajo</h3>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {alerts.lowStockItems.map((item: any) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between bg-amber-900/10 border border-amber-500/20 rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-amber-200 font-medium">{item.itemName}</span>
                    </div>
                    <span className={`text-xs font-bold ${item.stockQuantity <= 0 ? 'text-red-400' : 'text-amber-400'}`}>
                      {item.stockQuantity} {item.unit || 'un'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── KPI Card sub-component ──────────────────────────────────────────── */

function KpiCard({
  icon,
  label,
  value,
  sub,
  color,
  accent,
  border,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  accent: string;
  border: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${color} backdrop-blur-md rounded-xl border ${border} p-5 hover:scale-[1.02] transition-transform duration-200`}>
      <div className={`${accent} mb-3`}>{icon}</div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
      <p className="text-3xl font-bold text-white leading-none">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}
