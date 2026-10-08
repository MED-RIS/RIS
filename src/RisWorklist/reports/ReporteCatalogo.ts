import { v, flagRango, resolverFiliacion, cabeceraHTML, renderizarEImprimir } from "./_reporteBase";
import { categoriaLab, ParametroLab } from "../laboratorio/catalogoLaboratorio";

const lleno = (val: any) => val !== undefined && val !== null && String(val).trim() !== "";

// Lee un parámetro desde la misma bolsa donde lo guarda el EditorLaboratorio.
const leerParametro = (datos: any, p: ParametroLab, mode: "flat" | "nested", bag?: string) => {
  const m = p.modeOverride || mode;
  const b = p.bagOverride || bag;
  return m === "flat" ? datos?.[p.key] : datos?.[b as string]?.[p.key];
};

const filaHTML = (p: ParametroLab, val: any) => {
  const flag = p.min !== undefined || p.max !== undefined ? flagRango(val, p.rango || "") : "";
  const color = flag === "H" ? "#c62828" : flag === "L" ? "#1565c0" : "#000";
  const marca = flag === "H" ? " ↑" : flag === "L" ? " ↓" : "";
  return `
    <tr>
      <td style="border:1px solid #999;padding:4px 8px;font-weight:bold;">${p.label}</td>
      <td style="border:1px solid #999;padding:4px 8px;text-align:right;font-family:monospace;font-weight:bold;color:${color};">${v(val)}${marca}</td>
      <td style="border:1px solid #999;padding:4px 8px;color:#555;font-size:9.5px;">${p.unidad || ""}</td>
      <td style="border:1px solid #999;padding:4px 8px;color:#555;font-size:9.5px;text-align:center;">${p.rango || "—"}</td>
    </tr>`;
};

const tablaHTML = (filas: string, colorCabecera: string) => `
  <table style="width:100%;border-collapse:collapse;margin-top:6px;font-size:10.5px;table-layout:fixed;">
    <colgroup><col style="width:40%"><col style="width:30%"><col style="width:10%"><col style="width:20%"></colgroup>
    <thead><tr style="background:${colorCabecera};">
      <th style="border:1px solid #000;padding:4px;">Examen</th>
      <th style="border:1px solid #000;padding:4px;">Resultado</th>
      <th style="border:1px solid #000;padding:4px;">Unid.</th>
      <th style="border:1px solid #000;padding:4px;">Referencia</th>
    </tr></thead>
    <tbody>${filas}</tbody>
  </table>`;

// Bloque "Exámenes complementarios" para los PDF hechos a mano: imprime solo los
// parámetros llenados de la lista dada. `bolsa` es el objeto donde viven sus claves.
export const examenesComplementariosHTML = (parametros: ParametroLab[], bolsa: any) => {
  const filas = parametros.filter((p) => lleno(bolsa?.[p.key])).map((p) => filaHTML(p, bolsa[p.key])).join("");
  if (!filas) return "";
  return `
    <div style="margin-top:14px;font-weight:bold;font-size:11px;text-decoration:underline;">EXÁMENES COMPLEMENTARIOS</div>
    ${tablaHTML(filas, "#eeeeee")}`;
};

// PDF genérico de una categoría del catálogo, agrupado por sección. Se usa en las
// categorías que no tienen un formato oficial propio (Urología, Bacteriología, Patología).
export const imprimirCategoriaCNS = (p: any, categoriaId: string, color: string, colorClaro: string) => {
  const cat = categoriaLab(categoriaId);
  if (!cat) return;
  const datos = p.datos || p || {};
  const f = resolverFiliacion(p);

  const secciones: string[] = [];
  for (const p2 of cat.catalogo) {
    if (p2.seccion && !secciones.includes(p2.seccion)) secciones.push(p2.seccion);
  }

  const bloques = secciones
    .map((sec) => {
      const filas = cat.catalogo
        .filter((p2) => p2.seccion === sec)
        .map((p2) => ({ p2, val: leerParametro(datos, p2, cat.storage.mode, cat.storage.bag) }))
        .filter(({ val }) => lleno(val))
        .map(({ p2, val }) => filaHTML(p2, val))
        .join("");
      return filas ? `<div style="margin-top:12px;font-weight:bold;font-size:11px;">${sec.toUpperCase()}</div>${tablaHTML(filas, colorClaro)}` : "";
    })
    .join("");

  const bolsa = cat.storage.mode === "flat" ? datos : datos[cat.storage.bag as string] || {};
  const observaciones = bolsa.observaciones ?? datos.observaciones;

  const cuerpo = `
    ${cabeceraHTML(f, cat.label.toUpperCase(), color, colorClaro)}
    <div class="main-title">${cat.label.toUpperCase()}</div>
    ${bloques || '<p style="text-align:center;color:#555;">Sin resultados registrados.</p>'}
    <div class="obs-box"><b>Observaciones:</b> ${v(observaciones)}</div>
  `;

  renderizarEImprimir(`CNS_${cat.id}_${f.pacienteNombre.replace(/ /g, "_")}`, cuerpo);
};
