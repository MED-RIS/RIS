import { v, resolverFiliacion, cabeceraHTML, renderizarEImprimir } from "./_reporteBase";

// Reporte propio y minimalista de Grupo Sanguíneo (deriva de los datos de Hematología).
// Muestra únicamente el grupo sanguíneo bajo la sección HEMATOLOGÍA, con la cabecera
// institucional compartida (correlativo en caja verde + filiación Cod. Benef. / Edad).
export const imprimirGrupoSanguineoCNS = (p: any) => {
  const d = p.datos || p || {};
  const f = resolverFiliacion(p);

  const grupo = d.grupo_sanguineo ?? d.hematoDatos?.grupo_sanguineo ?? "-";

  const cuerpo = `
    ${cabeceraHTML(f, "QUÍMICAS", "#5b9bd5", "#8bc34a")}

    <div class="main-title">HEMATOLOGÍA</div>

    <div class="gs-cuerpo">
      <span class="gs-lbl">GRUPO SANGUÍNEO:</span>
      <span class="gs-val">${v(grupo)}</span>
    </div>
  `;

  const estilos = `
    .gs-cuerpo { display: flex; align-items: baseline; gap: 40px; margin: 48px 40px 0 40px; min-height: 220px; }
    .gs-lbl { font-size: 22px; font-weight: bold; color: #000; letter-spacing: 0.5px; }
    .gs-val { font-size: 22px; font-weight: bold; color: #000; font-family: monospace; }
  `;

  renderizarEImprimir(`CNS_GrupoSanguineo_${f.pacienteNombre.replace(/ /g, "_")}`, cuerpo, estilos);
};
