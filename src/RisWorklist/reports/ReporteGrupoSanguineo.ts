// src/RisWorklist/reports/ReporteGrupoSanguineo.ts

import { v, resolverFiliacion, cabeceraHTML, renderizarEImprimir } from "./_reporteBase";

// Reporte propio y minimalista de Grupo Sanguíneo y Factor Rh.
// Muestra únicamente el grupo sanguíneo bajo la sección HEMATOLOGÍA / INMUNOHEMATOLOGÍA,
// con la cabecera institucional compartida de la CNS.
export const imprimirGrupoSanguineoCNS = (p: any) => {
  const d = p.datos || p || {};
  const f = resolverFiliacion(p);

  // 🩸 Lectura de Grupo Sanguíneo y Factor Rh desde la bolsa de datos
  const grupo = d.grupo_sanguineo ?? d.grupo_sanguineo_factor_rh ?? d.hematoDatos?.grupo_sanguineo ?? "-";

  const cuerpo = `
    ${cabeceraHTML(f, "GRUPO SANGUÍNEO", "#00a8e8", "#92d050")}

    <div class="main-title">HEMATOLOGÍA - INMUNOHEMATOLOGÍA</div>

    <div class="gs-cuerpo">
      <span class="gs-lbl">GRUPO SANGUÍNEO Y FACTOR Rh:</span>
      <span class="gs-val">${v(grupo)}</span>
    </div>
  `;

  const estilos = `
    .main-title { text-align: center; font-size: 16px; font-weight: bold; margin: 30px 0 20px 0; text-decoration: underline; letter-spacing: 1.5px; }
    .gs-cuerpo { display: flex; align-items: center; justify-content: center; gap: 30px; margin: 60px 40px 40px 40px; padding: 30px; border: 2px dashed #000; background: #fafafa; border-radius: 6px; }
    .gs-lbl { font-size: 18px; font-weight: bold; color: #000; letter-spacing: 0.5px; }
    .gs-val { font-size: 24px; font-weight: bold; color: #000; font-family: monospace; background: #fff; padding: 6px 18px; border: 1px solid #000; border-radius: 4px; }
  `;

  renderizarEImprimir(`CNS_GrupoSanguineo_${f.pacienteNombre.replace(/ /g, "_")}`, cuerpo, estilos);
};