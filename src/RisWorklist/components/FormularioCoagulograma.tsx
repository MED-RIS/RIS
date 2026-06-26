import React from 'react';

interface CoagulogramaProps {
  hematoDatos: any;
  setHematoDatos: (datos: any) => void;
}

export default function FormCoagulograma({ hematoDatos, setHematoDatos }: CoagulogramaProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHematoDatos({
      ...hematoDatos,
      [name]: e.target.type === 'number' ? (parseFloat(value) || 0) : value
    });
  };

  const datos = hematoDatos || {};

  return (
    <div style={{ padding: '15px', backgroundColor: '#16221f', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* SECCIÓN PRINCIPAL DE VALORES */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🩸 COAGULOGRAMA COMPLETO</legend>
        
        {/* TIEMPO DE SANGRÍA */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Tiempo de Sangría (Minutos):</label>
            <input type="number" name="t_sangria_min" value={datos.t_sangria_min || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Tiempo de Sangría (Segundos):</label>
            <input type="number" name="t_sangria_seg" value={datos.t_sangria_seg || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>

        {/* TIEMPO DE COAGULACIÓN */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Tiempo de Coagulación (Minutos):</label>
            <input type="number" name="t_coagulacion_min" value={datos.t_coagulacion_min || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Tiempo de Coagulación (Segundos):</label>
            <input type="number" name="t_coagulacion_seg" value={datos.t_coagulacion_seg || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>

        {/* PROTROMBINA, ACTIVIDAD E INR */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Tiempo de Protrombina:</label>
            <input type="number" name="t_protrombina" value={datos.t_protrombina || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Actividad (%):</label>
            <input type="text" name="actividad" value={datos.actividad || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} placeholder="e.g. 85%" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>INR:</label>
            <input type="text" name="inr" value={datos.inr || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} placeholder="e.g. 1.1" />
          </div>
        </div>
      </fieldset>

      {/* NUEVA SECCIÓN: COMENTARIOS EXTRAS Y OBSERVACIONES */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>📝 NOTAS Y COMENTARIOS DE LABORATORIO</legend>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Comentario Serie Roja:</label>
            <textarea name="comentario_serie_roja" value={datos.comentario_serie_roja || ''} onChange={handleChange} placeholder="Observaciones de la serie roja..." style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', height: '50px', resize: 'none', fontFamily: 'sans-serif', fontSize: '12px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Comentario Serie Blanca:</label>
            <textarea name="comentario_serie_blanca" value={datos.comentario_serie_blanca || ''} onChange={handleChange} placeholder="Observaciones de la serie blanca..." style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', height: '50px', resize: 'none', fontFamily: 'sans-serif', fontSize: '12px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Comentario Plaquetas:</label>
            <textarea name="comentario_plaquetas" value={datos.comentario_plaquetas || ''} onChange={handleChange} placeholder="Observaciones de plaquetas..." style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', height: '50px', resize: 'none', fontFamily: 'sans-serif', fontSize: '12px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Observaciones Generales:</label>
            <textarea name="observaciones" value={datos.observaciones || ''} onChange={handleChange} placeholder="Notas clínicas o comentarios libres generales..." style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', height: '55px', resize: 'none', fontFamily: 'sans-serif', fontSize: '12px' }} />
          </div>
        </div>
      </fieldset>

    </div>
  );
}