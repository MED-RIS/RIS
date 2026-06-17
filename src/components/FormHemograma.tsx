import React from 'react';

interface FormHemogramaProps {
  hematoDatos: {
    hto: number;
    hb: number;
    globulos_blancos: number;
    seg: number;
    linf: number;
    plaquetas: number;
    grupo_sanguineo: string;
    reticulocitos: number;
    ves1hora: number;
    indice_katz: number;
    t_sangria_min: number;
    t_sangria_seg: number;
    t_coagulacion_min: number;
    t_coagulacion_seg: number;
    t_protrombina: number;
    observaciones: string;
  };
  setHematoDatos: (datos: any) => void;
}

export default function FormHemograma({ hematoDatos, setHematoDatos }: FormHemogramaProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHematoDatos({
      ...hematoDatos,
      [name]: e.target.type === 'number' ? parseFloat(value) || 0 : value
    });
  };

  // Validación en tiempo real exigida por la guía (Suma de la fórmula leucocitaria parcial)
  const sumaLeucocitaria = Number(hematoDatos.seg || 0) + Number(hematoDatos.linf || 0);

  return (
    <div style={{ padding: '15px', backgroundColor: '#16221f', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* SECCIÓN 1: SERIE ROJA */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🔴 SERIE ROJA</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Hematocrito (%):</label>
            <input type="number" name="hto" value={hematoDatos.hto || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Hemoglobina (g/dL):</label>
            <input type="number" name="hb" value={hematoDatos.hb || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>VES 1ra Hora (mm):</label>
            <input type="number" name="ves1hora" value={hematoDatos.ves1hora || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Grupo Sanguíneo y Factor Rh:</label>
            <input type="text" name="grupo_sanguineo" value={hematoDatos.grupo_sanguineo || ''} onChange={handleChange} placeholder="Ej: O Rh +" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Reticulocitos (%):</label>
            <input type="number" name="reticulocitos" value={hematoDatos.reticulocitos || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 2: SERIE BLANCA */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>⚪ SERIE BLANCA (FÓRMULA LEUCOCITARIA)</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Glóbulos Blancos (uL):</label>
            <input type="number" name="globulos_blancos" value={hematoDatos.globulos_blancos || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Segmentados (%):</label>
            <input type="number" name="seg" value={hematoDatos.seg || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Linfocitos (%):</label>
            <input type="number" name="linf" value={hematoDatos.linf || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>

        {/* Alerta de validación leucocitaria transversal de la CNS */}
        <div style={{ marginTop: '10px', fontSize: '11px', color: sumaLeucocitaria > 100 ? '#ff5252' : '#888', fontStyle: 'italic' }}>
          💡 Suma Leucocitaria Relativa (Seg + Linf): <strong>{sumaLeucocitaria}%</strong> {sumaLeucocitaria > 100 && '⚠️ ¡La suma parcial excede el 100%!'}
        </div>
      </fieldset>

      {/* SECCIÓN 3: COAGULOGRAMA */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>⏱️ COAGULOGRAMA</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Recuento de Plaquetas (uL):</label>
            <input type="number" name="plaquetas" value={hematoDatos.plaquetas || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Tiempo de Protrombina (seg):</label>
            <input type="number" name="t_protrombina" value={hematoDatos.t_protrombina || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Tiempo de Sangría (minutos / segundos):</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input type="number" name="t_sangria_min" placeholder="min" value={hematoDatos.t_sangria_min || ''} onChange={handleChange} style={{ width: '50%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
              <input type="number" name="t_sangria_seg" placeholder="seg" value={hematoDatos.t_sangria_seg || ''} onChange={handleChange} style={{ width: '50%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Tiempo de Coagulación (minutos / segundos):</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input type="number" name="t_coagulacion_min" placeholder="min" value={hematoDatos.t_coagulacion_min || ''} onChange={handleChange} style={{ width: '50%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
              <input type="number" name="t_coagulacion_seg" placeholder="seg" value={hematoDatos.t_coagulacion_seg || ''} onChange={handleChange} style={{ width: '50%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
            </div>
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 4: OBSERVACIONES */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', color: '#00bfa5', fontWeight: 'bold', marginBottom: '4px' }}>Observaciones generales de frotis / comentarios:</label>
        <textarea name="observaciones" value={hematoDatos.observaciones || ''} onChange={handleChange} placeholder="Escriba hallazgos particulares..." style={{ width: '100%', padding: '10px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', height: '60px', resize: 'none' }} />
      </div>

    </div>
  );
}