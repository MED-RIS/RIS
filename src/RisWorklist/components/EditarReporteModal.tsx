import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

import FormularioHemograma from '../forms/FormularioHemograma';
import FormularioCoagulograma from '../forms/FormularioCoagulograma';
import FormEgo from '../forms/FormEgo';
import FormQuimica from '../forms/FormQuimica';
import FormElectrolitos from '../forms/FormElectrolitos';
import FormMicroalbuminuria from '../forms/FormMicroalbuminuria';
import FormOrina24Hrs from '../forms/FormOrina24Hrs';
import FormSerologia from '../forms/FormSerologia';
import FormGlucosa from '../forms/FormGlucosa';
import FormWidal from '../forms/FormWidal';
import FormLiquidos from '../forms/FormLiquidos';
import FormEspermato from '../forms/FormEspermato';

// Un reporte se edita a través de uno o más de los formularios presentacionales
// existentes. Cada formulario trabaja sobre una "bolsa" de datos con dos posibles
// ubicaciones dentro de `paciente.datos` (que es de donde el generador de PDF lee):
//   - 'flat':   claves hematológicas planas en la raíz de `datos` (Hemograma, Grupo
//               Sanguíneo, Hto-Hb, Coagulograma). El generador lee `datos.hb`, etc.
//   - 'nested': sub-objeto namespaceado, p.ej. `datos.egoDatos`. El generador lee
//               `datos.egoDatos.*`.
type Mode = 'flat' | 'nested';

interface FormEntry {
  key: string;
  mode: Mode;
  render: (value: any, setValue: (v: any) => void) => React.ReactNode;
}

interface ReporteEditable {
  titulo: string;
  forms: FormEntry[];
}

export const REPORTES_EDITABLES: Record<string, ReporteEditable> = {
  hematologia: {
    titulo: 'Hematología — Hemograma Completo',
    forms: [
      { key: 'hematoDatos', mode: 'flat', render: (v, set) => <FormularioHemograma hematoDatos={v} setHematoDatos={set} /> },
    ],
  },
  grupo_sanguineo: {
    titulo: 'Grupo Sanguíneo (deriva del Hemograma)',
    forms: [
      { key: 'hematoDatos', mode: 'flat', render: (v, set) => <FormularioHemograma hematoDatos={v} setHematoDatos={set} /> },
    ],
  },
  hto_hb: {
    titulo: 'Hto / Hb (deriva del Hemograma)',
    forms: [
      { key: 'hematoDatos', mode: 'flat', render: (v, set) => <FormularioHemograma hematoDatos={v} setHematoDatos={set} /> },
    ],
  },
  coagulograma: {
    titulo: 'Coagulograma / Tiempo de Protrombina',
    forms: [
      { key: 'hematoDatos', mode: 'flat', render: (v, set) => <FormularioCoagulograma hematoDatos={v} setHematoDatos={set} /> },
    ],
  },
  hto_hb_widal: {
    titulo: 'Hematología + Reacción de Widal',
    forms: [
      { key: 'hematoDatos', mode: 'flat', render: (v, set) => <FormularioHemograma hematoDatos={v} setHematoDatos={set} /> },
      { key: 'widalDatos', mode: 'nested', render: (v, set) => <FormWidal widalDatos={v} setWidalDatos={set} /> },
    ],
  },
  ego: {
    titulo: 'Examen General de Orina',
    forms: [
      { key: 'egoDatos', mode: 'nested', render: (v, set) => <FormEgo egoDatos={v} setEgoDatos={set} /> },
    ],
  },
  quimica: {
    titulo: 'Química Sanguínea',
    forms: [
      { key: 'quimicaDatos', mode: 'nested', render: (v, set) => <FormQuimica quimicaDatos={v} setQuimicaDatos={set} /> },
    ],
  },
  electrolitos: {
    titulo: 'Electrolitos, Proteínas en Orina y Microalbuminuria',
    forms: [
      { key: 'quimicaDatos', mode: 'nested', render: (v, set) => <FormElectrolitos quimicaDatos={v} setQuimicaDatos={set} /> },
      { key: 'egoDatos', mode: 'nested', render: (v, set) => <FormOrina24Hrs egoDatos={v} setEgoDatos={set} /> },
      { key: 'microDatos', mode: 'nested', render: (v, set) => <FormMicroalbuminuria microDatos={v} setMicroDatos={set} /> },
    ],
  },
  serologia: {
    titulo: 'Serología — Pruebas Inmunológicas',
    forms: [
      { key: 'serologiaDatos', mode: 'nested', render: (v, set) => <FormSerologia serologiaDatos={v} setSerologiaDatos={set} /> },
    ],
  },
  tolerancia_glucosa: {
    titulo: 'Curva de Tolerancia a la Glucosa',
    forms: [
      { key: 'glucosaFija', mode: 'nested', render: (v, set) => <FormGlucosa glucosaFija={v} setGlucosaFija={set} /> },
    ],
  },
  liquidos: {
    titulo: 'Análisis de Líquidos Biológicos',
    forms: [
      { key: 'liquidosDatos', mode: 'nested', render: (v, set) => <FormLiquidos liquidosDatos={v} setLiquidosDatos={set} /> },
    ],
  },
  espermato: {
    titulo: 'Espermatograma',
    forms: [
      { key: 'espermatoDatos', mode: 'nested', render: (v, set) => <FormEspermato espermatoDatos={v} setEspermatoDatos={set} /> },
    ],
  },
};

