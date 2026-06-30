import React from 'react';

interface Orina24HrsProps {
  egoDatos: any;
  setEgoDatos: (datos: any) => void;
}

export default function FormOrina24Hrs({ egoDatos, setEgoDatos }: Orina24HrsProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEgoDatos({
      ...egoDatos,
      [name]: e.target.type === 'number' ? (parseFloat(value) || 0) : value
    });
  };

  const datos = egoDatos || {};

  return (
    <div style={{ padding: '15px', backgroundColor: '#16221f', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🏺 RECOLECCIÓN DE ORINA DE 24 HORAS</legend>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>VOLUMEN TOTAL:</label>
            <input type="number" name="volumen_24h" value={datos.volumen_24h || ''} onChange={handleChange} placeholder="e.g. 1500 mL" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>PROT 24 HRS (Proteínas Totales):</label>
            <input type="number" step="0.01" name="prot_24h" value={datos.prot_24h || ''} onChange={handleChange} placeholder="mg/24h" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>CREA EN ORINA (Creatinina):</label>
            <input type="number" step="0.01" name="crea_orina_24h" value={datos.crea_orina_24h || ''} onChange={handleChange} placeholder="mg/24h" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* OBSERVACIONES EXCLUSIVAS */}
      <div>
        <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Observaciones de Orina 24 Hrs:</label>
        <textarea name="obs_orina_24h" value={datos.obs_orina_24h || ''} onChange={handleChange} placeholder="Comentarios sobre la muestra o aclaraciones..." style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', height: '50px', resize: 'none', fontFamily: 'sans-serif', fontSize: '12px' }} />
      </div>

    </div>
  );
}