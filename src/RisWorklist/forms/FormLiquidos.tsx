import React from 'react';

interface LiquidosProps {
  liquidosDatos: any;
  setLiquidosDatos: (datos: any) => void;
}

export default function FormLiquidos({ liquidosDatos, setLiquidosDatos }: LiquidosProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLiquidosDatos({
      ...liquidosDatos,
      [name]: value
    });
  };

  const datos = liquidosDatos || {};

  return (
    <div style={{ padding: '15px', backgroundColor: '#16221f', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      {/* SECCIÓN 1: EXAMEN FÍSICO INICIAL */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🧪 EXAMEN MACROSCÓPICO INICIAL</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#00bfa5', marginBottom: '4px', fontWeight: 'bold' }}>TIPO DE LÍQUIDO:</label>
            <input type="text" name="tipo_liquido" value={datos.tipo_liquido || ''} onChange={handleChange} placeholder="e.g. Cefalorraquídeo, Pleural, Ascítico" style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #00bfa5', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>VOLUMEN:</label>
            <input type="text" name="volumen" value={datos.volumen || ''} onChange={handleChange} placeholder="e.g. 5 mL" style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>COLOR:</label>
            <input type="text" name="color" value={datos.color || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>ASPECTO:</label>
            <input type="text" name="aspecto" value={datos.aspecto || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>PH:</label>
            <input type="text" name="ph" value={datos.ph || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>REACCIÓN:</label>
            <input type="text" name="reaccion" value={datos.reaccion || ''} onChange={handleChange} placeholder="e.g. Rivalta Positiva" style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 2: LUEGO DE LA CENTRIFUGACIÓN */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🌀 LUEGO DE LA CENTRIFUGACIÓN</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>COLOR (Sobrenadante):</label>
            <input type="text" name="centrif_color" value={datos.centrif_color || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>ASPECTO (Sobrenadante):</label>
            <input type="text" name="centrif_aspecto" value={datos.centrif_aspecto || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>OBSERVACIONES (Centrifugación):</label>
            <input type="text" name="centrif_obs" value={datos.centrif_obs || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 3: EXAMEN QUÍMICO */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🧪 EXAMEN QUÍMICO</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>GLUCOSA:</label>
            <input type="text" name="quimico_glucosa" value={datos.quimico_glucosa || ''} onChange={handleChange} placeholder="mg/dL" style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>PROTEÍNAS:</label>
            <input type="text" name="quimico_proteinas" value={datos.quimico_proteinas || ''} onChange={handleChange} placeholder="mg/dL" style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>OBSERVACIONES (Químico):</label>
            <input type="text" name="quimico_obs" value={datos.quimico_obs || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 4: EXAMEN MICROSCOPICO */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🔬 EXAMEN MICROSCOPICO</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>LEUCOCITOS (Recuento):</label>
            <input type="text" name="micro_leucocitos" value={datos.micro_leucocitos || ''} onChange={handleChange} placeholder="x mm³" style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>PMN (Polimorfonucleares %):</label>
            <input type="text" name="micro_pmn" value={datos.micro_pmn || ''} onChange={handleChange} placeholder="%" style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>MN (Mononucleares %):</label>
            <input type="text" name="micro_mn" value={datos.micro_mn || ''} onChange={handleChange} placeholder="%" style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#ff8a80', marginBottom: '4px' }}>NO PROCEDE A RECUENTO DIFERENCIAL (OBS):</label>
            <input type="text" name="micro_no_procede_obs" value={datos.micro_no_procede_obs || ''} onChange={handleChange} placeholder="Razón por la cual no procede el diferencial..." style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #ff8a80', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 5: SEDIMENTO */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🕳️ SEDIMENTO</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>LEUCOCITOS:</label>
            <input type="text" name="sedimento_leucocitos" value={datos.sedimento_leucocitos || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>HEMATÍES:</label>
            <input type="text" name="sedimento_hematies" value={datos.sedimento_hematies || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>BACTERIAS:</label>
            <input type="text" name="sedimento_bacterias" value={datos.sedimento_bacterias || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>OTROS:</label>
            <input type="text" name="sedimento_otros" value={datos.sedimento_otros || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* OTROS EXTRA GENERALES */}
      <div>
        <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Otros Hallazgos / Notas Libres:</label>
        <textarea name="otros" value={datos.otros || ''} onChange={handleChange} placeholder="Anotaciones generales adicionales..." style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', height: '45px', resize: 'none', fontFamily: 'sans-serif', fontSize: '12px' }} />
      </div>

    </div>
  );
}