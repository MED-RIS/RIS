import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from '@ohif/ui-next';
import { QrCode, PenTool, CheckCircle2, Smartphone, Search, X, RotateCcw } from 'lucide-react';
import { totemArrival } from '../risService';

// ── Signature Pad Component ───────────────────────────────────────────────────
function SignaturePad({ onSave, onClear }: { onSave: (dataUrl: string) => void; onClear: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#ffffff';
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onClear();
  };

  const saveSignature = () => {
    if (!canvasRef.current || !hasDrawn) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSave(dataUrl);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative bg-black/60 border-2 border-dashed border-white/20 rounded-xl overflow-hidden" style={{ touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          className="w-full cursor-crosshair"
          style={{ height: '200px' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasDrawn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-500 text-sm flex items-center gap-2">
              <PenTool className="w-4 h-4" /> Firme aquí con el dedo o mouse
            </span>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={clearCanvas} className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2">
          <RotateCcw className="w-4 h-4" /> Limpiar
        </button>
        <button type="button" onClick={saveSignature} disabled={!hasDrawn} className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-green-600/30 border border-green-500/50 text-green-300 hover:bg-green-600/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Confirmar Firma
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function TotemTab({ orders, loadAll }: any) {
  const [searchCode, setSearchCode] = useState('');
  const [matchedOrder, setMatchedOrder] = useState<any>(null);
  const [signatureData, setSignatureData] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successPatient, setSuccessPatient] = useState('');

  // Only show today's scheduled orders
  const todayOrders = orders.filter((o: any) => {
    if (!o.scheduledDate) return false;
    const d = new Date(o.scheduledDate);
    const today = new Date();
    return d.toDateString() === today.toDateString() && (o.status === 'SCHEDULED' || o.status === 'ARRIVED');
  });

  const handleSearch = useCallback(() => {
    if (!searchCode.trim()) return;
    const q = searchCode.toLowerCase();
    const found = todayOrders.find((o: any) => {
      const acc = (o.accessionNumber || '').toLowerCase();
      const pid = (o.patient?.patientId || '').toLowerCase();
      const docId = (o.patient?.documentId || '').toLowerCase();
      const name = `${o.patient?.firstName || ''} ${o.patient?.lastName || ''}`.toLowerCase();
      return acc.includes(q) || pid.includes(q) || docId.includes(q) || name.includes(q);
    });
    if (found) {
      setMatchedOrder(found);
    } else {
      toast.error('No se encontró ninguna cita para hoy con ese código.');
    }
  }, [searchCode, todayOrders]);

  const handleArrival = async () => {
    if (!matchedOrder) return;
    setIsSubmitting(true);
    try {
      await totemArrival(matchedOrder._id, { consentSignature: signatureData });
      setSuccessPatient(`${matchedOrder.patient?.firstName} ${matchedOrder.patient?.lastName}`);
      setShowSuccess(true);
      setMatchedOrder(null);
      setSearchCode('');
      setSignatureData('');
      loadAll();
      setTimeout(() => setShowSuccess(false), 6000);
    } catch (err) {
      toast.error('Error: ' + (err as any).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">Tótem de Auto-Recepción</h2>
        <p className="text-sm text-gray-400 mt-1">Ingrese su código de cita o nombre para registrar su llegada</p>
      </div>

      {/* Success */}
      {showSuccess && (
        <div className="flex flex-col items-center gap-3 bg-green-900/40 border border-green-500/50 rounded-2xl p-8 text-center animate-pulse">
          <CheckCircle2 className="w-12 h-12 text-green-400" />
          <span className="text-xl font-black text-green-300">¡Bienvenido(a), {successPatient}!</span>
          <span className="text-sm text-green-400/70">Su llegada ha sido registrada. Un técnico le atenderá pronto.</span>
        </div>
      )}

      {!showSuccess && !matchedOrder && (
        <>
          {/* Search */}
          <div className="bg-plom-main border border-white/10 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                <QrCode className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Identificación</h3>
            </div>
            <div className="relative">
              <input
                type="text"
                value={searchCode}
                onChange={e => setSearchCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Código de cita, cédula o nombre del paciente..."
                className="w-full text-lg p-5 pl-12 rounded-xl bg-black/60 border border-white/10 text-white focus:border-primary-light/70 outline-none transition-all placeholder:text-gray-500"
                autoFocus
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            </div>
            <button
              onClick={handleSearch}
              disabled={!searchCode.trim()}
              className="w-full mt-4 py-4 rounded-xl font-black text-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <Search className="w-5 h-5" />
              BUSCAR MI CITA
            </button>
          </div>

          {/* Today's Queue */}
          <div className="bg-plom-main border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Citas programadas hoy — {todayOrders.length}</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
              {todayOrders.map((o: any) => (
                <button
                  key={o._id}
                  onClick={() => setMatchedOrder(o)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-900/10 transition-all text-left"
                >
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${o.status === 'ARRIVED' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm">{o.patient?.lastName}, {o.patient?.firstName}</div>
                    <div className="text-xs text-gray-500">{o.procedureDescription || o.modality} · {new Date(o.scheduledDate).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${o.status === 'ARRIVED' ? 'bg-green-900/40 text-green-300 border-green-600/30' : 'bg-yellow-900/40 text-yellow-300 border-yellow-600/30'}`}>
                    {o.status === 'ARRIVED' ? 'Llegó' : 'Pendiente'}
                  </span>
                </button>
              ))}
              {todayOrders.length === 0 && (
                <p className="text-center text-gray-500 py-8">No hay citas programadas para hoy.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Matched Order: Confirm + Sign ──────────────────────────── */}
      {matchedOrder && !showSuccess && (
        <div className="space-y-4">
          {/* Patient Info Card */}
          <div className="bg-plom-main border border-cyan-500/30 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Confirme sus datos</h3>
              <button onClick={() => { setMatchedOrder(null); setSignatureData(''); }} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500 uppercase">Paciente</span>
                <p className="text-white font-bold text-lg">{matchedOrder.patient?.lastName}, {matchedOrder.patient?.firstName}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase">ID / Cédula</span>
                <p className="text-white font-sans tracking-wide">{matchedOrder.patient?.documentId || matchedOrder.patient?.patientId || '—'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase">Procedimiento</span>
                <p className="text-gray-300">{matchedOrder.procedureDescription || matchedOrder.modality}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase">Hora Agendada</span>
                <p className="text-gray-300 font-sans tracking-wide">
                  {new Date(matchedOrder.scheduledDate).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>

          {/* Consent & Signature */}
          <div className="bg-plom-main border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <PenTool className="w-5 h-5 text-primary-light" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Consentimiento Informado</h3>
            </div>
            <div className="bg-black/40 rounded-xl p-4 border border-white/5 mb-4 text-sm text-gray-400 max-h-32 overflow-y-auto custom-scrollbar">
              <p className="mb-2">Declaro que he sido informado(a) sobre el procedimiento médico a realizarse,
              sus beneficios, riesgos potenciales y alternativas disponibles.</p>
              <p className="mb-2">Autorizo la realización del estudio indicado y la administración de
              medio de contraste si fuera necesario.</p>
              <p>Confirmo que la información proporcionada es verídica y actualizada.</p>
            </div>

            <SignaturePad
              onSave={(data) => setSignatureData(data)}
              onClear={() => setSignatureData('')}
            />

            {signatureData && (
              <p className="text-xs text-green-400 mt-2 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Firma capturada correctamente</p>
            )}
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleArrival}
            disabled={isSubmitting}
            className="w-full py-5 rounded-xl font-black text-xl bg-green-600 hover:bg-green-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-green-900/30"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Registrando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6" />
                CONFIRMAR LLEGADA
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
