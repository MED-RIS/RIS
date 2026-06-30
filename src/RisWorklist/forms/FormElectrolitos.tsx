import React from 'react';

interface ElectrolitosProps {
  quimicaDatos: any;
  setQuimicaDatos: (datos: any) => void;
}

export default function FormElectrolitos({ quimicaDatos, setQuimicaDatos }: ElectrolitosProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuimicaDatos({
      ...quimicaDatos,
      [name]: e.target.type === 'number' ? (parseFloat(value) || 0) : value
    });
  };

  const datos = quimicaDatos || {};

  return (
    <div style={{ padding: '15px', backgroundColor: '#16221f', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>⚡ ELECTROLITOS SÉRICOS</legend>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>SODIO (Na⁺):</label>
            <input type="number" step="0.01" name="sodio_meql" value={datos.sodio_meql || ''} onChange={handleChange} placeholder="mEq/L" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>POTASIO (K⁺):</label>
            <input type="number" step="0.01" name="potasio_meql" value={datos.potasio_meql || ''} onChange={handleChange} placeholder="mEq/L" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>CLORO (Cl⁻):</label>
            <input type="number" step="0.01" name="cloro_meql" value={datos.cloro_meql || ''} onChange={handleChange} placeholder="mEq/L" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* OBSERVACIONES EXCLUSIVAS */}
      <div>
        <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Observaciones de Electrolitos:</label>
        <textarea name="observaciones_electrolitos" value={datos.observaciones_electrolitos || ''} onChange={handleChange} placeholder="Comentarios libres sobre electrolitos..." style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', height: '50px', resize: 'none', fontFamily: 'sans-serif', fontSize: '12px' }} />
      </div>

    </div>
  );
}