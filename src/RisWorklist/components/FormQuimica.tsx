import React from 'react';

interface FormQuimicaProps {
  quimicaDatos: {
    glucemia_mgdl: number;
    Hb_glicosilada_pct: number;
    urea_mgdl: number;
    creatinina_mgdl: number;
    acido_urico_mgdl: number;
    colesterol_mgdl: number;
    trigliceridos_mgdl: number;
    HDL_mgdl: number;
    sodio_meql: number;
    potasio_meql: number;
    cloro_meql: number;
    observaciones: string;
  };
  setQuimicaDatos: (datos: any) => void;
}

export default function FormQuimica({ quimicaDatos, setQuimicaDatos }: FormQuimicaProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuimicaDatos({
      ...quimicaDatos,
      [name]: e.target.type === 'number' ? parseFloat(value) || 0 : value
    });
  };

  return (
    <div style={{ padding: '15px', backgroundColor: '#16221f', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* SECCIÓN 1: METABÓLICA / RENAL */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🧪 QUÍMICA SANGUÍNEA Y FUNCIÓN RENAL</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Glucemia (70-110 mg/dL):</label>
            <input type="number" name="glucemia_mgdl" value={quimicaDatos.glucemia_mgdl || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Urea (15-45 mg/dL):</label>
            <input type="number" name="urea_mgdl" value={quimicaDatos.urea_mgdl || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Creatinina (0.4-1.4 mg/dL):</label>
            <input type="number" name="creatinina_mgdl" value={quimicaDatos.creatinina_mgdl || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Hb Glicosilada (4-6 %):</label>
            <input type="number" name="Hb_glicosilada_pct" value={quimicaDatos.Hb_glicosilada_pct || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Ácido Úrico (2.4-7.0 mg/dL):</label>
            <input type="number" name="acido_urico_mgdl" value={quimicaDatos.acido_urico_mgdl || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 2: PERFIL LIPÍDICO */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🥑 PERFIL LIPÍDICO</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Colesterol Total (120-190):</label>
            <input type="number" name="colesterol_mgdl" value={quimicaDatos.colesterol_mgdl || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Triglicéridos (60-150 mg/dL):</label>
            <input type="number" name="trigliceridos_mgdl" value={quimicaDatos.trigliceridos_mgdl || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>HDL Colesterol (&gt;55 mg/dL):</label>
            <input type="number" name="HDL_mgdl" value={quimicaDatos.HDL_mgdl || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 3: ELECTROLITOS */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>⚡ ELECTROLITOS SÉRICOS</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Sodio (Na⁺):</label>
            <input type="number" name="sodio_meql" value={quimicaDatos.sodio_meql || ''} onChange={handleChange} placeholder="mEq/L" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Potasio (K⁺):</label>
            <input type="number" name="potasio_meql" value={quimicaDatos.potasio_meql || ''} onChange={handleChange} placeholder="mEq/L" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Cloro (Cl⁻):</label>
            <input type="number" name="cloro_meql" value={quimicaDatos.cloro_meql || ''} onChange={handleChange} placeholder="mEq/L" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* OBSERVACIONES GENERALES */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', color: '#00bfa5', fontWeight: 'bold', marginBottom: '4px' }}>Observaciones / Suero Lipémico / Notas clínicas:</label>
        <textarea name="observaciones" value={quimicaDatos.observaciones || ''} onChange={handleChange} placeholder="Comentarios libres del laboratorista..." style={{ width: '100%', padding: '10px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', height: '60px', resize: 'none' }} />
      </div>

    </div>
  );
}