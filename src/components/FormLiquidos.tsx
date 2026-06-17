import React from 'react';

interface FormLiquidosProps {
  liquidosDatos: {
    tipo_liquido: string;
    aspecto: string;
    recuento_celular: number;
    promedio: string;
    glucosa: number;
    proteinas: number;
    ldh: number;
    observaciones: string;
  };
  setLiquidosDatos: (datos: any) => void;
}

export default function FormLiquidos({ liquidosDatos, setLiquidosDatos }: FormLiquidosProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLiquidosDatos({
      ...liquidosDatos,
      [name]: e.target.type === 'number' ? parseFloat(value) || 0 : value
    });
  };

  return (
    <div style={{ padding: '15px', backgroundColor: '#16221f', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* SECCIÓN 1: IDENTIFICACIÓN Y ASPECTO FISICO */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🧪 EXAMEN FÍSICO DEL ESPÉCIMEN</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#a0b2ae', marginBottom: '4px' }}>Origen / Tipo de Líquido:</label>
            <select name="tipo_liquido" value={liquidosDatos.tipo_liquido || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
              <option value="">-- Seleccionar Origen --</option>
              <option value="LCR">Líquido Cefalorraquídeo (LCR)</option>
              <option value="Pleural">Líquido Pleural</option>
              <option value="Ascitico">Líquido Ascítico</option>
              <option value="Sinovial">Líquido Sinovial</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#a0b2ae', marginBottom: '4px' }}>Aspecto General:</label>
            <input type="text" name="aspecto" value={liquidosDatos.aspecto || ''} onChange={handleChange} placeholder="Ej: Transparente, Turbio, Hemorrágico" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 2: EXAMEN CITOLÓGICO */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🔬 RECUENTO CITOLÓGICO</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#a0b2ae', marginBottom: '4px' }}>Recuento Celular Total (por mm³):</label>
            <input type="number" name="recuento_celular" value={liquidosDatos.recuento_celular || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#a0b2ae', marginBottom: '4px' }}>Predominio Leucocitario:</label>
            <input type="text" name="promedio" value={liquidosDatos.promedio || ''} onChange={handleChange} placeholder="Ej: PMN (Polimorfonucleares), MN" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 3: BIOQUÍMICA DE LÍQUIDO */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🧪 BIOQUÍMICA ANALÍTICA</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Glucosa (mg/dL):</label>
            <input type="number" name="glucosa" value={liquidosDatos.glucosa || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Proteínas Totales (g/dL):</label>
            <input type="number" name="proteinas" value={liquidosDatos.proteinas || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>LDh (U/L):</label>
            <input type="number" name="ldh" value={liquidosDatos.ldh || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 4: OBSERVACIONES MICROBIOLÓGICAS */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', color: '#00bfa5', fontWeight: 'bold', marginBottom: '4px' }}>Observaciones / Tinta China / Gram / Bloque Celular:</label>
        <textarea name="observaciones" value={liquidosDatos.observaciones || ''} onChange={handleChange} placeholder="Reporte de sedimentos o coloraciones especiales..." style={{ width: '100%', padding: '10px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', height: '60px', resize: 'none' }} />
      </div>

    </div>
  );
}