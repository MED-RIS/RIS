import React, { useMemo, useState } from 'react';
import { DicomMetadataStore } from '@ohif/core';
import { api } from '../../Users/user';
import { Download, Printer, FileText, Calendar, CalendarDays, CalendarCheck, BarChart2, UserCog, Check, Clock } from 'lucide-react';

// ── Types / helpers ───────────────────────────────────────────────────────────
type ReportStatus = 'SIGNED' | 'DRAFT';

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const toDate = (v: any) => (v ? new Date(v) : null);

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const isSameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

const isSameYear = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear();

// ── CSV export ────────────────────────────────────────────────────────────────
const exportCSV = (rows: string[][], filename: string) => {
  const content = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

// ── Small bar chart (SVG) ─────────────────────────────────────────────────────
function BarChart({ data, color = '#3b82f6' }: { data: { label: string; value: number }[]; color?: string }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <span className="text-[9px] text-gray-400 font-sans tracking-wide leading-none">{d.value}</span>
          <div
            className="w-full rounded-t-sm transition-all duration-500"
            style={{ height: `${Math.max(4, (d.value / max) * 56)}px`, backgroundColor: color, opacity: 0.8 }}
          />
          <span className="text-[8px] text-gray-500 truncate w-full text-center leading-none">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className={`rounded-xl p-4 border ${color} flex flex-col gap-1`}>
      <span className="text-xs font-bold text-current/70 uppercase tracking-wider opacity-70">{label}</span>
      <span className="text-3xl font-black text-white">{value}</span>
      {sub && <span className="text-xs opacity-60">{sub}</span>}
    </div>
  );
}

