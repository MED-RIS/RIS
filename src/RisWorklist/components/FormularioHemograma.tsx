import React from 'react';

interface HemogramaData {
 // 🩸 Parámetros Clínicos
  hto: string;
  hb: string;
  globulos_rojos: string;
  globulos_blancos: string;
  seg: string;
  linf: string;
  mon: string;
  eosi: string;
  cay: string;
  mielo: string;
  metamie: string;
  baso: string;
  total: string;
  plaquetas: string;
  grupo_sanguineo: string;
  reticulocitos: string;
  ves_1_hora: string;
  ves_2_hora: string;
  indice_katz: string;
  tiempo_protrombina: string;
  actividad_protrombina: string;
  inr: string;
  comentario_roja: string;
  comentario_blanca: string;
  comentario_plaquetas: string;
  codigo_asegurado: string;

}


interface FormHemogramaProps {
  hematoDatos: HemogramaData;
  setHematoDatos: (datos: any) => void;
}

export default function FormFormHemograma({ hematoDatos, setHematoDatos }: FormHemogramaProps) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHematoDatos({
      ...hematoDatos,
      [name]: value
    });
  };

  return (
    <div style={{ padding: '15px', backgroundColor: '#16221f', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      

      {/* SECCIÓN 1: SERIE ROJA Y GLOBULAR (¡Glóbulos Rojos Agregado!) */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🔬 SERIE ROJA Y GLOBULAR</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Glóbulos Rojos (mm³):</label>
            <input type="text" name="globulos_rojos" value={hematoDatos.globulos_rojos || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>HTO (%):</label>
            <input type="text" name="hto" value={hematoDatos.hto || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>HB (g/dL):</label>
            <input type="text" name="hb" value={hematoDatos.hb || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Glóbulos Blancos (mm³):</label>
            <input type="text" name="globulos_blancos" value={hematoDatos.globulos_blancos || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 2: FÓRMULA DIFERENCIAL */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>📊 FÓRMULA DIFERENCIAL</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>SEG (%):</label>
            <input type="text" name="seg" value={hematoDatos.seg || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>LINF. (%):</label>
            <input type="text" name="linf" value={hematoDatos.linf || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>MON. (%):</label>
            <input type="text" name="mon" value={hematoDatos.mon || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>EOSI. (%):</label>
            <input type="text" name="eosi" value={hematoDatos.eosi || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>CAY. (%):</label>
            <input type="text" name="cay" value={hematoDatos.cay || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>MIELO:</label>
            <input type="text" name="mielo" value={hematoDatos.mielo || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>METAMIE:</label>
            <input type="text" name="metamie" value={hematoDatos.metamie || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>BASO. (%):</label>
            <input type="text" name="baso" value={hematoDatos.baso || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 3: CONTEO Y VALORES ADICIONALES */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🩸 RECUENTO Y HEMOSTASIA</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Plaquetas (mm³):</label>
            <input type="text" name="plaquetas" value={hematoDatos.plaquetas || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Grupo Sanguíneo:</label>
            <input type="text" name="grupo_sanguineo" value={hematoDatos.grupo_sanguineo || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Reticulocitos (%):</label>
            <input type="text" name="reticulocitos" value={hematoDatos.reticulocitos || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>T. Protrombina (seg):</label>
            <input type="text" name="tiempo_protrombina" value={hematoDatos.tiempo_protrombina || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Actividad (%):</label>
            <input type="text" name="actividad_protrombina" value={hematoDatos.actividad_protrombina || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>INR:</label>
            <input type="text" name="inr" value={hematoDatos.inr || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 4: VELOCIDAD DE SEDIMENTACIÓN GLOBULAR Y KATZ */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>⏱️ VELOCIDAD DE SEDIMENTACIÓN (VES)</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>VES 1 Hora (mm):</label>
            <input type="text" name="ves_1_hora" value={hematoDatos.ves_1_hora || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>VES 2 Hora (mm):</label>
            <input type="text" name="ves_2_hora" value={hematoDatos.ves_2_hora || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Índice de Katz:</label>
            <input type="text" name="indice_katz" value={hematoDatos.indice_katz || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 5: COMENTARIOS CLÍNICOS OFICIALES */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>📝 COMENTARIOS DE OBSERVACIÓN DE LABORATORIO</legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Comentario Serie Roja:</label>
            <input type="text" name="comentario_roja" value={hematoDatos.comentario_roja || ''} onChange={handleChange} placeholder="Ej. Anisocitosis leve (+)..." style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Comentario Serie Blanca:</label>
            <input type="text" name="comentario_blanca" value={hematoDatos.comentario_blanca || ''} onChange={handleChange} placeholder="Ej. Leucocitos normales con granulaciones..." style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Comentario Plaquetas:</label>
            <input type="text" name="comentario_plaquetas" value={hematoDatos.comentario_plaquetas || ''} onChange={handleChange} placeholder="Ej. Agrupaciones plaquetarias normales..." style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

    </div>
  );
}