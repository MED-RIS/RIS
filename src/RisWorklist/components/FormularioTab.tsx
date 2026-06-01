import React, { useState } from 'react';
import {
  FileDown,
  FileText,
  ExternalLink,
  Loader2
} from 'lucide-react';
import RisModal from './RisModal';

const FormularioTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('tab1');
  const [isSimulatedModalOpen, setIsSimulatedModalOpen] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-secondary-dark pb-4">
        <h2 className="text-xl font-bold text-primary-light">Formulario</h2>
        <div className="flex gap-2">
          {/* Botón para abrir el formulario modal */}
          <button
            onClick={() => {
              setIframeLoading(true);
              setIsSimulatedModalOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-all text-sm font-medium shadow-sm hover:shadow-blue-500/10 active:scale-95"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir Formulario
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 bg-green-600/20 text-green-500 border border-green-500/30 rounded-lg hover:bg-green-600/30 transition-colors text-sm font-medium">
            <FileText className="w-4 h-4" />
            Reporte Excel
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-colors text-sm font-medium">
            <FileDown className="w-4 h-4" />
            Reporte PDF
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-secondary-dark">
        <button
          className={`pb-2 px-2 text-sm font-medium transition-colors border-b-2 ${activeSubTab === 'tab1'
            ? 'border-primary-light text-primary-light'
            : 'border-transparent text-gray-400 hover:text-white'
            }`}
          onClick={() => setActiveSubTab('tab1')}
        >
          Plantilla 1
        </button>
        <button
          className={`pb-2 px-2 text-sm font-medium transition-colors border-b-2 ${activeSubTab === 'tab2'
            ? 'border-primary-light text-primary-light'
            : 'border-transparent text-gray-400 hover:text-white'
            }`}
          onClick={() => setActiveSubTab('tab2')}
        >
          Plantilla 2
        </button>
      </div>

      <div className="bg-primary-dark/40 border border-white/5 shadow-2xl rounded-xl p-6 min-h-[300px]">
        {activeSubTab === 'tab1' && (
          <div className="text-gray-300">
            Contenido de la plantilla para componentes (Pestaña 1)
          </div>
        )}
        {activeSubTab === 'tab2' && (
          <div className="text-gray-300">
            Contenido de la plantilla para componentes (Pestaña 2)
          </div>
        )}
      </div>

      {/* Modal interactivo de simulación con iframe */}
      <RisModal
        isOpen={isSimulatedModalOpen}
        onClose={() => {
          setIsSimulatedModalOpen(false);
        }}
        title="Formulario Integrado"
        maxWidth="max-w-6xl w-full"
      >
        <div className="w-full h-[75vh] min-h-[500px] flex flex-col relative rounded-lg overflow-hidden bg-primary-dark/80 border border-white/10">
          {/* Barra de dirección URL simulada del iframe con controles de recarga */}
          <div className="flex items-center justify-between px-4 py-2 bg-secondary-dark/40 border-b border-white/5 text-xs text-gray-400 select-none">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="font-mono tracking-wider">http://147.93.3.171:5174</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const iframe = document.getElementById('formulario-iframe') as HTMLIFrameElement;
                  if (iframe) {
                    setIframeLoading(true);
                    iframe.src = iframe.src;
                  }
                }}
                className="hover:text-white transition-colors flex items-center gap-1 font-medium bg-white/5 hover:bg-white/10 px-2 py-1 rounded"
              >
                🔄 Recargar
              </button>
              <a
                href="http://147.93.3.171:5174"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1 font-medium bg-white/5 hover:bg-white/10 px-2 py-1 rounded"
              >
                ↗️ Abrir pestaña externa
              </a>
            </div>
          </div>

          {/* Loader Overlay */}
          {iframeLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary-main/95 z-10 gap-3">
              <Loader2 className="w-10 h-10 text-primary-light animate-spin" />
              <span className="text-sm text-gray-400">Cargando formulario desde localhost...</span>
            </div>
          )}

          <iframe
            id="formulario-iframe"
            src="http://147.93.3.171:5174"
            className="w-full flex-1 border-none bg-white"
            onLoad={() => setIframeLoading(false)}
            title="Formulario Integrado"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </RisModal>
    </div>
  );
};

export default FormularioTab;


