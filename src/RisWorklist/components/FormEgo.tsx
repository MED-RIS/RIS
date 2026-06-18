import React from 'react';


interface FormEgoProps {
  egoDatos: {
    volumen: number;
    color: string;
    aspecto: string;
    ph: number;
    densidad: number;
    prot: string;
    glucosa: string;
    nitritos: string;
    leucocitos: string;
    eritrocitos: string;
    bacterias: string;
    cel_epiteliales: string;
    obs1: string;
  };
  setEgoDatos: (datos: any) => void;
}

export default function FormEgo({ egoDatos, setEgoDatos }: FormEgoProps) {
  
  const handleChange = (e: { target: { name: string; value: string; type?: string } }) => {
    const { name, value } = e.target;
    setEgoDatos({
      ...egoDatos,
      [name]: e.target.type === 'number' ? parseFloat(value) || 0 : value
    });
  };

  return (
    <div style={{ padding: '15px', backgroundColor: '#16221f', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* SECCIÓN 1: EXAMEN FÍSICO */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🧪 EXAMEN FÍSICO</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Color:</label>
            <input type="text" name="color" value={egoDatos.color || ''} onChange={handleChange} placeholder="Ej: Amarillo, Ámbar" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Aspecto:</label>
            <input type="text" name="aspecto" value={egoDatos.aspecto || ''} onChange={handleChange} placeholder="Ej: Límpido, Turbio" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Volumen Muestra (mL):</label>
            <input type="number" name="volumen" value={egoDatos.volumen || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 2: EXAMEN QUÍMICO */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🧪 EXAMEN QUÍMICO (TIRA REACTIVA)</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Densidad:</label>
            <input type="number" name="densidad" step="0.001" value={egoDatos.densidad || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>pH (Acidez):</label>
            <input type="number" name="ph" step="0.1" value={egoDatos.ph || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Nitritos:</label>
            <select name="nitritos" value={egoDatos.nitritos || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
              <option value="Negativo">Negativo</option>
              <option value="Positivo (+)">Positivo (+)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Proteínas:</label>
            <input type="text" name="prot" value={egoDatos.prot || ''} onChange={handleChange} placeholder="Ej: Negativo o 30 mg/dL" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Glucosa:</label>
            <input type="text" name="glucosa" value={egoDatos.glucosa || ''} onChange={handleChange} placeholder="Ej: Normal o Positivo (+)" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 3: SEDIMENTO MICROSCÓPICO */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🔬 SEDIMENTO MICROSCOPIO</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Leucocitos (por campo):</label>
            <input type="text" name="leucocitos" value={egoDatos.leucocitos || ''} onChange={handleChange} placeholder="Ej: 1-2 o >50" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Eritrocitos (por campo):</label>
            <input type="text" name="eritrocitos" value={egoDatos.eritrocitos || ''} onChange={handleChange} placeholder="Ej: 0-1 o Abundantes" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Bacterias:</label>
            <select name="bacterias" value={egoDatos.bacterias || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
              <option value="Escasas">Escasas</option>
              <option value="Moderadas">Moderadas</option>
              <option value="Abundantes">Abundantes</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Células Epiteliales:</label>
            <select name="cel_epiteliales" value={egoDatos.cel_epiteliales || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
              <option value="Escasas">Escasas</option>
              <option value="Moderadas">Moderadas</option>
              <option value="Abundantes">Abundantes</option>
            </select>
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 4: OBSERVACIONES GENERALES */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', color: '#00bfa5', fontWeight: 'bold', marginBottom: '4px' }}>Observaciones del Sedimento / Cilindros / Cristales:</label>
        <textarea name="obs1" value={egoDatos.obs1 || ''} onChange={handleChange} placeholder="Reportar presencia de moco, filamentos, cristales de oxalato de calcio..." style={{ width: '100%', padding: '10px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', height: '60px', resize: 'none' }} />
      </div>

    </div>
  );
}