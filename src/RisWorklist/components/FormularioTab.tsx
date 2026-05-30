import React, { useState } from 'react';
import { FileDown, FileText } from 'lucide-react';

const FormularioTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('tab1');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-secondary-dark pb-4">
        <h2 className="text-xl font-bold text-primary-light">Formulario</h2>
        <div className="flex gap-2">
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
          className={`pb-2 px-2 text-sm font-medium transition-colors border-b-2 ${
            activeSubTab === 'tab1'
              ? 'border-primary-light text-primary-light'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveSubTab('tab1')}
        >
          Plantilla 1
        </button>
        <button
          className={`pb-2 px-2 text-sm font-medium transition-colors border-b-2 ${
            activeSubTab === 'tab2'
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
    </div>
  );
};

export default FormularioTab;
