import React, { useState, useEffect, useCallback } from 'react';
import { toast } from '@ohif/ui-next';
import { ClipboardList, History, Banknote, CreditCard, ArrowRightLeft, ShieldPlus, MoreHorizontal, Clock, PieChart, CheckCircle2, Circle, Check, Plus } from 'lucide-react';
import { useInsuranceList } from '../hooks/useInsuranceList';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ServiceLine {
  modality: string;
  modalityName: string;
  serviceId: string;
  serviceName: string;
  amount: number;
  manualAmount: string;
  effectiveAmount: number;
}

const EMPTY_LINE = (): ServiceLine => ({
  modality: '',
  modalityName: '',
  serviceId: '',
  serviceName: '',
  amount: 0,
  manualAmount: '',
  effectiveAmount: 0,
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const toLocalISOString = (d: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const calcAge = (dob: string): number | null => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

// ── Sub-component: one service line row ───────────────────────────────────────
function ServiceLineRow({
  index,
  line,
  modalities,
  services,
  required,
  onChange,
  onRemove,
  canRemove
}: {
  index: number;
  line: ServiceLine;
  modalities: any[];
  services: any[];
  required: boolean;
  onChange: (updated: ServiceLine) => void;
  onRemove?: () => void;
  canRemove?: boolean;
}) {
  // Filter services that match the selected modality (by dicom_code)
  const filteredServices = services.filter((s: any) => {
    if (!line.modality) return true;
    const smod = s.fk_modality?.dicom_code || s.fk_modality;
    return smod === line.modality;
  });

  const handleModalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const mod = modalities.find((m: any) => m.dicom_code === code);
    onChange({ ...line, modality: code, modalityName: mod?.name || '', serviceId: '', serviceName: '', amount: 0, manualAmount: '', effectiveAmount: 0 });
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const svc = services.find((s: any) => s._id === id);
    // Use price field if it exists on the service, otherwise 0
    const price = (svc as any)?.price || 0;
    onChange({ ...line, serviceId: id, serviceName: svc?.name || '', amount: price, manualAmount: '', effectiveAmount: price });
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const num = parseFloat(val);
    onChange({ ...line, manualAmount: val, effectiveAmount: isNaN(num) ? line.amount : num });
  };

  return (
    <div className="grid grid-cols-12 gap-2 items-center py-2 border-b border-white/5 last:border-0 group">
      {/* Row index pill & remove btn */}
      <div className="col-span-1 flex items-center justify-between px-1">
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-blue-500/30 text-primary-light border border-blue-500/50' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
          {index + 1}
        </span>
        {canRemove && onRemove && (
          <button type="button" onClick={onRemove} className="text-gray-500 hover:text-red-400 transition-colors" title="Eliminar servicio">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Especialidad / Modalidad */}
      <div className="col-span-3">
        <select
          required={required}
          value={line.modality}
          onChange={handleModalityChange}
          className="w-full text-sm p-2.5 rounded-lg bg-black/60 border border-white/10 text-white focus:border-primary-light/70 outline-none transition-all hover:border-white/20"
        >
          <option value="">{required ? '* Especialidad' : 'Especialidad'}</option>
          {modalities.map((m: any) => (
            <option key={m._id} value={m.dicom_code}>
              {m.dicom_code} — {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* Servicio filtrado */}
      <div className="col-span-4">
        <select
          required={required}
          value={line.serviceId}
          onChange={handleServiceChange}
          disabled={!line.modality && !required}
          className="w-full text-sm p-2.5 rounded-lg bg-black/60 border border-white/10 text-white focus:border-primary-light/70 outline-none transition-all hover:border-white/20 disabled:opacity-40"
        >
          <option value="">{required ? '* Servicio' : 'Elegir servicio'}</option>
          {filteredServices.map((s: any) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Monto catálogo (read-only) */}
      <div className="col-span-2">
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
          <input
            type="number"
            readOnly
            value={line.amount || ''}
            placeholder="0.00"
            className="w-full text-sm p-2.5 pl-5 rounded-lg bg-black/30 border border-white/5 text-gray-400 outline-none cursor-not-allowed"
          />
        </div>
      </div>

      {/* Monto manual */}
      <div className="col-span-2">
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-primary-main text-xs">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={line.manualAmount}
            onChange={handleManualChange}
            placeholder="Manual"
            className="w-full text-sm p-2.5 pl-5 rounded-lg bg-black/60 border border-white/10 text-white focus:border-primary-light/70 outline-none transition-all hover:border-white/20"
          />
        </div>
      </div>
    </div>
  );
}

// ── Payment Status Badge ───────────────────────────────────────────────────────
const PAYMENT_STATUS_STYLES: Record<string, string> = {
  PENDING:  'bg-yellow-900/50 text-yellow-300 border-yellow-600/40',
  PARTIAL:  'bg-orange-900/50 text-orange-300 border-orange-600/40',
  PAID:     'bg-green-900/50 text-green-300 border-green-600/40',
  WAIVED:   'bg-purple-900/50 text-primary-light border-purple-600/40',
};

import { Patient, Modality, Service, Order, Branch, Company, MedicalUser } from '../types';

interface ConsultaTabProps {
  patients: Patient[];
  modalities: Modality[];
  services: Service[];
  medicalUsers: MedicalUser[];
  branches: Branch[];
  user: any;
  orders: Order[];
  handleCreateOrder: (e: any, extendedOrder: any) => Promise<void>;
  newOrder: any;
  setNewOrder: React.Dispatch<React.SetStateAction<any>>;
  companies?: Company[];
  isModal?: boolean;
  onCancelModal?: () => void;
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ConsultaTab({
  patients,
  modalities,
  services,
  medicalUsers,
  branches,
  user,
  orders,
  handleCreateOrder,
  newOrder,
  setNewOrder,
  companies = [],
  isModal = false,
  onCancelModal
}: ConsultaTabProps) {
  // 1 service line initially
  const [lines, setLines] = useState<ServiceLine[]>([EMPTY_LINE()]);
  const [directAmount, setDirectAmount] = useState('');
  const [hasInsurance, setHasInsurance] = useState(false);
  const [insuranceName, setInsuranceName] = useState('');
  const [requiresInvoice, setRequiresInvoice] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [company, setCompany] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [observations, setObservations] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentStatus, setPaymentStatus] = useState('PENDING');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState<'form' | 'history'>('form');
  const { allInsurers, exists, addCustomInsurer } = useInsuranceList();

  // Auto-calculate age from selected patient DOB
  useEffect(() => {
    const p = patients.find((pt: any) => pt._id === newOrder.patient);
    if (p?.dateOfBirth) {
      const age = calcAge(p.dateOfBirth);
      if (age !== null) setPatientAge(String(age));
    }
    if (p?.phone || p?.patientPhone) {
      setPatientPhone(p.phone || p.patientPhone || '');
    }
  }, [newOrder.patient, patients]);

  // Totals derived from lines
  const lineTotal = lines.reduce((sum, l) => sum + (l.effectiveAmount || 0), 0);
  const grandTotal = directAmount ? parseFloat(directAmount) : lineTotal;

  // Primary modality = first non-empty line
  const primaryModality = lines.find(l => l.modality)?.modality || '';

  const updateLine = useCallback((index: number, updated: ServiceLine) => {
    setLines(prev => prev.map((l, i) => (i === index ? updated : l)));
  }, []);

  const addLine = () => {
    setLines(prev => [...prev, EMPTY_LINE()]);
  };

  const removeLine = (index: number) => {
    setLines(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setLines([EMPTY_LINE()]);
    setDirectAmount('');
    setHasInsurance(false);
    setInsuranceName('');
    setRequiresInvoice(false);
    setInvoiceNumber('');
    setCompany('');
    setPatientPhone('');
    setPatientAge('');
    setObservations('');
    setPaymentMethod('CASH');
    setPaymentStatus('PENDING');
    setPaymentNotes('');
    setNewOrder({ patient: '', accessionNumber: '', modality: '', procedureDescription: '', scheduledDate: '', referringPhysician: '', branch: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryModality) {
      toast.error('Debe seleccionar al menos una Especialidad/Modalidad.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Build extended payload
      const extendedOrder = {
        ...newOrder,
        modality: primaryModality,
        serviceLines: lines.filter(l => l.serviceId || l.modality),
        company,
        hasInsurance,
        insuranceName: hasInsurance ? insuranceName : '',
        requiresInvoice,
        invoiceNumber: requiresInvoice ? invoiceNumber : '',
        directAmount: directAmount ? parseFloat(directAmount) : 0,
        totalAmount: grandTotal,
        paymentStatus,
        paymentMethod,
        paymentNotes,
        patientPhone,
        patientAge: patientAge ? parseInt(patientAge) : undefined,
        observations,
        paidAt: paymentStatus === 'PAID' ? new Date().toISOString() : undefined,
        procedureDescription: lines.filter(l => l.serviceName).map(l => l.serviceName).join(' / ') || newOrder.procedureDescription,
      };

      // Pass the extended order directly to handleCreateOrder so it uses the latest payload
      setNewOrder(extendedOrder);
      await handleCreateOrder(null, extendedOrder);
      resetForm();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (err) {
      // error handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  // Recent consultations: orders with serviceLines
  const recentOrders = orders
    .filter((o: any) => o.serviceLines?.length > 0 || o.company)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          {!isModal && (
            <>
              <h2 className="text-2xl font-bold text-white tracking-tight">Registro de Consulta</h2>
              <p className="text-sm text-gray-400 mt-0.5">Registro de cliente, servicios por modalidad y pago integrado</p>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSection('form')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSection === 'form' ? 'bg-blue-600/30 text-primary-light border border-blue-500/50' : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'}`}
          >
            {activeSection === 'form' ? <ClipboardList className="w-4 h-4 inline-block mr-1 -mt-0.5" /> : <ClipboardList className="w-4 h-4 inline-block mr-1 -mt-0.5" />} Nueva Consulta
          </button>
          <button
            onClick={() => setActiveSection('history')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSection === 'history' ? 'bg-blue-600/30 text-primary-light border border-blue-500/50' : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'}`}
          >
            <div className="flex items-center gap-2"><History className="w-[1.15em] h-[1.15em] inline-block mr-1" /> Historial ({recentOrders.length})</div>
          </button>
        </div>
      </div>

      {/* ── Success Banner ───────────────────────────────────────────────── */}
      {showSuccess && (
        <div className="flex items-center gap-3 bg-green-900/40 border border-green-500/50 rounded-xl p-4 text-green-300 animate-pulse">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-bold">Consulta registrada y agendada exitosamente</span>
        </div>
      )}

      {activeSection === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── CARD 1: Servicios por Modalidad ─────────────────────────── */}
          <div className="bg-plom-main border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <span className="text-primary-main text-sm font-bold">01</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Especialidades y Servicios</h3>
                <p className="text-xs text-gray-500">Campos obligatorios marcados con *</p>
              </div>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-12 gap-2 mb-2 px-1">
              <div className="col-span-1" />
              <div className="col-span-3 text-xs font-bold text-gray-500 uppercase tracking-wider">(*) Especialidad</div>
              <div className="col-span-4 text-xs font-bold text-gray-500 uppercase tracking-wider">(*) Servicio</div>
              <div className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Monto</div>
              <div className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Manual ($)</div>
            </div>

            {/* Service rows */}
            <div className="space-y-1">
              {lines.map((line, i) => (
                <ServiceLineRow
                  key={i}
                  index={i}
                  line={line}
                  modalities={modalities}
                  services={services}
                  required={i === 0}
                  onChange={(updated) => updateLine(i, updated)}
                  onRemove={() => removeLine(i)}
                  canRemove={lines.length > 1}
                />
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={addLine}
                className="text-xs font-bold text-primary-main hover:text-primary-light flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg border border-blue-500/20 transition-colors"
              >
                <svg className="w-[1.15em] h-[1.15em] inline-block -mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Servicio
              </button>
            </div>

            {/* Totals row */}
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Monto Directo ($)</label>
                <div className="relative w-32">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-green-400 text-xs">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={directAmount}
                    onChange={e => setDirectAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-sm p-2.5 pl-5 rounded-lg bg-black/60 border border-white/10 text-white focus:border-green-400/70 outline-none transition-all"
                  />
                </div>
                <span className="text-xs text-gray-500">(anula suma de líneas)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 uppercase tracking-wider">Subtotal líneas:</span>
                <span className="text-gray-300 font-sans tracking-wide">${lineTotal.toFixed(2)}</span>
                <span className="text-xs text-gray-500">|</span>
                <span className="text-xs text-gray-400 uppercase tracking-wider">TOTAL:</span>
                <span className="text-xl font-bold text-white font-sans tracking-wide">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* ── CARD 2: Facturación y Seguro ─────────────────────────────── */}
          <div className="bg-plom-main border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                <span className="text-primary-light text-sm font-bold">02</span>
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Empresa, Seguro y Facturación</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Empresa — combo con empresas registradas */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">(*) Empresa / Empleador</label>
                <div className="relative">
                  <select
                    value={company}
                    onChange={e => {
                      const selected = companies.find((c: any) => c.name === e.target.value);
                      if (selected) {
                        setCompany(selected.name);
                        setHasInsurance(selected.hasInsurance || false);
                        setInsuranceName(selected.insuranceName || '');
                      } else {
                        setCompany(e.target.value);
                        if (e.target.value === '') {
                          setHasInsurance(false);
                          setInsuranceName('');
                        }
                      }
                    }}
                    className="w-full text-sm p-3 rounded-lg bg-black/60 border border-white/10 text-white focus:border-purple-400/70 outline-none transition-all hover:border-white/20"
                  >
                    <option value="">— Seleccionar empresa —</option>
                    <option value="Particular">Particular (sin empresa)</option>
                    {companies
                      .filter((c: any) => c.status !== false)
                      .map((c: any) => (
                        <option key={c._id} value={c.name}>
                          {c.name}{c.hasInsurance ? ` 🛡 ${c.insuranceName}` : ''}
                        </option>
                      ))}
                  </select>
                </div>
                {/* Fallback: input manual si no está en la lista */}
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="O escriba directamente si no está en la lista"
                  className="mt-1.5 w-full text-xs p-2 rounded-lg bg-black/40 border border-white/5 text-gray-300 focus:border-purple-400/50 outline-none transition-all placeholder:text-gray-600 hover:border-white/10"
                />
              </div>

              {/* Seguro */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">(*) Sin / Con Seguro</label>
                <select
                  value={hasInsurance ? 'con' : 'sin'}
                  onChange={e => setHasInsurance(e.target.value === 'con')}
                  className="w-full text-sm p-3 rounded-lg bg-black/60 border border-white/10 text-white focus:border-purple-400/70 outline-none transition-all"
                >
                  <option value="sin">Sin Seguro</option>
                  <option value="con">Con Seguro</option>
                </select>
              </div>

              {/* Nombre seguro */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Aseguradora</label>
                <datalist id="seguros-consulta-list">
                  {allInsurers.map(s => (
                    <option key={s.nombre} value={s.nombre} />
                  ))}
                </datalist>
                <div className="flex gap-2">
                  <input
                    type="text"
                    list="seguros-consulta-list"
                    value={insuranceName}
                    onChange={e => setInsuranceName(e.target.value)}
                    disabled={!hasInsurance}
                    placeholder="CNS, BISA Seguros, COSSMIL…"
                    className="flex-1 text-sm p-3 rounded-lg bg-black/60 border border-white/10 text-white focus:border-purple-400/70 outline-none transition-all disabled:bg-white/5 disabled:text-gray-500 disabled:border-transparent disabled:opacity-100"
                  />
                  {/* Botón + Agregar: aparece si el valor no está en el catálogo */}
                  {hasInsurance && insuranceName.trim() && !exists(insuranceName) && (
                    <button
                      type="button"
                      title="Guardar en el catálogo para uso futuro"
                      onClick={() => addCustomInsurer(insuranceName)}
                      className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-600/30 text-primary-light border border-purple-500/40 hover:bg-purple-600/50 transition-colors whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar
                    </button>
                  )}
                  {hasInsurance && insuranceName.trim() && exists(insuranceName) && (
                    <span className="flex-shrink-0 flex items-center px-2 rounded-lg text-xs font-bold bg-green-900/30 text-green-400 border border-green-500/30">
                      ✓
                    </span>
                  )}
                </div>
              </div>

              {/* Factura toggle */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Factura</label>
                <select
                  value={requiresInvoice ? 'si' : 'no'}
                  onChange={e => setRequiresInvoice(e.target.value === 'si')}
                  className="w-full text-sm p-3 rounded-lg bg-black/60 border border-white/10 text-white focus:border-purple-400/70 outline-none transition-all"
                >
                  <option value="no">No requiere</option>
                  <option value="si">Sí — Con Factura</option>
                </select>
              </div>

              {/* Número de factura */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"># de Factura</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  disabled={!requiresInvoice}
                  placeholder="FAC-0001"
                  className="w-full text-sm p-3 rounded-lg bg-black/60 border border-white/10 text-white focus:border-purple-400/70 outline-none transition-all disabled:opacity-30"
                />
              </div>
            </div>
          </div>

          {/* ── CARD 3: Agendamiento ─────────────────────────────────────── */}
          <div className="bg-plom-main border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                <span className="text-cyan-400 text-sm font-bold">03</span>
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Datos del Paciente y Agendamiento</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Paciente selector */}
              <div className="col-span-2 md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">(*) Paciente</label>
                <select
                  required
                  value={newOrder.patient || ''}
                  onChange={e => setNewOrder({ ...newOrder, patient: e.target.value })}
                  className="w-full text-sm p-3 rounded-lg bg-black/60 border border-white/10 text-white focus:border-primary-light/70 outline-none transition-all hover:border-white/20"
                >
                  <option value="">Seleccione Paciente</option>
                  {patients.map((p: any) => (
                    <option key={p._id} value={p._id}>
                      {p.lastName}, {p.firstName} {p.patientId ? `— ${p.patientId}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Teléfono */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">(*) Teléfono</label>
                <input
                  required
                  type="tel"
                  value={patientPhone}
                  onChange={e => setPatientPhone(e.target.value)}
                  placeholder="0999-000-000"
                  className="w-full text-sm p-3 rounded-lg bg-black/60 border border-white/10 text-white focus:border-primary-light/70 outline-none transition-all hover:border-white/20"
                />
              </div>

              {/* Edad */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Edad</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={patientAge}
                  onChange={e => setPatientAge(e.target.value)}
                  placeholder="Auto-calc"
                  className="w-full text-sm p-3 rounded-lg bg-black/40 border border-white/10 text-white focus:border-primary-light/70 outline-none transition-all hover:border-white/20"
                />
              </div>

              {/* Fecha y hora */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">(*) Fecha y Hora</label>
                <input
                  required
                  type="datetime-local"
                  value={newOrder.scheduledDate ? (newOrder.scheduledDate.length > 16 ? toLocalISOString(new Date(newOrder.scheduledDate)) : newOrder.scheduledDate) : ''}
                  onChange={e => setNewOrder({ ...newOrder, scheduledDate: e.target.value })}
                  className="w-full text-sm p-3 rounded-lg bg-black/60 border border-white/10 text-white font-sans tracking-wide focus:border-primary-light/70 outline-none transition-all"
                />
              </div>

              {/* Médico referente */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Médico Referente</label>
                <select
                  value={newOrder.referringPhysician || ''}
                  onChange={e => setNewOrder({ ...newOrder, referringPhysician: e.target.value })}
                  className="w-full text-sm p-3 rounded-lg bg-black/60 border border-white/10 text-white focus:border-primary-light/70 outline-none transition-all"
                >
                  <option value="">Sin asignar</option>
                  {medicalUsers.map((m: any) => (
                    <option key={m._id} value={m.nombre}>{m.nombre} ({m.role})</option>
                  ))}
                </select>
              </div>

              {/* Sucursal (admin only) */}
              {user?.role === 'admin' && (
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Sucursal</label>
                  <select
                    required
                    value={newOrder.branch || ''}
                    onChange={e => setNewOrder({ ...newOrder, branch: e.target.value })}
                    className="w-full text-sm p-3 rounded-lg bg-black/60 border border-white/10 text-white focus:border-primary-light/70 outline-none transition-all"
                  >
                    <option value="">Seleccionar Sucursal</option>
                    {branches.map((b: any) => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Observaciones */}
              <div className="col-span-2 md:col-span-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Observaciones</label>
                <textarea
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                  rows={2}
                  placeholder="Notas clínicas adicionales, indicaciones, etc."
                  className="w-full text-sm p-3 rounded-lg bg-black/60 border border-white/10 text-white focus:border-primary-light/70 outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* ── CARD 4: Pago ─────────────────────────────────────────────── */}
          <div className="bg-plom-main border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                <span className="text-green-400 text-sm font-bold">04</span>
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pago</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Método de pago */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Método de Pago</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'CASH',     icon: <Banknote className="w-4 h-4 mr-1.5" />, label: 'Efectivo' },
                    { val: 'CARD',     icon: <CreditCard className="w-4 h-4 mr-1.5" />, label: 'Tarjeta' },
                    { val: 'TRANSFER', icon: <ArrowRightLeft className="w-4 h-4 mr-1.5" />, label: 'Transfer.' },
                    { val: 'INSURANCE',icon: <ShieldPlus className="w-4 h-4 mr-1.5" />, label: 'Seguro' },
                    { val: 'OTHER',    icon: <MoreHorizontal className="w-4 h-4 mr-1.5" />, label: 'Otro' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setPaymentMethod(opt.val)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${paymentMethod === opt.val ? 'bg-green-600/30 text-green-300 border-green-500/60' : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/20'}`}
                    >
                      <span className="flex items-center justify-center whitespace-nowrap">{opt.icon} {opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Estado de pago */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Estado de Pago</label>
                <select
                  value={paymentStatus}
                  onChange={e => setPaymentStatus(e.target.value)}
                  className="w-full text-sm p-3 rounded-lg bg-black/60 border border-white/10 text-white focus:border-green-400/70 outline-none transition-all"
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="PARTIAL">Parcial</option>
                  <option value="PAID">Pagado ✓</option>
                  <option value="WAIVED">Exonerado</option>
                </select>
              </div>

              {/* Notas de pago */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Notas de Pago</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  placeholder="Ref. transferencia, etc."
                  className="w-full text-sm p-3 rounded-lg bg-black/60 border border-white/10 text-white focus:border-green-400/70 outline-none transition-all"
                />
              </div>
            </div>

            {/* Payment Summary */}
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${PAYMENT_STATUS_STYLES[paymentStatus] || ''}`}>
                  {paymentStatus === 'PENDING' ? <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Pendiente</span> : paymentStatus === 'PARTIAL' ? <span className="flex items-center gap-1"><PieChart className="w-3.5 h-3.5" /> Parcial</span> : paymentStatus === 'PAID' ? <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Pagado</span> : <span className="flex items-center gap-1"><Circle className="w-3.5 h-3.5" /> Exonerado</span>}
                </span>
                <span className="text-gray-500 text-sm">via</span>
                <span className="text-white font-bold text-sm">
                  {paymentMethod === 'CASH' ? <span className="flex items-center gap-1"><Banknote className="w-[1.15em] h-[1.15em] mr-1" /> Efectivo</span> : paymentMethod === 'CARD' ? <span className="flex items-center gap-1"><CreditCard className="w-[1.15em] h-[1.15em] mr-1" /> Tarjeta</span> : paymentMethod === 'TRANSFER' ? <span className="flex items-center gap-1"><ArrowRightLeft className="w-[1.15em] h-[1.15em] mr-1" /> Transferencia</span> : paymentMethod === 'INSURANCE' ? <span className="flex items-center gap-1"><ShieldPlus className="w-[1.15em] h-[1.15em] mr-1" /> Seguro</span> : <span className="flex items-center gap-1"><MoreHorizontal className="w-[1.15em] h-[1.15em] mr-1" /> Otro</span>}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Total a cobrar:</span>
                <span className="text-3xl font-black text-white font-sans tracking-wide">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* ── Action Buttons ────────────────────────────────────────────── */}
          <div className="flex gap-4 pb-6">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-black/40 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all"
            >
              Limpiar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3.5 rounded-xl font-black text-sm bg-primary-dark hover:bg-secondary-main text-white transition-all shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-wide"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Registrando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Registrar Consulta y Agendar — ${grandTotal.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ── HISTORY VIEW ──────────────────────────────────────────────────── */}
      {activeSection === 'history' && (
        <div className="bg-plom-main border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Consultas Recientes con Pago</h3>
          {recentOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-3 w-16 h-16 mx-auto text-gray-600"><ClipboardList className="w-full h-full" /></div>
              <p>No hay consultas con datos de pago registradas aún.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="pb-3 pr-4 text-xs font-bold text-gray-500 uppercase">Paciente</th>
                    <th className="pb-3 pr-4 text-xs font-bold text-gray-500 uppercase">Servicios</th>
                    <th className="pb-3 pr-4 text-xs font-bold text-gray-500 uppercase">Empresa</th>
                    <th className="pb-3 pr-4 text-xs font-bold text-gray-500 uppercase">Seguro</th>
                    <th className="pb-3 pr-4 text-xs font-bold text-gray-500 uppercase">Total</th>
                    <th className="pb-3 pr-4 text-xs font-bold text-gray-500 uppercase">Estado Pago</th>
                    <th className="pb-3 text-xs font-bold text-gray-500 uppercase">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentOrders.map((o: any) => (
                    <tr key={o._id} className="hover:bg-white/3 transition-colors">
                      <td className="py-3 pr-4 font-medium text-white">
                        {o.patient?.lastName || '—'}, {o.patient?.firstName || ''}
                      </td>
                      <td className="py-3 pr-4 text-gray-400">
                        {o.serviceLines?.map((l: any) => l.serviceName || l.modality).filter(Boolean).join(', ') || o.procedureDescription || '—'}
                      </td>
                      <td className="py-3 pr-4 text-gray-400">{o.company || '—'}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${o.hasInsurance ? 'bg-blue-900/50 text-primary-light' : 'bg-white/5 text-gray-500'}`}>
                          {o.hasInsurance ? <><Check className="w-3.5 h-3.5" /> {o.insuranceName || 'Con Seguro'}</> : 'Sin Seguro'}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-sans tracking-wide font-bold text-white">
                        ${(o.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border ${PAYMENT_STATUS_STYLES[o.paymentStatus] || 'bg-white/5 text-gray-400 border-white/10'}`}>
                          {o.paymentStatus === 'PAID' ? <><Check className="w-3.5 h-3.5" /> Pagado</> : o.paymentStatus === 'PENDING' ? 'Pendiente' : o.paymentStatus === 'PARTIAL' ? 'Parcial' : o.paymentStatus || '—'}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500 text-xs">
                        {new Date(o.scheduledDate).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
