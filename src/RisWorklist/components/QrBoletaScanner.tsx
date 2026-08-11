import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import RisModal from './RisModal';

interface QrBoletaScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onDecoded: (rawText: string) => void;
}

/**
 * Escanea el código QR impreso en la boleta física (CNS El Alto) usando la cámara
 * del dispositivo. No asume ningún formato de contenido: solo decodifica el QR y
 * entrega el texto crudo a onDecoded — el mapeo a campos del paciente se hace afuera.
 */
export default function QrBoletaScanner({ isOpen, onClose, onDecoded }: QrBoletaScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setError('');

    const stopAll = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };

    const scanLoop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(scanLoop);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        rafRef.current = requestAnimationFrame(scanLoop);
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(imageData.data, imageData.width, imageData.height);
      if (result?.data) {
        stopAll();
        onDecoded(result.data);
        return;
      }
      rafRef.current = requestAnimationFrame(scanLoop);
    };

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        rafRef.current = requestAnimationFrame(scanLoop);
      })
      .catch((err) => {
        setError(
          err?.name === 'NotAllowedError'
            ? 'Permiso de cámara denegado. Habilítalo en el navegador para escanear la boleta.'
            : 'No se pudo acceder a la cámara en este dispositivo.'
        );
      });

    return () => {
      cancelled = true;
      stopAll();
    };
  }, [isOpen, onDecoded]);

  return (
    <RisModal isOpen={isOpen} onClose={onClose} title="Escanear QR de Boleta CNS El Alto" maxWidth="max-w-md">
      <div className="flex flex-col gap-3">
        {error ? (
          <div className="text-xs text-red-400 bg-red-950/40 border border-red-500/30 rounded-lg p-3">
            {error}
          </div>
        ) : (
          <>
            <div className="relative aspect-square w-full bg-black rounded-lg overflow-hidden border border-secondary-dark">
              <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-8 border-2 border-primary-light/70 rounded-lg pointer-events-none" />
            </div>
            <p className="text-[11px] text-gray-400 text-center">
              Apunta la cámara al código QR de la boleta. Se captura automáticamente.
            </p>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
        <button
          type="button"
          onClick={onClose}
          className="bg-black border border-gray-600 text-gray-300 py-2.5 rounded-lg font-bold text-xs hover:bg-gray-800 transition-colors"
        >
          CANCELAR
        </button>
      </div>
    </RisModal>
  );
}
