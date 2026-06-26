import React from 'react';

interface QuimicaProps {
  quimicaDatos: any;
  setQuimicaDatos: (datos: any) => void;
}

export default function FormQuimica({ quimicaDatos, setQuimicaDatos }: QuimicaProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuimicaDatos({
      ...quimicaDatos,
      [name]: e.target.type === 'number' ? (parseFloat(value) || 0) : value
    });
  };

  const datos = quimicaDatos || {};

  return (
    <div style={{ padding: '15px', backgroundColor: '#16221f', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      {/* SECCIÓN 1: METABOLISMO Y FUNCIÓN RENAL */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🧪 GLUCOSA Y FUNCIÓN RENAL</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>GLI (Glucemia):</label>
            <input type="number" name="gli" value={datos.gli || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>HBA 1C (Hemoglobina Glicocilada):</label>
            <input type="number" step="0.01" name="hba_1c" value={datos.hba_1c || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>CREA (Creatinina):</label>
            <input type="number" step="0.01" name="crea" value={datos.crea || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>UREA:</label>
            <input type="number" name="urea" value={datos.urea || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>NUS (Nitrógeno Ureico Sanguíneo):</label>
            <input type="number" name="nus" value={datos.nus || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>ÁCIDO ÚRICO:</label>
            <input type="number" step="0.01" name="acido_urico" value={datos.acido_urico || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 2: PERFIL LIPÍDICO COMPLETO */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🥑 PERFIL LIPÍDICO</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>COL (Colesterol Total):</label>
            <input type="number" name="col" value={datos.col || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>TRI (Triglicéridos):</label>
            <input type="number" name="tri" value={datos.tri || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>HDL (Colesterol Bueno):</label>
            <input type="number" name="hdl" value={datos.hdl || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>LDL (Colesterol Malo):</label>
            <input type="number" name="ldl" value={datos.ldl || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>VLDL:</label>
            <input type="number" name="vldl" value={datos.vldl || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 3: PERFIL HEPÁTICO Y ENZIMAS */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🧬 FUNCIÓN HEPÁTICA Y ENZIMAS</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>GOT / AST:</label>
            <input type="number" name="got" value={datos.got || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>GPT / ALT:</label>
            <input type="number" name="gpt" value={datos.gpt || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>FAL (Fosf. Alc.):</label>
            <input type="number" name="fal" value={datos.fal || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>AMILASA:</label>
            <input type="number" name="amilasa" value={datos.amilasa || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>

        {/* BILIRRUBINAS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px', borderTop: '1px dashed #2a403a', paddingTop: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>BD (Bilirrubina Directa):</label>
            <input type="number" step="0.01" name="bd" value={datos.bd || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>BI (Bilirrubina Indirecta):</label>
            <input type="number" step="0.01" name="bi" value={datos.bi || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>BT (Bilirrubina Total):</label>
            <input type="number" step="0.01" name="bt" value={datos.bt || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 4: PROTEÍNAS TOTALES */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🥩 PROTEÍNAS</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>PROT (Prot. Totales):</label>
            <input type="number" step="0.1" name="prot" value={datos.prot || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>ALB (Albúmina):</label>
            <input type="number" step="0.1" name="alb" value={datos.alb || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>GLOBULINAS:</label>
            <input type="number" step="0.1" name="globulinas" value={datos.globulinas || ''} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>REL ALB/GLO:</label>
            <input type="text" name="rel_alb_glo" value={datos.rel_alb_glo || ''} onChange={handleChange} placeholder="e.g. 1.5" style={{ width: '100%', padding: '6px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 5: OBSERVACIONES */}
      <div>
        <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Observaciones Generales de Química Sanguínea:</label>
        <textarea name="observaciones" value={datos.observaciones || ''} onChange={handleChange} placeholder="Anotaciones extra de los resultados de química..." style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', height: '50px', resize: 'none', fontFamily: 'sans-serif', fontSize: '12px' }} />
      </div>

    </div>
  );
}