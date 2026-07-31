// src/RisWorklist/reports/ReporteQuimica.ts

import { v, flagRango, resolverFiliacion, cabeceraHTML, renderizarEImprimir } from "./_reporteBase";

export const imprimirQuimicaCNS = (p: any) => {
  const d = p.datos || p || {};
  const q = d.quimicaDatos || p.quimicaDatos || d || {};
  const f = resolverFiliacion(p);

  // Fila de resultado protegida contra bucles infinitos en rangos asimétricos
  const fila = (label: string, val: any, unidad: string, rangoOriginal: string) => {
    // 🌟 PROTECCIÓN CRÍTICA: Convertimos rangos de un solo extremo en rangos numéricos seguros
    let rangoSaneadoParaValidar = rangoOriginal;
    
    if (!rangoOriginal || rangoOriginal.trim() === "") {
      rangoSaneadoParaValidar = "0 - 999999"; // Para campos sin rango como Globulinas
    } else if (rangoOriginal.includes(">")) {
      const num = rangoOriginal.replace(">", "").trim();
      rangoSaneadoParaValidar = `${num} - 999999`; // Convierte ">55" en "55 - 999999"
    } else if (rangoOriginal.includes("<")) {
      const num = rangoOriginal.replace("<", "").trim();
      rangoSaneadoParaValidar = `0 - ${num}`;      // Convierte "<150" en "0 - 150"
    } else if (rangoOriginal.includes("hasta")) {
      const num = rangoOriginal.replace("hasta", "").trim();
      rangoSaneadoParaValidar = `0 - ${num}`;      // Convierte "hasta 0.3" en "0 - 0.3"
    }

    // Ejecuta flagRango de forma segura
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

  const cuerpo = `
    ${cabeceraHTML(f, "QUÍMICA SANGUÍNEA", "#1565c0", "#90caf9")}
    <div class="main-title">QUÍMICA SANGUÍNEA</div>
    
    <div class="grid-2">
      <!-- 🧪 TABLA 1: GLUCÉMICO, RENAL Y PROTEÍNAS -->
      <table class="qmc">
        <thead>
          <tr><th>Determinación</th><th>Result.</th><th>Unid.</th><th>Ref.</th></tr>
        </thead>
        <tbody>
          ${fila("Glicemia", q.gli, "mg/dl", "70 - 110")}
          ${fila("Hb Glicosilada", q.hba_1c, "%", "4 - 6")}
          ${fila("NUS", q.nus, "mg/dl", "7 - 21")}
          ${fila("Urea", q.urea, "mg/dl", "15 - 45")}
          ${fila("Creatinina", q.crea, "mg/dl", "0.4 - 1.4")}
          ${fila("Ácido Úrico", q.acido_urico, "mg/dl", "2.4 - 7.0")}
          ${fila("Proteínas Totales", q.prot, "g/dl", "6.4 - 8.3")}
          ${fila("Albúmina", q.alb, "g/dl", "3.5 - 5.0")}
          ${fila("Globulinas", q.globulinas, "g/dl", "")}
          ${fila("Rel. Alb/Glob", q.rel_alb_glo, "", "1.1 - 2.5")}
        </tbody>
      </table>

      <!-- 🔬 TABLA 2: PERFIL LIPÍDICO, ENZIMAS Y BILIRRUBINAS -->
      <table class="qmc">
        <thead>
          <tr><th>Determinación</th><th>Result.</th><th>Unid.</th><th>Ref.</th></tr>
        </thead>
        <tbody>
          ${fila("Colesterol Total", q.col, "mg/dl", "120 - 190")}
          ${fila("Triglicéridos", q.tri, "mg/dl", "60 - 150")}
          ${fila("HDL", q.hdl, "mg/dl", ">55")}
          ${fila("LDL", q.ldl, "mg/dl", "<150")}
          ${fila("VLDL", q.vldl, "mg/dl", "")}
          ${fila("T.G.O. (AST)", q.got, "U/l", "10 - 39")}
          ${fila("T.G.P. (ALT)", q.gpt, "U/l", "10 - 37")}
          ${fila("Fosf. Alcalina", q.fal, "U/l", "hasta 115")}
          ${fila("Amilasa", q.amilasa, "U/l", "<125")}
          ${fila("Bil. Directa", q.bd, "mg/dl", "hasta 0.3")}
          ${fila("Bil. Indirecta", q.bi, "mg/dl", "hasta 0.7")}
          ${fila("Bil. Total", q.bt, "mg/dl", "hasta 1")}
        </tbody>
      </table>
    </div>

    ${q.observaciones || d.observaciones ? `<div class="obs-box"><b>Observaciones:</b> ${v(q.observaciones ?? d.observaciones)}</div>` : ''}
  `;

  const estilos = `
    .main-title { text-align: center; font-size: 15px; font-weight: bold; margin: 15px 0 10px 0; text-decoration: underline; letter-spacing: 1.2px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 8px; align-items: start; }
    .qmc { width: 100%; border-collapse: collapse; background: #fff; }
    .qmc th { background-color: #e3f2fd; border: 1px solid #000; padding: 4px; font-size: 10px; color: #000; }
    .qmc td { border: 1px solid #999; padding: 3px 6px; font-size: 10.5px; color: #000; }
    .qmc td.lbl { font-weight: bold; width: 42%; }
    .qmc td.val { text-align: right; font-family: monospace; font-weight: bold; width: 22%; }
    .qmc td.uni { color: #555; font-size: 9.5px; width: 16%; }
    .qmc td.ref { color: #555; font-size: 9.5px; text-align: center; width: 20%; }
    .obs-box { margin-top: 15px; font-size: 10px; color: #000; border-top: 1px dashed #000; padding-top: 6px; }
  `;

  renderizarEImprimir(`CNS_Quimica_${f.pacienteNombre.replace(/ /g, "_")}`, cuerpo, estilos);
};