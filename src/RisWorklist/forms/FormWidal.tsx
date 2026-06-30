import React from 'react';

interface WidalProps {
  widalDatos: any;
  setWidalDatos: (datos: any) => void;
}

export default function FormWidal({ widalDatos, setWidalDatos }: WidalProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setWidalDatos({
      ...widalDatos,
      [name]: value
    });
  };

  const datos = widalDatos || {};

  return (
    <div style={{ padding: '15px', backgroundColor: '#16221f', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🔬 REACCIÓN DE WIDAL (TÍFICO)</legend>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>ANTÍGENO O:</label>
            <input type="text" name="widal_o" value={datos.widal_o || ''} onChange={handleChange} placeholder="e.g. 1:160 o Negativo" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>ANTÍGENO H:</label>
            <input type="text" name="widal_h" value={datos.widal_h || ''} onChange={handleChange} placeholder="e.g. 1:80 o Negativo" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>PARATÍFICO A:</label>
            <input type="text" name="widal_a" value={datos.widal_a || ''} onChange={handleChange} placeholder="e.g. Negativo" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>PARATÍFICO B:</label>
            <input type="text" name="widal_b" value={datos.widal_b || ''} onChange={handleChange} placeholder="e.g. Negativo" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* REPORTE DE OBSERVACIONES */}
      <div>
        <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Observaciones / Interpretación Widal:</label>
        <textarea name="observaciones_widal" value={datos.observaciones_widal || ''} onChange={handleChange} placeholder="Comentarios clínicos sobre los títulos obtenidos..." style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', height: '50px', resize: 'none', fontFamily: 'sans-serif', fontSize: '12px' }} />
      </div>

    </div>
  );
}