import { v, flagRango, resolverFiliacion, cabeceraHTML, renderizarEImprimir } from "./_reporteBase";

export const imprimirQuimicaCNS = (p: any) => {
  const d = p.datos || p || {};
  const q = d.quimicaDatos || p.quimicaDatos || d || {};
  const f = resolverFiliacion(p);

  // Fila de resultado con flag alto/bajo según rango del laboratorio.
  const fila = (label: string, val: any, unidad: string, rango: string) => {
    const flag = flagRango(val, rango);
    const color = flag === "H" ? "#c62828" : flag === "L" ? "#1565c0" : "#000";
    const marca = flag === "H" ? " ↑" : flag === "L" ? " ↓" : "";
    return `
      <tr>
        <td class="lbl">${label}</td>
        <td class="val" style="color:${color}">${v(val)}${marca}</td>
        <td class="uni">${unidad}</td>
        <td class="ref">${rango}</td>
      </tr>`;
  };

  const cuerpo = `
    ${cabeceraHTML(f, "QUÍMICA SANGUÍNEA", "#1565c0", "#90caf9")}
    <div class="main-title">QUÍMICA SANGUÍNEA</div>
    <div class="grid-2">
      <table class="qmc">
        <thead><tr><th>Determinación</th><th>Result.</th><th>Unid.</th><th>Ref.</th></tr></thead>
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
          ${fila("Rel. Alb/Glob", q.rel_alb_glo, "", "")}
        </tbody>
      </table>
      <table class="qmc">
        <thead><tr><th>Determinación</th><th>Result.</th><th>Unid.</th><th>Ref.</th></tr></thead>
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
    <div class="obs-box"><b>Observaciones:</b> ${v(q.observaciones)}</div>
  `;

  const estilos = `
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 8px; }
    .qmc { width: 100%; border-collapse: collapse; }
    .qmc th { background-color: #e3f2fd; border: 1px solid #000; padding: 4px; font-size: 10px; }
    .qmc td { border: 1px solid #999; padding: 3px 6px; font-size: 10.5px; }
    .qmc td.lbl { font-weight: bold; }
    .qmc td.val { text-align: right; font-family: monospace; font-weight: bold; }
    .qmc td.uni { color: #555; font-size: 9.5px; }
    .qmc td.ref { color: #555; font-size: 9.5px; text-align: center; }
  `;

  renderizarEImprimir(`CNS_Quimica_${f.pacienteNombre.replace(/ /g, "_")}`, cuerpo, estilos);
};
