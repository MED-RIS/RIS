import React from 'react';

interface SerologiaProps {
  serologiaDatos: any;
  setSerologiaDatos: (datos: any) => void;
}

export default function FormSerologia({ serologiaDatos, setSerologiaDatos }: SerologiaProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSerologiaDatos({
      ...serologiaDatos,
      [name]: value
    });
  };

  const datos = serologiaDatos || {};

  return (
    <div style={{ padding: '15px', backgroundColor: '#16221f', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🔬 SEROLOGÍA E INMUNOLOGÍA</legend>
        
        {/* FILA 1: PCR, FR, ASTO */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>PCR (Proteína C Reactiva):</label>
            <input type="text" name="pcr" value={datos.pcr || ''} onChange={handleChange} placeholder="e.g. Negativo / Valor" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>FR (Factor Reumatoideo):</label>
            <input type="text" name="fr" value={datos.fr || ''} onChange={handleChange} placeholder="e.g. Negativo" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>ASTO / ASO:</label>
            <input type="text" name="asto" value={datos.asto || ''} onChange={handleChange} placeholder="e.g. <200 UI/mL" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>

        {/* FILA 2: HIV, TEST EMBARAZO, RPR */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>HIV (VIH 1/2):</label>
            <input type="text" name="hiv" value={datos.hiv || ''} onChange={handleChange} placeholder="e.g. No Reactivo" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>TEST EMBARAZO (hCG):</label>
            <input type="text" name="test_embarazo" value={datos.test_embarazo || ''} onChange={handleChange} placeholder="e.g. Negativo / Positivo" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>RPR (Sífilis):</label>
            <input type="text" name="rpr" value={datos.rpr || ''} onChange={handleChange} placeholder="e.g. No Reactivo" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>

        {/* FILA 3: PSA, H. PYLORI, HEPATITIS B */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>PSA PRUEBA RÁPIDA:</label>
            <input type="text" name="psa_prueba_rapida" value={datos.psa_prueba_rapida || ''} onChange={handleChange} placeholder="e.g. Normal / Negativo" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>H. PYLORI EN SUERO:</label>
            <input type="text" name="h_pylori_suero" value={datos.h_pylori_suero || ''} onChange={handleChange} placeholder="e.g. No Reactivo" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>HEPATITIS B (HBsAg):</label>
            <input type="text" name="hepatitis_b" value={datos.hepatitis_b || ''} onChange={handleChange} placeholder="e.g. No Reactivo" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* OBSERVACIONES GENERALES */}
      <div>
        <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Observaciones de Serología:</label>
        <textarea name="observaciones" value={datos.observaciones || ''} onChange={handleChange} placeholder="Notas clínicas o comentarios adicionales del área de serología..." style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', height: '50px', resize: 'none', fontFamily: 'sans-serif', fontSize: '12px' }} />
      </div>

    </div>
  );
}