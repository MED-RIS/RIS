import React from 'react';

interface EgoProps {
  egoDatos: any;
  setEgoDatos: (datos: any) => void;
}

export default function FormEgo({ egoDatos, setEgoDatos }: EgoProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEgoDatos({
      ...egoDatos,
      [name]: value
    });
  };

  const datos = egoDatos || {};

  return (
    <div style={{ padding: '15px', backgroundColor: '#16221f', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      {/* SECCIÓN 1: EXAMEN FÍSICO Y MACROSCÓPICO */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🎨 EXAMEN FÍSICO</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>VOLUMEN:</label>
            <input type="text" name="volumen" value={datos.volumen || ''} onChange={handleChange} placeholder="e.g. 50 mL" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>COLOR:</label>
            <input type="text" name="color" value={datos.color || ''} onChange={handleChange} placeholder="e.g. Amarillo" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>OLOR:</label>
            <input type="text" name="olor" value={datos.olor || ''} onChange={handleChange} placeholder="e.g. Propio / Sui géneris" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>ASPECTO:</label>
            <input type="text" name="aspecto" value={datos.aspecto || ''} onChange={handleChange} placeholder="e.g. Límpido / Turbio" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>ESPUMA:</label>
            <input type="text" name="espuma" value={datos.espuma || ''} onChange={handleChange} placeholder="e.g. Blanca fugaz" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>OTROS (Físico):</label>
            <input type="text" name="otros_fisico" value={datos.otros_fisico || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 2: EXAMEN QUÍMICO (TIRA REACTIVA) */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🧪 EXAMEN QUÍMICO</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>DENSIDAD:</label>
            <input type="text" name="densidad" value={datos.densidad || ''} onChange={handleChange} placeholder="1.020" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>pH:</label>
            <input type="text" name="ph" value={datos.ph || ''} onChange={handleChange} placeholder="6.0" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>PROT (Proteínas):</label>
            <input type="text" name="prot" value={datos.prot || ''} onChange={handleChange} placeholder="Negativo" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>GLUCOSA:</label>
            <input type="text" name="glucosa" value={datos.glucosa || ''} onChange={handleChange} placeholder="Normal" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>CETONAS:</label>
            <input type="text" name="cetonas" value={datos.cetonas || ''} onChange={handleChange} placeholder="Negativo" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>BILIRRUBINAS:</label>
            <input type="text" name="bilirrubinas" value={datos.bilirrubinas || ''} onChange={handleChange} placeholder="Negativo" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>SANGRE:</label>
            <input type="text" name="sangre" value={datos.sangre || ''} onChange={handleChange} placeholder="Negativo" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>UROBILINÓGENO:</label>
            <input type="text" name="urobilinogeno" value={datos.urobilinogeno || ''} onChange={handleChange} placeholder="Normal" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>NITRITOS:</label>
            <input type="text" name="nitritos" value={datos.nitritos || ''} onChange={handleChange}  style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 3: EXAMEN DEL SEDIMENTO MICROSCOPICO */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🔬 SEDIMENTO MICROSCOPICO</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>SEDIMENTO:</label>
            <input type="text" name="sedimento" value={datos.sedimento || ''} onChange={handleChange} placeholder="Escaso / Abundante" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>PIOCITOS:</label>
            <input type="text" name="piocitos" value={datos.piocitos || ''} onChange={handleChange} placeholder="e.g. 0-2 x campo" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>LEUCOCITOS:</label>
            <input type="text" name="leucocitos" value={datos.leucocitos || ''} onChange={handleChange} placeholder="e.g. 1-3 x campo" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>ERITROCITOS:</label>
            <input type="text" name="eritrocitos" value={datos.eritrocitos || ''} onChange={handleChange} placeholder="e.g. 0-1 x campo" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>C. EPITELIALES:</label>
            <input type="text" name="cel_epiteliales" value={datos.cel_epiteliales || ''} onChange={handleChange} placeholder="Escasas" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>BACTERIAS:</label>
            <input type="text" name="bacterias" value={datos.bacterias || ''} onChange={handleChange} placeholder="Escasas / Regular" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>CEL. RENALES:</label>
            <input type="text" name="cel_renales" value={datos.cel_renales || ''} onChange={handleChange} placeholder="No se observan" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>FILAMENTO MUCOSO:</label>
            <input type="text" name="filamento_mucoso" value={datos.filamento_mucoso || ''} onChange={handleChange} placeholder="Escaso" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>CRISTALES:</label>
            <input type="text" name="cristales" value={datos.cristales || ''} onChange={handleChange} placeholder="e.g. Oxalato de Calcio" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 4: SUBSECCIÓN DE CILINDROS */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🌀 CILINDROS</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>HIALINOS:</label>
            <input type="text" name="cilindros_hialinos" value={datos.cilindros_hialinos || ''} onChange={handleChange} placeholder="e.g. No se observan" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>GRANULOSO:</label>
            <input type="text" name="cilindros_granuloso" value={datos.cilindros_granuloso || ''} onChange={handleChange} placeholder="e.g. No se observan" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>HEMATICO:</label>
            <input type="text" name="cilindros_hematico" value={datos.cilindros_hematico || ''} onChange={handleChange} placeholder="e.g. No se observan" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>CEREO:</label>
            <input type="text" name="cilindros_cereo" value={datos.cilindros_cereo || ''} onChange={handleChange} placeholder="e.g. No se observan" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>OTROS (Cilindros):</label>
            <input type="text" name="cilindros_otros" value={datos.cilindros_otros || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 5: OBSERVACIONES */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>📝 NOTAS CLÍNICAS</legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>OBSERVACIONES 1:</label>
            <textarea name="observaciones1" value={datos.observaciones1 || ''} onChange={handleChange} placeholder="Comentarios del análisis inicial..." style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', height: '45px', resize: 'none', fontFamily: 'sans-serif', fontSize: '12px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>OBSERVACIONES 2:</label>
            <textarea name="observaciones2" value={datos.observaciones2 || ''} onChange={handleChange} placeholder="Notas adicionales o confirmaciones del supervisor..." style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', height: '45px', resize: 'none', fontFamily: 'sans-serif', fontSize: '12px' }} />
          </div>
        </div>
      </fieldset>

    </div>
  );
}