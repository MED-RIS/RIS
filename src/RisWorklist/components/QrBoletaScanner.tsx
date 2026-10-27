import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import RisModal from './RisModal';

interface QrBoletaScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onDecoded: (rawText: string) => void;
  titulo?: string;
}

/**
 * Escanea el código QR impreso en la boleta física (CNS El Alto) usando la cámara
 * del dispositivo. No asume ningún formato de contenido: solo decodifica el QR y
 * entrega el texto crudo a onDecoded — el mapeo a campos del paciente se hace afuera.
 */
export default function QrBoletaScanner({ isOpen, onClose, onDecoded, titulo = 'Escanear QR de la boleta CNS' }: QrBoletaScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [error, setError] = useState('');
  // La función puede cambiar en cada render: se guarda aparte para no reiniciar la cámara
  const onDecodedRef = useRef(onDecoded);
  onDecodedRef.current = onDecoded;
  const [leyendoFoto, setLeyendoFoto] = useState(false);

  // Leer el QR desde una foto de la boleta (para computadoras sin cámara). Se prueba la
  // imagen entera y luego por partes ampliadas, porque en una foto el QR queda chico.
  const leerFoto = async (archivo?: File | null) => {
    if (!archivo) return;
    setLeyendoFoto(true);
    setError('');
    try {
      const url = URL.createObjectURL(archivo);
      const img = new Image();
      img.src = url;
      await img.decode();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      const intentar = (sx: number, sy: number, sw: number, sh: number, escala: number) => {
        canvas.width = Math.max(1, Math.round(sw * escala));
        canvas.height = Math.max(1, Math.round(sh * escala));
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        const datos = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return jsQR(datos.data, datos.width, datos.height, { inversionAttempts: 'attemptBoth' });
      };
      const W = img.naturalWidth;
      const H = img.naturalHeight;
      const maxLado = Math.max(W, H);
      let res = intentar(0, 0, W, H, Math.min(1, 1600 / maxLado));
      for (const frac of [0.5, 0.35]) {
        if (res) break;
        const lado = Math.round(Math.min(W, H) * frac);
        const paso = Math.round(lado / 2);
        for (let y = 0; !res && y + lado <= H; y += paso) {
          for (let x = 0; !res && x + lado <= W; x += paso) {
            res = intentar(x, y, lado, lado, Math.min(3, 900 / lado));
          }
        }
      }
      URL.revokeObjectURL(url);
      if (res?.data) onDecodedRef.current(res.data);
      else setError('No se encontró el QR en la foto. Tome la foto más cerca del código, con buena luz y sin que se vea movida.');
    } catch {
      setError('No se pudo leer la imagen.');
    } finally {
      setLeyendoFoto(false);
    }
  };

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
        onDecodedRef.current(result.data);
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
  }, [isOpen]);

  return (
    <RisModal isOpen={isOpen} onClose={onClose} title={titulo} maxWidth="max-w-md">
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
        <label className="block text-center bg-black/40 border border-dashed border-gray-600 text-gray-300 py-2.5 rounded-lg font-bold text-xs hover:border-primary-light cursor-pointer">
          {leyendoFoto ? 'Leyendo la foto…' : 'O subir una foto'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={leyendoFoto}
            onChange={(e) => {
              leerFoto(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </label>
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