// ── AsyncReportRow (kept from original) ───────────────────────────────────────
export const AsyncReportRow = ({ rep, qidoRoot, normalizePatientName, navigate }: any) => {
  const [patientName, setPatientName] = useState(`${rep.order?.patient?.lastName || ''}, ${rep.order?.patient?.firstName || ''}`);
  const [procedureDesc, setProcedureDesc] = useState(rep.order?.procedureDescription || 'N/A');
  const [modality, setModality] = useState(rep.order?.modality || '');

  React.useEffect(() => {
    if (!rep.studyInstanceUid) return;

    // 1. Intentar obtener metadata sincrónicamente del caché de OHIF (como en ShareLinkPanelComponent)
    let foundInStore = false;
    try {
      const studyMeta = DicomMetadataStore.getStudy(rep.studyInstanceUid);
      if (studyMeta && studyMeta.series?.[0]?.instances?.[0]) {
        const instanceMeta = studyMeta.series[0].instances[0];
        
        if (instanceMeta.PatientName?.[0]?.Alphabetic) {
          setPatientName(instanceMeta.PatientName[0].Alphabetic);
        }
        if (instanceMeta.StudyDescription) {
          setProcedureDesc(instanceMeta.StudyDescription);
        }
        if (instanceMeta.Modality) {
          setModality(instanceMeta.Modality);
        }
        foundInStore = true;
      }
    } catch (e) {
      // Ignorar si no está en el store
    }

    // 2. Si no estaba cargado en memoria, buscar asincrónicamente mediante QIDO
    if (!foundInStore && qidoRoot) {
      fetch(`${qidoRoot}/studies?StudyInstanceUID=${rep.studyInstanceUid}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            const dicomStudy = data[0];
            const getVal = (tag: string) => dicomStudy[tag]?.Value?.[0];
            
            const pName = getVal('00100010');
            if (pName?.Alphabetic) setPatientName(pName.Alphabetic);
            else if (typeof pName === 'string') setPatientName(pName);

            const desc = getVal('00081030');
            if (desc) setProcedureDesc(desc);

            const mod = getVal('00080061'); // ModalitiesInStudy
            if (mod) setModality(mod);
          }
        })
        .catch(() => {});
    }
  }, [rep.studyInstanceUid, qidoRoot]);

  const cleanPatientName = (patientName || '').replace(/^[,\s]+|[,\s]+$/g, '') || 'Sin Nombre';

  return (
    <tr className="hover:bg-white/3 transition-colors border-b border-white/5">
      <td className="p-3 font-medium text-white">{cleanPatientName}</td>
      <td className="p-3 text-gray-400 max-w-[200px] truncate">{procedureDesc}</td>
      <td className="p-3 text-center">
        <span className="px-2 py-1 bg-black/50 rounded border border-white/10 text-xs font-sans tracking-wide text-primary-light">{modality}</span>
      </td>
      <td className="p-3">
        <span className={`px-2 py-1 rounded text-xs font-bold border flex items-center justify-center gap-1 w-max ${rep.status === 'SIGNED' ? 'bg-green-900/50 text-green-300 border-green-600/40' : 'bg-yellow-900/50 text-yellow-300 border-yellow-600/40'}`}>
          {rep.status === 'SIGNED' ? <><Check className="w-3 h-3" /> Firmado</> : <><Clock className="w-3 h-3" /> Borrador</>}
        </span>
      </td>
      <td className="p-3 text-gray-400 text-sm">{new Date(rep.createdAt).toLocaleDateString('es')}</td>
      <td className="p-3">
        <div className="flex gap-3">
          <a href={`${api}/api/subida/upload/${normalizePatientName(cleanPatientName)}`} target="_blank" rel="noopener noreferrer" className="text-primary-main hover:text-primary-light text-xs font-bold transition-colors">PDF</a>
          <a href={`${api}/api/documentos/download/${normalizePatientName(cleanPatientName)}.docx`} target="_blank" rel="noopener noreferrer" className="text-primary-light hover:text-primary-light text-xs font-bold transition-colors">DOCX</a>
        </div>
      </td>
      <td className="p-3">
        <button onClick={() => navigate(`/viewer?StudyInstanceUIDs=${rep.studyInstanceUid}`)} className="text-cyan-400 hover:text-primary-light text-xs font-bold transition-colors">Ver →</button>
      </td>
    </tr>
  );
};

// ── Sub-tab: Diario ───────────────────────────────────────────────────────────
function DailyReport({ orders, reports, selectedDate, onDateChange }: any) {
  const dayOrders = orders.filter((o: any) => { const d = toDate(o.scheduledDate); return d && isSameDay(d, selectedDate); });
  const dayReports = reports.filter((r: any) => { const d = toDate(r.createdAt); return d && isSameDay(d, selectedDate); });

  const byMod = dayOrders.reduce((acc: any, o: any) => {
    const k = o.modality || 'N/A';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const paid = dayOrders.filter((o: any) => o.paymentStatus === 'PAID').length;
  const totalRevenue = dayOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

  const csvData = () => {
    const rows: string[][] = [['Paciente', 'Modalidad', 'Procedimiento', 'Estado', 'Pago', 'Total']];
    dayOrders.forEach((o: any) => rows.push([
      `${o.patient?.lastName || ''} ${o.patient?.firstName || ''}`,
      o.modality,
      o.procedureDescription || '',
      o.status === 'COMPLETED' ? 'Terminado' : o.status === 'CANCELED' ? 'Cancelado' : 'Agendado',
      o.paymentStatus === 'PAID' ? 'Pagado' : o.paymentStatus === 'PENDING' ? 'Pendiente' : o.paymentStatus === 'PARTIAL' ? 'Parcial' : o.paymentStatus || '—',
      String(o.totalAmount || '0')
    ]));
    exportCSV(rows, `reporte-diario-${selectedDate.toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="space-y-5">
      {/* Date picker + actions */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</label>
          <input
            type="date"
            value={selectedDate.toISOString().slice(0, 10)}
            onChange={e => onDateChange(new Date(e.target.value + 'T12:00:00'))}
            className="p-2.5 rounded-lg bg-black/60 border border-white/10 text-white text-sm focus:border-primary-light/70 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={csvData} className="px-4 py-2 flex items-center gap-1.5 rounded-lg bg-green-900/30 border border-green-600/40 text-green-300 text-xs font-bold hover:bg-green-900/50 transition-all"><Download className="w-3 h-3" /> Exportar CSV</button>
          <button onClick={() => window.print()} className="px-4 py-2 flex items-center gap-1.5 rounded-lg bg-primary-dark/30 border border-blue-600/40 text-primary-light text-xs font-bold hover:bg-blue-900/50 transition-all"><Printer className="w-3 h-3" /> Imprimir</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Estudios" value={dayOrders.length} color="bg-blue-900/60 border-blue-600/30" />
        <KpiCard label="Informes" value={dayReports.length} color="bg-purple-900/60 border-purple-600/30" />
        <KpiCard label="Cobrado" value={`$${totalRevenue.toFixed(2)}`} color="bg-green-900/60 border-green-600/30" />
        <KpiCard label="Pagados" value={paid} sub={`de ${dayOrders.length} estudios`} color="bg-cyan-900/60 border-cyan-600/30" />
      </div>

      {/* Bar chart by modality */}
      {Object.keys(byMod).length > 0 && (
        <div className="bg-plom-main border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <span className="text-primary-main text-sm font-bold">01</span>
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Distribución por Modalidad</h4>
          </div>
          <BarChart data={Object.entries(byMod).map(([label, value]) => ({ label, value: value as number }))} color="#3b82f6" />
        </div>
      )}

      {/* Orders table */}
      <div className="bg-plom-main border border-white/10 rounded-2xl p-6 shadow-xl overflow-hidden mt-6">
        <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-4">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
            <span className="text-green-400 text-sm font-bold">02</span>
          </div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Estudios del {selectedDate.toLocaleDateString('es', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </h4>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-black/30">
            <tr>
              {['Paciente', 'Modalidad', 'Procedimiento', 'Estado', 'Pago ($)', 'Est. Pago'].map(h => (
                <th key={h} className="p-3 text-xs font-bold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {dayOrders.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Sin estudios para esta fecha.</td></tr>
            ) : dayOrders.map((o: any) => (
              <tr key={o._id} className="hover:bg-white/3 transition-colors">
                <td className="p-3 text-white font-medium">{o.patient?.lastName}, {o.patient?.firstName}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded bg-primary-dark/30 text-primary-light text-xs font-sans tracking-wide border border-primary-light/20">{o.modality}</span></td>
                <td className="p-3 text-gray-400 max-w-[180px] truncate">{o.procedureDescription || '—'}</td>
                <td className="p-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${o.status === 'COMPLETED' ? 'bg-green-900/30 text-green-300 border-green-600/30' : o.status === 'CANCELED' ? 'bg-red-900/30 text-red-300 border-red-600/30' : 'bg-yellow-900/30 text-yellow-300 border-yellow-600/30'}`}>
                    {o.status}
                  </span>
                </td>
                <td className="p-3 font-sans tracking-wide text-white">${(o.totalAmount || 0).toFixed(2)}</td>
                <td className="p-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${o.paymentStatus === 'PAID' ? 'bg-green-900/30 text-green-300 border-green-600/30' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                    {o.paymentStatus === 'PAID' ? 'Pagado' : o.paymentStatus === 'PENDING' ? 'Pendiente' : o.paymentStatus === 'PARTIAL' ? 'Parcial' : o.paymentStatus || '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Sub-tab: Mensual ──────────────────────────────────────────────────────────
function MonthlyReport({ orders, reports }: any) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const monthOrders = orders.filter((o: any) => {
    const d = toDate(o.scheduledDate);
    return d && d.getFullYear() === year && d.getMonth() === month;
  });

  const byMod = monthOrders.reduce((acc: any, o: any) => {
    const k = o.modality || 'N/A';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const byDoctor = monthOrders.reduce((acc: any, o: any) => {
    const k = o.referringPhysician || 'Sin asignar';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const revenue = monthOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
  const paid = monthOrders.filter((o: any) => o.paymentStatus === 'PAID').length;
  const signed = reports.filter((r: any) => {
    const d = toDate(r.createdAt);
    return d && d.getFullYear() === year && d.getMonth() === month && r.status === 'SIGNED';
  }).length;

  const csvData = () => {
    const rows: string[][] = [['Modalidad', 'Cantidad']];
    Object.entries(byMod).forEach(([k, v]) => rows.push([k, String(v)]));
    exportCSV(rows, `reporte-mensual-${year}-${String(month + 1).padStart(2, '0')}.csv`);
  };

  const topDoctors = Object.entries(byDoctor).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex gap-2">
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className="p-2.5 rounded-lg bg-black/60 border border-white/10 text-white text-sm focus:border-primary-light/70 outline-none">
            {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="p-2.5 rounded-lg bg-black/60 border border-white/10 text-white text-sm focus:border-primary-light/70 outline-none">
            {[now.getFullYear() - 2, now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={csvData} className="px-4 py-2 flex items-center gap-1.5 rounded-lg bg-green-900/30 border border-green-600/40 text-green-300 text-xs font-bold hover:bg-green-900/50 transition-all"><Download className="w-3 h-3" /> CSV</button>
          <button onClick={() => window.print()} className="px-4 py-2 flex items-center gap-1.5 rounded-lg bg-primary-dark/30 border border-blue-600/40 text-primary-light text-xs font-bold hover:bg-blue-900/50 transition-all"><Printer className="w-3 h-3" /> Imprimir</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Estudios" value={monthOrders.length} color="bg-blue-900/60 border-blue-600/30" />
        <KpiCard label="Informes Firmados" value={signed} color="bg-purple-900/60 border-purple-600/30" />
        <KpiCard label="Ingresos" value={`$${revenue.toFixed(2)}`} color="bg-green-900/60 border-green-600/30" />
        <KpiCard label="Cobrados" value={paid} sub={`${monthOrders.length > 0 ? Math.round((paid / monthOrders.length) * 100) : 0}% del mes`} color="bg-cyan-900/60 border-cyan-600/30" />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {/* Modalidades */}
        <div className="bg-plom-main border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <span className="text-primary-light text-sm font-bold">01</span>
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Estudios por Modalidad</h4>
          </div>
          {Object.keys(byMod).length > 0 ? (
            <BarChart data={Object.entries(byMod).map(([label, value]) => ({ label, value: value as number }))} color="#8b5cf6" />
          ) : <p className="text-gray-500 text-sm text-center py-4">Sin datos</p>}
        </div>

        {/* Top Médicos */}
        <div className="bg-plom-main border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <span className="text-cyan-400 text-sm font-bold">02</span>
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Top Médicos del Mes</h4>
          </div>
          <div className="space-y-2">
            {topDoctors.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Sin datos</p>
            ) : topDoctors.map(([name, count]: any, i) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-purple-900/50 border border-purple-600/30 flex items-center justify-center text-[10px] font-bold text-primary-light">{i + 1}</span>
                <span className="flex-1 text-sm text-gray-300 truncate">{name}</span>
                <span className="font-sans tracking-wide font-bold text-white text-sm">{count}</span>
                <div className="w-16 bg-white/5 rounded-full h-1.5">
                  <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: `${(count / (topDoctors[0]?.[1] as number || 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-tab: Anual ────────────────────────────────────────────────────────────
function AnnualReport({ orders, reports }: any) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());

  const yearOrders = orders.filter((o: any) => { const d = toDate(o.scheduledDate); return d && d.getFullYear() === year; });
  const prevYearOrders = orders.filter((o: any) => { const d = toDate(o.scheduledDate); return d && d.getFullYear() === year - 1; });

  const monthly = Array.from({ length: 12 }, (_, m) => ({
    label: MONTH_NAMES[m],
    value: yearOrders.filter((o: any) => toDate(o.scheduledDate)?.getMonth() === m).length,
  }));

  const revenue = yearOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
  const prevRevenue = prevYearOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
  const revenueGrowth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue * 100).toFixed(1) : null;
  const orderGrowth = prevYearOrders.length > 0 ? (((yearOrders.length - prevYearOrders.length) / prevYearOrders.length) * 100).toFixed(1) : null;
  const signedCount = reports.filter((r: any) => toDate(r.createdAt)?.getFullYear() === year && r.status === 'SIGNED').length;

  const csvData = () => {
    const rows = [['Mes', 'Estudios', ...Array.from({ length: 12 }, (_, i) => MONTH_NAMES[i])]];
    exportCSV([['Mes', 'Estudios'], ...monthly.map(m => [m.label, String(m.value)])], `reporte-anual-${year}.csv`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 flex-wrap">
        <select value={year} onChange={e => setYear(Number(e.target.value))} className="p-2.5 rounded-lg bg-black/60 border border-white/10 text-white text-sm focus:border-primary-light/70 outline-none">
          {[now.getFullYear() - 3, now.getFullYear() - 2, now.getFullYear() - 1, now.getFullYear()].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <div className="flex gap-2">
          <button onClick={csvData} className="px-4 py-2 flex items-center gap-1.5 rounded-lg bg-green-900/30 border border-green-600/40 text-green-300 text-xs font-bold hover:bg-green-900/50 transition-all"><Download className="w-3 h-3" /> CSV</button>
          <button onClick={() => window.print()} className="px-4 py-2 flex items-center gap-1.5 rounded-lg bg-primary-dark/30 border border-blue-600/40 text-primary-light text-xs font-bold hover:bg-blue-900/50 transition-all"><Printer className="w-3 h-3" /> Imprimir</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Estudios"
          value={yearOrders.length}
          sub={orderGrowth ? `${Number(orderGrowth) >= 0 ? '▲' : '▼'} ${Math.abs(Number(orderGrowth))}% vs ${year - 1}` : undefined}
          color="bg-blue-900/60 border-blue-600/30"
        />
        <KpiCard label="Informes Firmados" value={signedCount} sub={`${yearOrders.length > 0 ? Math.round((signedCount / yearOrders.length) * 100) : 0}% de estudios`} color="bg-purple-900/60 border-purple-600/30" />
        <KpiCard
          label="Ingresos"
          value={`$${revenue.toFixed(0)}`}
          sub={revenueGrowth ? `${Number(revenueGrowth) >= 0 ? '▲' : '▼'} ${Math.abs(Number(revenueGrowth))}% vs ${year - 1}` : undefined}
          color="bg-green-900/60 border-green-600/30"
        />
        <KpiCard label="Prom. Mensual" value={Math.round(yearOrders.length / 12)} sub="estudios/mes" color="bg-cyan-900/60 border-cyan-600/30" />
      </div>

      <div className="bg-plom-main border border-white/10 rounded-2xl p-6 shadow-xl mt-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <span className="text-primary-main text-sm font-bold">01</span>
          </div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Evolución Mensual — {year}</h4>
        </div>
        <BarChart data={monthly} color="#06b6d4" />
      </div>

      {/* Monthly breakdown table */}
      <div className="bg-plom-main border border-white/10 rounded-2xl p-6 shadow-xl overflow-hidden mt-6">
        <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-4">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
            <span className="text-green-400 text-sm font-bold">02</span>
          </div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Desglose por Mes</h4>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-black/30">
            <tr>
              {['Mes', 'Estudios', 'Ingresos', '% del año'].map(h => (
                <th key={h} className="p-3 text-xs font-bold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {monthly.map((m, i) => {
              const mRev = yearOrders.filter((o: any) => toDate(o.scheduledDate)?.getMonth() === i).reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);
              const pct = yearOrders.length > 0 ? ((m.value / yearOrders.length) * 100).toFixed(1) : '0';
              return (
                <tr key={m.label} className="hover:bg-white/3 transition-colors">
                  <td className="p-3 font-medium text-white">{m.label} {year}</td>
                  <td className="p-3 font-sans tracking-wide text-primary-light">{m.value}</td>
                  <td className="p-3 font-sans tracking-wide text-green-300">${mRev.toFixed(2)}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-white/5 rounded-full h-1.5">
                        <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-gray-400 text-xs">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Sub-tab: Por Modalidad ────────────────────────────────────────────────────
function ModalityReport({ orders, modalities }: any) {
  const [selected, setSelected] = useState<string>('');
  const filtered = selected ? orders.filter((o: any) => o.modality === selected) : orders;
  const revenue = filtered.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);
  const paid = filtered.filter((o: any) => o.paymentStatus === 'PAID').length;

  const byStatus = filtered.reduce((acc: any, o: any) => {
    const k = o.status || 'N/A';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelected('')}
          className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${!selected ? 'bg-blue-600/30 text-primary-light border-blue-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'}`}
        >
          Todas ({orders.length})
        </button>
        {modalities.map((m: any) => {
          const cnt = orders.filter((o: any) => o.modality === m.dicom_code).length;
          return (
            <button
              key={m._id}
              onClick={() => setSelected(m.dicom_code)}
              className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${selected === m.dicom_code ? 'bg-blue-600/30 text-primary-light border-blue-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'}`}
            >
              {m.dicom_code} — {m.name} ({cnt})
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Estudios" value={filtered.length} color="bg-blue-900/60 border-blue-600/30" />
        <KpiCard label="Ingresos" value={`$${revenue.toFixed(2)}`} color="bg-green-900/60 border-green-600/30" />
        <KpiCard label="Pagados" value={paid} sub={`${filtered.length > 0 ? Math.round((paid / filtered.length) * 100) : 0}%`} color="bg-cyan-900/60 border-cyan-600/30" />
        <KpiCard label="Por Estado" value={Object.keys(byStatus).length} sub="estados distintos" color="bg-purple-900/60 border-purple-600/30" />
      </div>

      {Object.keys(byStatus).length > 0 && (
        <div className="bg-plom-main border border-white/10 rounded-2xl p-6 shadow-xl mt-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <span className="text-green-400 text-sm font-bold">01</span>
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Estados de Órdenes</h4>
          </div>
          <BarChart data={Object.entries(byStatus).map(([label, value]) => ({ label, value: value as number }))} color="#10b981" />
        </div>
      )}

      <div className="bg-plom-main border border-white/10 rounded-2xl p-6 shadow-xl overflow-hidden mt-6">
        <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <span className="text-primary-main text-sm font-bold">02</span>
          </div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Listado de Estudios ({selected || 'Todas'})</h4>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-black/30">
            <tr>
              {['Paciente', 'Modalidad', 'Procedimiento', 'Estado', 'Pago', 'Fecha'].map(h => (
                <th key={h} className="p-3 text-xs font-bold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.slice(0, 20).map((o: any) => (
              <tr key={o._id} className="hover:bg-white/3 transition-colors">
                <td className="p-3 text-white font-medium">{o.patient?.lastName}, {o.patient?.firstName}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded bg-primary-dark/30 text-primary-light text-xs font-sans tracking-wide border border-primary-light/20">{o.modality}</span></td>
                <td className="p-3 text-gray-400 max-w-[160px] truncate">{o.procedureDescription || '—'}</td>
                <td className="p-3"><span className="text-xs text-gray-300">{o.status}</span></td>
                <td className="p-3 font-sans tracking-wide text-white">${(o.totalAmount || 0).toFixed(2)}</td>
                <td className="p-3 text-gray-500 text-xs">{toDate(o.scheduledDate)?.toLocaleDateString('es') || '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Sin estudios.</td></tr>
            )}
          </tbody>
        </table>
        {filtered.length > 20 && <div className="p-3 text-center text-xs text-gray-500">Mostrando 20 de {filtered.length}. Exporta CSV para ver todos.</div>}
      </div>
    </div>
  );
}

// ── Sub-tab: Por Médico ───────────────────────────────────────────────────────
function DoctorReport({ orders, reports }: any) {
  const doctors = useMemo(() => {
    const map: Record<string, { orders: any[]; reports: any[] }> = {};
    orders.forEach((o: any) => {
      const k = o.referringPhysician || 'Sin asignar';
      if (!map[k]) map[k] = { orders: [], reports: [] };
      map[k].orders.push(o);
    });
    reports.forEach((r: any) => {
      const k = r.radiologist || 'Sin asignar';
      if (!map[k]) map[k] = { orders: [], reports: [] };
      map[k].reports.push(r);
    });
    return Object.entries(map)
      .map(([name, data]) => ({
        name,
        totalOrders: data.orders.length,
        signed: data.reports.filter(r => r.status === 'SIGNED').length,
        drafts: data.reports.filter(r => r.status !== 'SIGNED').length,
        revenue: data.orders.reduce((s, o) => s + (o.totalAmount || 0), 0),
      }))
      .sort((a, b) => b.totalOrders - a.totalOrders);
  }, [orders, reports]);

  const csvData = () => {
    const rows: string[][] = [['Médico', 'Órdenes', 'Firmados', 'Borradores', 'Ingresos']];
    doctors.forEach(d => rows.push([d.name, String(d.totalOrders), String(d.signed), String(d.drafts), d.revenue.toFixed(2)]));
    exportCSV(rows, 'reporte-medicos.csv');
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <button onClick={csvData} className="px-4 py-2 flex items-center gap-1.5 rounded-lg bg-green-900/30 border border-green-600/40 text-green-300 text-xs font-bold hover:bg-green-900/50 transition-all"><Download className="w-3 h-3" /> CSV</button>
        <button onClick={() => window.print()} className="px-4 py-2 flex items-center gap-1.5 rounded-lg bg-primary-dark/30 border border-blue-600/40 text-primary-light text-xs font-bold hover:bg-blue-900/50 transition-all"><Printer className="w-3 h-3" /> Imprimir</button>
      </div>

      <div className="bg-plom-main border border-white/10 rounded-2xl p-6 shadow-xl overflow-hidden mt-6">
        <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-4">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
            <span className="text-orange-400 text-sm font-bold">01</span>
          </div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Métricas por Médico Referente y Radiólogo</h4>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-black/30">
            <tr>
              {['#', 'Médico', 'Órdenes', 'Firmados', 'Borradores', 'Tasa Firma', 'Ingresos'].map(h => (
                <th key={h} className="p-3 text-xs font-bold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {doctors.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">Sin datos.</td></tr>
            ) : doctors.map((d, i) => {
              const signRate = d.totalOrders > 0 ? Math.round((d.signed / d.totalOrders) * 100) : 0;
              return (
                <tr key={d.name} className="hover:bg-white/3 transition-colors">
                  <td className="p-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/40' : i === 1 ? 'bg-gray-500/30 text-gray-300 border border-gray-500/40' : 'bg-orange-900/30 text-orange-300 border border-orange-700/30'}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="p-3 text-white font-medium">{d.name}</td>
                  <td className="p-3 font-sans tracking-wide text-primary-light font-bold">{d.totalOrders}</td>
                  <td className="p-3 font-sans tracking-wide text-green-300">{d.signed}</td>
                  <td className="p-3 font-sans tracking-wide text-yellow-300">{d.drafts}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-white/5 rounded-full h-1.5">
                        <div className="bg-green-400 h-1.5 rounded-full" style={{ width: `${signRate}%` }} />
                      </div>
                      <span className="text-gray-400 text-xs">{signRate}%</span>
                    </div>
                  </td>
                  <td className="p-3 font-sans tracking-wide text-white">${d.revenue.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main ReportsTab ───────────────────────────────────────────────────────────
const REPORT_SUBTABS = [
  { id: 'lista',      label: 'Informes',      icon: <FileText className="w-4 h-4 mr-1.5" /> },
  { id: 'diario',     label: 'Diario',        icon: <Calendar className="w-4 h-4 mr-1.5" /> },
  { id: 'mensual',    label: 'Mensual',       icon: <CalendarDays className="w-4 h-4 mr-1.5" /> },
  { id: 'anual',      label: 'Anual',         icon: <CalendarCheck className="w-4 h-4 mr-1.5" /> },
  { id: 'modalidad',  label: 'Modalidad',     icon: <BarChart2 className="w-4 h-4 mr-1.5" /> },
  { id: 'medico',     label: 'Médico',        icon: <UserCog className="w-4 h-4 mr-1.5" /> },
];

export default function ReportsTab({
  reports,
  orders = [],
  modalities = [],
  fuzzySearch,
  paginate,
  appConfig,
  normalizePatientName,
  navigate,
  PaginationControls,
}: any) {
  const [subTab, setSubTab] = useState('lista');
  const [filterStatus, setFilterStatus] = useState<ReportStatus | ''>('');
  const [filterModality, setFilterModality] = useState('');
  const [dailyDate, setDailyDate] = useState(new Date());

  const allModalities: string[] = useMemo(() => [...new Set<string>(reports.map((r: any) => r.order?.modality).filter((m: any): m is string => Boolean(m)))], [reports]);

  const filteredReports = useMemo(() => {
    return reports
      .filter(fuzzySearch)
      .filter((r: any) => !filterStatus || r.status === filterStatus)
      .filter((r: any) => !filterModality || r.order?.modality === filterModality);
  }, [reports, fuzzySearch, filterStatus, filterModality]);

  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedReports = useMemo(() => {
    let sortableItems = [...filteredReports];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'patientName') {
           aValue = `${a.order?.patient?.lastName || ''} ${a.order?.patient?.firstName || ''}`.trim().toLowerCase();
           bValue = `${b.order?.patient?.lastName || ''} ${b.order?.patient?.firstName || ''}`.trim().toLowerCase();
        } else if (sortConfig.key === 'procedureDescription') {
           aValue = (a.order?.procedureDescription || '').toLowerCase();
           bValue = (b.order?.procedureDescription || '').toLowerCase();
        } else if (sortConfig.key === 'modality') {
           aValue = (a.order?.modality || '').toLowerCase();
           bValue = (b.order?.modality || '').toLowerCase();
        } else if (typeof aValue === 'string') {
           aValue = aValue.toLowerCase();
        }
        if (typeof bValue === 'string') {
           bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredReports, sortConfig]);

  const getSortIcon = (key: string) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return <span className="text-gray-500 opacity-50">↕</span>;
  };

  const qidoRoot = appConfig?.dataSources?.[0]?.configuration?.qidoRoot || '/dicom-web';

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Centro de Informes</h2>
        <p className="text-sm text-gray-400 mt-0.5">Reportes diarios, mensuales, anuales y analítica radiológica</p>
      </div>

      {/* ── Sub-tabs ── */}
      <div className="flex gap-1 flex-wrap border-b border-white/10 pb-1">
        {REPORT_SUBTABS.map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`px-4 py-2 flex items-center justify-center rounded-t-lg text-xs font-bold transition-all whitespace-nowrap border-b-2 ${subTab === t.id ? 'text-primary-light border-primary-light bg-primary-dark/20' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Lista ── */}
      {subTab === 'lista' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="p-2.5 rounded-lg bg-black/60 border border-white/10 text-white text-sm focus:border-primary-light/70 outline-none">
              <option value="">Todos los estados</option>
              <option value="SIGNED">Firmados</option>
              <option value="DRAFT">Borradores</option>
            </select>
            <select value={filterModality} onChange={e => setFilterModality(e.target.value)} className="p-2.5 rounded-lg bg-black/60 border border-white/10 text-white text-sm focus:border-primary-light/70 outline-none">
              <option value="">Todas las modalidades</option>
              {allModalities.map((m: string) => <option key={m} value={m}>{m}</option>)}
            </select>
            <button
              onClick={() => {
                const rows: string[][] = [['Paciente', 'Estudio', 'Modalidad', 'Estado', 'Fecha']];
                filteredReports.forEach((r: any) => rows.push([
                  `${r.order?.patient?.lastName || ''} ${r.order?.patient?.firstName || ''}`,
                  r.order?.procedureDescription || '',
                  r.order?.modality || '',
                  r.status === 'SIGNED' ? 'Firmado' : 'Borrador',
                  new Date(r.createdAt).toLocaleDateString('es-419')
                ]));
                exportCSV(rows, 'informes.csv');
              }}
              className="px-4 py-2 flex items-center gap-1.5 rounded-lg bg-green-900/30 border border-green-600/40 text-green-300 text-xs font-bold hover:bg-green-900/50 transition-all"
            >
              <Download className="w-3 h-3" /> CSV
            </button>
          </div>

          <div className="bg-plom-main border border-white/10 rounded-2xl p-6 shadow-xl overflow-hidden mt-6">
            <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <span className="text-primary-main text-sm font-bold">01</span>
              </div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Listado General de Informes Clínícos</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-black/40">
                  <tr>
                    <th className="p-3 text-xs font-bold text-gray-500 uppercase cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('patientName')}>Paciente <span className="ml-1 text-[10px]">{getSortIcon('patientName')}</span></th>
                    <th className="p-3 text-xs font-bold text-gray-500 uppercase cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('procedureDescription')}>Estudio <span className="ml-1 text-[10px]">{getSortIcon('procedureDescription')}</span></th>
                    <th className="p-3 text-xs font-bold text-gray-500 uppercase cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('modality')}>Modalidad <span className="ml-1 text-[10px]">{getSortIcon('modality')}</span></th>
                    <th className="p-3 text-xs font-bold text-gray-500 uppercase cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('status')}>Estado <span className="ml-1 text-[10px]">{getSortIcon('status')}</span></th>
                    <th className="p-3 text-xs font-bold text-gray-500 uppercase cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('createdAt')}>Fecha <span className="ml-1 text-[10px]">{getSortIcon('createdAt')}</span></th>
                    <th className="p-3 text-xs font-bold text-gray-500 uppercase">Documento</th>
                    <th className="p-3 text-xs font-bold text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedReports.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-gray-500">No hay informes que coincidan.</td></tr>
                  ) : paginate(sortedReports).map((rep: any) => (
                    <AsyncReportRow
                      key={rep._id}
                      rep={rep}
                      qidoRoot={qidoRoot}
                      normalizePatientName={normalizePatientName}
                      navigate={navigate}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-white/10">
              <PaginationControls totalItems={sortedReports.length} />
            </div>
          </div>
        </div>
      )}

      {subTab === 'diario' && <DailyReport orders={orders} reports={reports} selectedDate={dailyDate} onDateChange={setDailyDate} />}
      {subTab === 'mensual' && <MonthlyReport orders={orders} reports={reports} />}
      {subTab === 'anual' && <AnnualReport orders={orders} reports={reports} />}
      {subTab === 'modalidad' && <ModalityReport orders={orders} modalities={modalities} />}
      {subTab === 'medico' && <DoctorReport orders={orders} reports={reports} />}
    </div>
  );
}
