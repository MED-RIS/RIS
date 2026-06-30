import React from 'react';

interface EspermatoProps {
  espermatoDatos: any;
  setEspermatoDatos: (datos: any) => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px', backgroundColor: '#0a0f0d',
  border: '1px solid #2a403a', borderRadius: '4px', color: '#fff',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', color: '#a0b2ae', marginBottom: '4px',
};
const fieldsetStyle: React.CSSProperties = {
  border: '1px solid #2a403a', padding: '15px', borderRadius: '6px', backgroundColor: '#121b18',
};
const legendStyle: React.CSSProperties = {
  color: '#00bfa5', fontWeight: 'bold', fontSize: '13px', padding: '0 8px',
};

export default function FormEspermato({ espermatoDatos, setEspermatoDatos }: EspermatoProps) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEspermatoDatos({ ...espermatoDatos, [name]: value });
  };

  const datos = espermatoDatos || {};
  const field = (name: string, label: string, placeholder = '') => (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type="text" name={name} value={datos[name] || ''} onChange={handleChange} placeholder={placeholder} style={inputStyle} />
    </div>
  );

  return (
    <div style={{ padding: '15px', backgroundColor: '#16221f', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px' }}>

      {/* DATOS DE LA MUESTRA */}
      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>🧫 DATOS DE LA MUESTRA</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          {field('fecha_obtencion', 'Fecha/Hora de Obtención', 'e.g. 07:30')}
          {field('hora_recepcion', 'Hora de Recepción en Lab.', 'e.g. 08:00')}
          {field('dias_abstinencia', 'Días de Abstinencia', 'e.g. 3')}
        </div>
      </fieldset>

      {/* EXAMEN MACROSCÓPICO */}
      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>🔬 EXAMEN MACROSCÓPICO</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
          {field('volumen', 'Volumen (mL)', 'e.g. 2.5')}
          {field('color', 'Color', 'e.g. Blanco opalescente')}
          {field('ph', 'pH', 'e.g. 7.8')}
          {field('viscosidad', 'Viscosidad', 'e.g. Normal')}
          {field('aspecto', 'Aspecto', 'e.g. Homogéneo')}
          {field('licuefaccion', 'Licuefacción', 'e.g. < 60 min')}
          {field('coagulacion', 'Coagulación', 'e.g. Completa')}
          {field('olor', 'Olor', 'e.g. Sui géneris')}
        </div>
      </fieldset>

      {/* EXAMEN MICROSCÓPICO */}
      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>🧪 EXAMEN MICROSCÓPICO</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          {field('concentracion', 'Concentración (mill/mL)', 'e.g. 40')}
          {field('concentracion_total', 'Conc. Total (mill/eyac.)', 'e.g. 100')}
          {field('recuento_total', 'Recuento Total', '')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
          {field('motilidad_progresiva', 'Motilidad Progresiva a+b (%)', 'e.g. 45')}
          {field('motilidad_no_progresiva', 'Motilidad No Progresiva c (%)', 'e.g. 10')}
          {field('inmoviles', 'Inmóviles d (%)', 'e.g. 45')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
          {field('vitalidad', 'Vitalidad (%)', 'e.g. 60')}
          {field('morfologia_normal', 'Morfología Normal (%)', 'e.g. 14')}
          {field('leucocitos', 'Leucocitos (mill/mL)', 'e.g. < 1')}
        </div>
        <div style={{ marginTop: '12px' }}>
          {field('aglutinacion', 'Aglutinación', 'e.g. Ausente')}
        </div>
      </fieldset>

      {/* OBSERVACIONES */}
      <div>
        <label style={labelStyle}>Observaciones / Conclusión:</label>
        <textarea name="observaciones" value={datos.observaciones || ''} onChange={handleChange}
          placeholder="Interpretación según criterios OMS..."
          style={{ ...inputStyle, height: '50px', resize: 'none', fontFamily: 'sans-serif', fontSize: '12px' }} />
      </div>

    </div>
  );
}
