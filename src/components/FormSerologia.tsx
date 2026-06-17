import React from 'react';

interface FormSerologiaProps {
  serologiaDatos: {
    pcr: string;
    factor_reumatoideo: string;
    aso: string;
    chagas: string;
    tifico_o: string;
    tifico_h: string;
    paratifico: string;
    observaciones: string;
  };
  setSerologiaDatos: (datos: any) => void;
}

export default function FormSerologia({ serologiaDatos, setSerologiaDatos }: FormSerologiaProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSerologiaDatos({
      ...serologiaDatos,
      [name]: value
    });
  };

  return (
    <div style={{ padding: '15px', backgroundColor: '#16221f', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* SECCIÓN 1: INMUNOLOGÍA GENERAL */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🧪 INMUNOLOGÍA / MARCADORES DE INFLAMACIÓN</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Proteína C Reactiva (PCR):</label>
            <select name="pcr" value={serologiaDatos.pcr || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
              <option value="Negativo">Negativo</option>
              <option value="Positivo (+)">Positivo (+)</option>
              <option value="Positivo (++)">Positivo (++)</option>
              <option value="Positivo (+++)">Positivo (+++)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Factor Reumatoideo (FR):</label>
            <select name="factor_reumatoideo" value={serologiaDatos.factor_reumatoideo || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
              <option value="Negativo">Negativo</option>
              <option value="Positivo">Positivo</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px' }}>Antiestreptolisina O (ASO):</label>
            <input type="text" name="aso" value={serologiaDatos.aso || ''} onChange={handleChange} placeholder="Ej: < 200 UI/mL o Positivo" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 2: ENFERMEDADES ENDÉMICAS / REACCIONES FEBRILES */}
      <fieldset style={{ border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18' }}>
        <legend style={{ color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px' }}>🔬 SEROLOGÍA INFECCIOSA Y FEBRIL</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#a0b2ae', marginBottom: '4px' }}>Prueba de Chagas (HAI/ELISA):</label>
            <select name="chagas" value={serologiaDatos.chagas || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
              <option value="No Reactivo">No Reactivo</option>
              <option value="Reactivo">Reactivo</option>
              <option value="Indeterminado">Indeterminado</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#a0b2ae', marginBottom: '4px' }}>Antígeno Tífico "O":</label>
            <input type="text" name="tifico_o" value={serologiaDatos.tifico_o || ''} onChange={handleChange} placeholder="Ej: Negativo o Título 1:160" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#a0b2ae', marginBottom: '4px' }}>Antígeno Tífico "H":</label>
            <input type="text" name="tifico_h" value={serologiaDatos.tifico_h || ''} onChange={handleChange} placeholder="Ej: Negativo o Título 1:80" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#a0b2ae', marginBottom: '4px' }}>Paratífico A y B:</label>
            <input type="text" name="paratifico" value={serologiaDatos.paratifico || ''} onChange={handleChange} placeholder="Ej: Negativo" style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} />
          </div>
        </div>
      </fieldset>

      {/* SECCIÓN 3: OBSERVACIONES */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', color: '#00bfa5', fontWeight: 'bold', marginBottom: '4px' }}>Observaciones / Diluciones Adicionales:</label>
        <textarea name="observaciones" value={serologiaDatos.observaciones || ''} onChange={handleChange} placeholder="Notas complementarias sobre la titulación serológica..." style={{ width: '100%', padding: '10px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff', height: '60px', resize: 'none' }} />
      </div>

    </div>
  );
}