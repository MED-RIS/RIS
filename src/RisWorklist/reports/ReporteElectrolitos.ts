// src/RisWorklist/reports/ReporteElectrolitosProt.ts

import { v, flagRango, resolverFiliacion, cabeceraHTML, renderizarEImprimir } from "./_reporteBase";

// Reporte combinado: Electrolitos séricos + Orina 24 Hrs (proteínas) + Microalbuminuria.
export const imprimirElectrolitosProtCNS = (p: any) => {
  const d = p.datos || p || {};
  const q = d.quimicaDatos || d || {};
  const m = d.microDatos || d || {};
  const o = d.egoDatos || d || {};
  const s = d.serologiaDatos || d || {};
  const f = resolverFiliacion(p);

  // Fila de resultado protegida contra bucles infinitos en rangos asimétricos (<30, etc.)
  const fila = (label: string, val: any, unidad: string, rangoOriginal: string) => {
    let rangoSaneadoParaValidar = rangoOriginal;
    
    if (!rangoOriginal || rangoOriginal.trim() === "") {
      rangoSaneadoParaValidar = "0 - 999999"; 
    } else if (rangoOriginal.includes(">")) {
      const num = rangoOriginal.replace(">", "").trim();
      rangoSaneadoParaValidar = `${num} - 999999`; 
    } else if (rangoOriginal.includes("<")) {
      const num = rangoOriginal.replace("<", "").trim();
      rangoSaneadoParaValidar = `0 - ${num}`;      
    } else if (rangoOriginal.includes("hasta")) {
      const num = rangoOriginal.replace("hasta", "").trim();
      rangoSaneadoParaValidar = `0 - ${num}`;      
    }

    const flag = flagRango(val, rangoSaneadoParaValidar);
    const color = flag === "H" ? "#c62828" : flag === "L" ? "#1565c0" : "#000";
    const marca = flag === "H" ? " ↑" : flag === "L" ? " ↓" : "";
    
    return `
      <tr>
        <td class="lbl">${label}</td>
        <td class="val" style="color:${color}">${v(val)}${marca}</td>
        <td class="uni">${unidad}</td>
        <td class="ref">${rangoOriginal}</td>
      </tr>`;
  };

  // 🧪 LECTURA BILINGÜE DE CLAVES (Catálogo Nuevo vs Histórico)
  const valSodio = q.sodio ?? q.sodio_meql;
  const valPotasio = q.potasio ?? q.potasio_meql;
  const valCloro = q.cloro ?? q.cloro_meql;

  const valVol24h = o.volumen_24h ?? q.volumen_24h;
  const valCrea24h = o.crea_orina_24h ?? o.crea_orina ?? q.crea_orina_24h ?? q.crea_orina;
  const valProt24h = o.prot_24h ?? q.prot_24h;

  const valAlbMicro = m.micro_albumina ?? m.albumina ?? s.micro_albumina ?? s.albumina;
  const valCreaMicro = m.micro_creatinina ?? m.creatinina ?? s.micro_creatinina ?? s.creatinina;
  const valRelAC = m.relacion_ac ?? m.relacion_ac_val ?? s.relacion_ac ?? s.relacion_ac_val;

  const obsElec = q.observaciones_electrolitos ?? q.observaciones;
  const obsO24 = o.obs_orina_24h ?? o.observaciones_24h ?? o.observaciones;
  const obsMicro = m.observaciones_micro ?? m.observaciones ?? s.observaciones;

  const cuerpo = `
    ${cabeceraHTML(f, "ELECTROLITOS / PROTEÍNAS", "#00838f", "#80deea")}
    <div class="main-title">ELECTROLITOS, PROTEÍNAS EN ORINA Y MICROALBUMINURIA</div>

    <div class="sec-title">ELECTROLITOS SÉRICOS</div>
    <table class="tbl">
      <thead><tr><th>Determinación</th><th>Result.</th><th>Unid.</th><th>Ref.</th></tr></thead>
      <tbody>
        ${fila("Sodio (Na⁺)", valSodio, "mmol/L", "135 - 148")}
        ${fila("Potasio (K⁺)", valPotasio, "mmol/L", "3.5 - 5.3")}
        ${fila("Cloro (Cl⁻)", valCloro, "mmol/L", "98 - 107")}
      </tbody>
    </table>

    <div class="sec-title">ORINA DE 24 HORAS</div>
    <table class="tbl">
      <thead><tr><th>Determinación</th><th>Result.</th><th>Unid.</th><th>Ref.</th></tr></thead>
      <tbody>
        ${fila("Volumen 24 Hrs.", valVol24h, "ml/día", "600 - 2000")}
        ${fila("Creatinina en Orina", valCrea24h, "mg/día", "800 - 2000")}
        ${fila("Proteínas en Orina", valProt24h, "mg/día", "28 - 140")}
      </tbody>
    </table>

    <div class="sec-title">MICROALBUMINURIA (MUESTRA AISLADA)</div>
    <table class="tbl">
      <thead><tr><th>Determinación</th><th>Result.</th><th>Unid.</th><th>Ref.</th></tr></thead>
      <tbody>
        ${fila("Albúmina en Orina", valAlbMicro, "mg/L", "< 20")}
        ${fila("Creatinina en Orina", valCreaMicro, "mg/dL", "—")}
        ${fila("Relación Albúmina/Creatinina", valRelAC, "mg/g", "< 30")}
      </tbody>
    </table>

    <div class="obs-box">
      ${obsElec ? `<div><b>Obs. Electrolitos:</b> ${v(obsElec)}</div>` : ''}
      ${obsO24 ? `<div><b>Obs. Orina 24h:</b> ${v(obsO24)}</div>` : ''}
      ${obsMicro ? `<div><b>Obs. Microalbuminuria:</b> ${v(obsMicro)}</div>` : ''}
    </div>
  `;

  const estilos = `
    .sec-title { background-color: #e0f7fa; font-weight: bold; padding: 5px 8px; margin: 14px 0 0 0; border: 1px solid #000; font-size: 11px; color: #000; }
    .tbl { width: 100%; border-collapse: collapse; }
    .tbl th { background-color: #e0f7fa; border: 1px solid #000; padding: 4px; font-size: 10px; color: #000; }
    .tbl td { border: 1px solid #999; padding: 4px 8px; font-size: 11px; color: #000; }
    .tbl td.lbl { font-weight: bold; width: 45%; }
    .tbl td.val { text-align: right; font-family: monospace; font-weight: bold; width: 20%; }
    .tbl td.uni { color: #555; font-size: 10px; width: 17%; }
    .tbl td.ref { color: #555; font-size: 10px; text-align: center; width: 18%; }
    .obs-box { margin-top: 15px; border-top: 1px dashed #000; padding-top: 6px; font-size: 10px; display: flex; flex-direction: column; gap: 3px; }
  `;

  renderizarEImprimir(`CNS_Electrolitos_${f.pacienteNombre.replace(/ /g, "_")}`, cuerpo, estilos);
};