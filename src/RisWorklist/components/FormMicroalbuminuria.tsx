import React from 'react';

interface MicroalbuminuriaProps {
  microDatos: any;
  setMicroDatos: (datos: any) => void;
}

export default function FormMicroalbuminuria({ microDatos, setMicroDatos }: MicroalbuminuriaProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMicroDatos({
      ...microDatos,
      [name]: e.target.type === 'number' ? (parseFloat(value) || 0) : value
    });
  };

  const datos = microDatos || {};

  return (
    <div style={{ padding: '15px', backgroundColor: '#16221f', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🔬 MICROALBUMINURIA (MUESTRA AISLADA)</legend>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>ALBÚMINA (en Orina):</label>
            <input type="number" step="0.01" name="micro_albumina" value={datos.micro_albumina || ''} onChange={handleChange} placeholder="mg/L" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>CREATININA (en Orina):</label>
            <input type="number" step="0.01" name="micro_creatinina" value={datos.micro_creatinina || ''} onChange={handleChange} placeholder="g/L o mg/dL" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#00bfa5', marginBottom: '4px' }}>RELACIÓN A/C (Albúmina/Creatinina):</label>
            <input type="text" name="relacion_ac" value={datos.relacion_ac || ''} onChange={handleChange} placeholder="e.g. <30 mg/g" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #00bfa5', borderRadius: '4px', color: '#fff', fontWeight: 'bold' }} />
          </div>
        </div>
      </fieldset>

      {/* OBSERVACIONES EXCLUSIVAS */}
      <div>
        <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Observaciones de Microalbuminuria:</label>
        <textarea name="observaciones_micro" value={datos.observaciones_micro || ''} onChange={handleChange} placeholder="Anotaciones sobre la muestra o interpretación del índice A/C..." style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', height: '50px', resize: 'none', fontFamily: 'sans-serif', fontSize: '12px' }} />
      </div>

    </div>
  );
}