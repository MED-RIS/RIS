import React, { useState, useMemo } from 'react';
import { Video, X, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import RisModal from './RisModal';

/**
 * TelemedModal — Telemedicine video consultation modal.
 * Uses Jitsi Meet (free, open-source) as the video bridge in an iframe.
 * Generates a unique room name based on the patient and study details.
 */
export default function TelemedModal({
  isOpen,
  onClose,
  patientName,
  studyId,
}: {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  studyId?: string;
}) {
  const [started, setStarted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate a unique, deterministic room name
  const roomName = useMemo(() => {
    const base = (patientName || 'consulta').replace(/[^a-zA-Z0-9]/g, '').slice(0, 15);
    const id = (studyId || Date.now().toString()).replace(/[^a-zA-Z0-9]/g, '').slice(-8);
    return `ris-telemed-${base}-${id}`;
  }, [patientName, studyId]);

  const jitsiUrl = `https://meet.jit.si/${roomName}`;

  const copyLink = () => {
    navigator.clipboard.writeText(jitsiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <RisModal
      isOpen={isOpen}
      onClose={() => { setStarted(false); onClose(); }}
      title="Consulta Virtual — Telemedicina"
    >
      <div className="space-y-5">
        {!started ? (
          <>
            {/* Pre-call Info */}
            <div className="bg-black/40 rounded-xl p-5 border border-white/5 space-y-3">
              <div className="flex items-center gap-3">
                <Video className="w-6 h-6 text-green-400" />
                <h3 className="text-white font-bold">Iniciar Videollamada</h3>
              </div>
              <p className="text-sm text-gray-400">
                Inicie una consulta virtual con el paciente o médico referente.
                Se creará una sala segura de videoconferencia.
              </p>
              {patientName && (
                <div className="text-sm text-gray-300">
                  <span className="text-gray-500">Paciente:</span> <strong>{patientName}</strong>
                </div>
              )}
            </div>

            {/* Share Link */}
            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Enlace para compartir</label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={jitsiUrl}
                  className="flex-1 p-2.5 rounded-lg bg-black/60 border border-white/10 text-white text-sm font-sans tracking-wide truncate outline-none"
                />
                <button
                  onClick={copyLink}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 ${copied ? 'bg-green-600/30 text-green-300 border-green-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'}`}
                >
                  {copied ? <><CheckCircle2 className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">
                Envíe este enlace por WhatsApp, email o SMS al participante remoto.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => { setStarted(false); onClose(); }}
                className="flex-1 py-3 rounded-lg font-bold text-sm bg-black/40 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => setStarted(true)}
                className="flex-1 py-3 rounded-lg font-bold text-sm bg-green-600 hover:bg-green-500 text-white transition-all flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" /> Unirme a Sala
              </button>
              <a
                href={jitsiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-lg font-bold text-sm bg-blue-600/30 border border-blue-500/50 text-primary-light hover:bg-blue-600/40 transition-all flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </>
        ) : (
          <>
            {/* Embedded Jitsi */}
            <div className="rounded-xl overflow-hidden border border-white/10" style={{ height: '480px' }}>
              <iframe
                src={`https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.startWithVideoMuted=false&config.startWithAudioMuted=false`}
                allow="camera; microphone; fullscreen; display-capture"
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Videollamada Telemedicina"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setStarted(false); onClose(); }}
                className="flex-1 py-3 rounded-lg font-bold text-sm bg-red-600/30 border border-red-500/50 text-red-300 hover:bg-red-600/40 transition-all flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" /> Finalizar Llamada
              </button>
              <button
                onClick={copyLink}
                className="py-3 px-4 rounded-lg font-bold text-sm bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-2"
              >
                <Copy className="w-4 h-4" /> {copied ? 'Copiado' : 'Enlace'}
              </button>
            </div>
          </>
        )}
      </div>
    </RisModal>
  );
}
