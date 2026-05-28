import React, { useEffect, useRef } from 'react';

interface RisModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Width class, e.g. 'max-w-md' (default) or 'max-w-lg' */
  maxWidth?: string;
}

/**
 * Reutilizable modal backdrop + card for RisWorklist create/edit forms.
 * Closes on Escape key and on backdrop click.
 */
export default function RisModal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}: RisModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onMouseDown={(e) => {
        if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        className={`relative bg-primary-main border border-secondary-dark rounded-xl shadow-2xl w-full ${maxWidth}`}
        style={{ willChange: 'transform' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-dark">
          <h2 className="text-lg font-bold text-primary-light uppercase tracking-wide">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl leading-none font-bold"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
