import React from 'react';

interface GlucosaProps {
  glucosaFija: any;
  setGlucosaFija: (datos: any) => void;
}

export default function FormGlucosa({ glucosaFija, setGlucosaFija }: GlucosaProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGlucosaFija({
      ...glucosaFija,
      [name]: value
    });
  };

  const datos = glucosaFija || {};

  return (
    <div style={{ padding: '15px', backgroundColor: '#16221f', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>📈 TEST DE TOLERANCIA A LA GLUCOSA</legend>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* FASE BASAL */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderBottom: '1px dashed #1f332d', paddingBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#00bfa5', marginBottom: '4px', fontWeight: 'bold' }}>MUESTRA BASAL (En Ayunas):</label>
              <input type="text" name="basal" value={datos.basal || ''} onChange={handleChange} placeholder="e.g. 95 mg/dL" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>HORA BASAL:</label>
              <input type="text" name="hora_basal" value={datos.hora_basal || ''} onChange={handleChange} placeholder="e.g. 07:30" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
            </div>
          </div>

          {/* FASE 1 HORA */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderBottom: '1px dashed #1f332d', paddingBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#00bfa5', marginBottom: '4px', fontWeight: 'bold' }}>MEDICIÓN 1 HORA (Post-Carga):</label>
              <input type="text" name="resultado_glucosa1" value={datos.resultado_glucosa1 || ''} onChange={handleChange} placeholder="e.g. 145 mg/dL" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>HORA 1 HORA:</label>
              <input type="text" name="hora_1h" value={datos.hora_1h || ''} onChange={handleChange} placeholder="e.g. 08:30" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
            </div>
          </div>

          {/* FASE 2 HORAS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#00bfa5', marginBottom: '4px', fontWeight: 'bold' }}>MEDICIÓN 2 HORAS (Post-Carga):</label>
              <input type="text" name="resultado_glucosa2" value={datos.resultado_glucosa2 || ''} onChange={handleChange} placeholder="e.g. 120 mg/dL" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>HORA 2 HORAS:</label>
              <input type="text" name="hora_2h" value={datos.hora_2h || ''} onChange={handleChange} placeholder="e.g. 09:30" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
            </div>
          </div>

        </div>
      </fieldset>

      {/* OBSERVACIONES ADICIONALES */}
      <div>
        <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Observaciones de la Curva de Tolerancia:</label>
        <textarea name="observaciones_glucosa" value={datos.observaciones_glucosa || ''} onChange={handleChange} placeholder="e.g. Carga administrada: 75g de glucosa anhidra. Tolerancia adecuada." style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', height: '50px', resize: 'none', fontFamily: 'sans-serif', fontSize: '12px' }} />
      </div>

    </div>
  );
}