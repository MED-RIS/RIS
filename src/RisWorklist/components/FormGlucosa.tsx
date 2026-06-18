import React from 'react';

interface FormGlucosaProps {
  glucosaFija: any;
  setGlucosaFija: (datos: any) => void;
  medicionesExtra: any[];
  setMedicionesExtra: (datos: any[]) => void;
}

export default function FormGlucosa({ glucosaFija, setGlucosaFija, medicionesExtra, setMedicionesExtra }: FormGlucosaProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGlucosaFija({
      ...glucosaFija,
      [name]: value
    });
  };

  const agregarMedicion = () => {
    const nuevaNum = medicionesExtra.length + 3; // t3, t4...
    setMedicionesExtra([
      ...medicionesExtra,
      { nombre_parametro: `Medición ${nuevaNum}`, numero_medicion: nuevaNum, valor: 0 }
    ]);
  };

  const handleExtraChange = (index: number, valor: string) => {
    const copia = [...medicionesExtra];
    copia[index].valor = parseFloat(valor) || 0;
    setMedicionesExtra(copia);
  };

  return (
    <div style={{ padding: '15px', backgroundColor: '#16221f', borderRadius: '8px' }}>
      
      {/* CORRECCIÓN DE CONTRASTE EN LOS INPUTS FIJOS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div>
          {/* Cambiamos el color a #00bfa5 o #a0b2ae para que resalte en el modo oscuro */}
          <label style={{ display: 'block', fontSize: '12px', color: '#00bfa5', fontWeight: 'bold', marginBottom: '4px' }}>
            Glucosa Basal (mg/dL):
          </label>
          <input 
            type="number" 
            name="basal" 
            value={glucosaFija.basal} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} 
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#00bfa5', fontWeight: 'bold', marginBottom: '4px' }}>
            Hora Basal:
          </label>
          <input 
            type="time" 
            name="hora_basal" 
            value={glucosaFija.hora_basal} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} 
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#00bfa5', fontWeight: 'bold', marginBottom: '4px' }}>
            Medición 1 (1 hora):
          </label>
          <input 
            type="number" 
            name="resultado_glucosa1" 
            value={glucosaFija.resultado_glucosa1} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} 
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#00bfa5', fontWeight: 'bold', marginBottom: '4px' }}>
            Medición 2 (2 horas):
          </label>
          <input 
            type="number" 
            name="resultado_glucosa2" 
            value={glucosaFija.resultado_glucosa2} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} 
          />
        </div>
      </div>

      {/* SECCIÓN DINÁMICA (TOLERANCIA EXTENDIDA) */}
      {medicionesExtra.map((med, idx) => (
        <div key={idx} style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#a0b2ae', marginBottom: '4px' }}>
            {med.nombre_parametro}:
          </label>
          <input 
            type="number" 
            value={med.valor} 
            onChange={(e) => handleExtraChange(idx, e.target.value)} 
            style={{ width: '100%', padding: '8px', backgroundColor: '#0a0f0d', border: '1px solid #2a403a', borderRadius: '4px', color: '#fff' }} 
          />
        </div>
      ))}

      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <button 
          type="button" 
          onClick={agregarMedicion} 
          style={{ padding: '6px 12px', backgroundColor: '#2a403a', color: '#00bfa5', border: '1px solid #00bfa5', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
        >
          + Agregar Medición Extra (Caso Especial t0-t120)
        </button>
      </div>

    </div>
  );
}