interface EditarReporteModalProps {
  reporte: any;        // Registro del paciente tal como vive en `ris_historial_cns`.
  idReporte: string;   // Clave dentro de REPORTES_EDITABLES.
  onGuardar: (nuevoDatos: any) => void;
  onCerrar: () => void;
}

export default function EditarReporteModal({ reporte, idReporte, onGuardar, onCerrar }: EditarReporteModalProps) {
  const config = REPORTES_EDITABLES[idReporte];

  // Siembra cada formulario desde la MISMA ubicación de la que lee el generador de PDF.
  const seedBag = (entry: FormEntry) => {
    const datos = reporte?.datos || {};
    if (entry.mode === 'flat') return { ...(datos.hematoDatos || datos) };
    return { ...(datos[entry.key] || {}) };
  };

  const [bags, setBags] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    config?.forms.forEach((f) => { init[f.key] = seedBag(f); });
    return init;
  });

  if (!config) return null;

  const setBag = (key: string, value: any) => setBags((prev) => ({ ...prev, [key]: value }));

  const guardar = () => {
    let nuevoDatos: any = { ...(reporte?.datos || {}) };
    config.forms.forEach((entry) => {
      const val = bags[entry.key];
      if (entry.mode === 'flat') {
        // Se escribe plano en la raíz (lo que lee el reporte) y se espejan las copias
        // anidadas para mantener la misma forma que produce el guardado original.
        nuevoDatos = { ...nuevoDatos, ...val };
        nuevoDatos.hematoDatos = { ...val };
        nuevoDatos.datos = { ...val };
      } else {
        nuevoDatos[entry.key] = val;
      }
    });
    onGuardar(nuevoDatos);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
      <div className="bg-[#0a0f0d] border border-[#2a403a] rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">

        <div className="flex justify-between items-start border-b border-[#1f332d] p-4">
          <div>
            <span className="text-[10px] bg-primary-light/10 text-[#00bfa5] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              Editar Reporte
            </span>
            <h3 className="text-base font-bold text-white mt-1">{config.titulo}</h3>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">
              {reporte?.paciente} · MAT: {reporte?.cod}
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title="Cerrar sin guardar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {config.forms.map((entry) => (
            <div key={entry.key}>{entry.render(bags[entry.key], (v) => setBag(entry.key, v))}</div>
          ))}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#1f332d] p-4">
          <button
            onClick={onCerrar}
            className="px-4 py-2 text-xs font-bold text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={guardar}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#005a43] hover:bg-[#00734f] rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" /> Guardar Cambios
          </button>
        </div>

      </div>
    </div>
  );
}
