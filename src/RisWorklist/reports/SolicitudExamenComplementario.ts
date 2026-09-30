// Solicitud de Exámenes Complementarios — la orden en papel que Caja/Consulta entrega
// para que el paciente lleve al servicio correspondiente (Laboratorio, Imagenología,
// Banco de Sangre, Electrocardiograma, etc.), imitando el formulario físico de la CNS.
import { v, resolverFiliacion, cabeceraHTML, renderizarEImprimir } from "./_reporteBase";
import { CATEGORIAS_LAB, ParametroLab } from "../laboratorio/catalogoLaboratorio";

interface SolicitudExamenParams {
  paciente: any;              // mismo objeto suelto que usan los demás reportes (resolverFiliacion)
  categoriaId?: string;       // id de CATEGORIAS_LAB (ej. 'quimica'); si no se pasa, usa examenLibre
  examenLibre?: string;       // texto libre del examen solicitado, para servicios sin catálogo
  especialidad?: string;      // ej. "Ginecología"
  diagnosticoPresuntivo?: string;
  datosOrientacion?: string;
  urgente?: boolean;
  sala?: string;
  cama?: string;
  referencia?: string;        // código completo de la orden (accessionNumber), para trazabilidad
}

const LETRAS = "abcdefghijklmnopqrstuvwxyz";

const agruparPorSeccion = (items: ParametroLab[]) => {
  const grupos: Record<string, ParametroLab[]> = {};
  const orden: string[] = [];
  items.forEach((it) => {
    const sec = it.seccion || "General";
    if (!grupos[sec]) {
      grupos[sec] = [];
      orden.push(sec);
    }
    grupos[sec].push(it);
  });
  return orden.map((sec) => ({ seccion: sec, items: grupos[sec] }));
};

export const imprimirSolicitudExamenCNS = (params: SolicitudExamenParams) => {
  const f = resolverFiliacion(params.paciente);
  const categoria = params.categoriaId ? CATEGORIAS_LAB.find((c) => c.id === params.categoriaId) : undefined;

  let letra = 0;
  const checklistHTML = categoria
    ? agruparPorSeccion(categoria.catalogo)
        .map(
          (grupo) => `
        <div class="seccion-titulo">${grupo.seccion}</div>
        <div class="checklist-grid">
          ${grupo.items
            .map((it) => `<div class="check-item"><span class="check-circle">○</span>${LETRAS[letra++ % LETRAS.length]}) ${v(it.label)}</div>`)
            .join("")}
        </div>`
        )
        .join("")
    : `<div class="examen-libre">${v(params.examenLibre) || "&nbsp;"}</div>`;

  const cuerpo = `
    ${cabeceraHTML(f, "SOLICITUD DE EXÁMENES COMPLEMENTARIOS", "#2e7d32", "#a5d6a7")}
    <div class="main-title">SOLICITUD DE EXÁMENES COMPLEMENTARIOS</div>

    <table class="filiacion-table" style="margin-bottom: 10px;">
      <tr>
        <td style="width: 34%; text-align: right; padding-right: 8px; font-weight: bold;">Especialidad:</td>
        <td style="width: 33%;" class="border-dotted">${v(params.especialidad)}</td>
        <td style="width: 20%; text-align: right; padding-right: 8px; font-weight: bold;">Urgente:</td>
        <td style="width: 13%;" class="border-dotted">${params.urgente ? "SÍ" : "NO"}</td>
      </tr>
      ${params.referencia ? `
      <tr>
        <td style="text-align: right; padding-right: 8px; font-weight: bold;">Referencia de orden:</td>
        <td colspan="3" class="border-dotted" style="text-align: left; padding-left: 8px;">${v(params.referencia)}</td>
      </tr>` : ""}
    </table>
    <table class="filiacion-table" style="margin-bottom: 14px;">
      <tr>
        <td style="width: 25%; text-align: right; padding-right: 8px; font-weight: bold;">Sala:</td>
        <td style="width: 25%;" class="border-dotted">${v(params.sala) || "SIN SALA"}</td>
        <td style="width: 25%; text-align: right; padding-right: 8px; font-weight: bold;">Cama:</td>
        <td style="width: 25%;" class="border-dotted">${v(params.cama) || "SIN CAMA"}</td>
      </tr>
    </table>

    <div class="seccion-numero">1) Examen Solicitado</div>
    <p class="sirvase">SÍRVASE REALIZAR:</p>
    ${checklistHTML}

    <div class="seccion-numero">2) Datos de Orientación Diagnóstica</div>
    <div class="linea-completar">Diagnóstico Presuntivo: ${v(params.diagnosticoPresuntivo)}</div>
    <div class="linea-completar">${v(params.datosOrientacion) || "&nbsp;"}</div>

    <div class="seccion-numero">3) Obtención</div>
    <div class="linea-completar">Examinar &nbsp;&nbsp;&nbsp; ○ SÍ &nbsp;&nbsp;&nbsp; ○ NO</div>

    <div class="seccion-numero">4) Tratamientos Efectuados</div>
    <div class="linea-completar">&nbsp;</div>

    <div class="seccion-numero">5) Firma y Aclaración Médico Solicitante</div>
    <div class="linea-firma">&nbsp;</div>
  `;

  const estilos = `
    .seccion-titulo { font-weight: bold; font-size: 10.5px; text-decoration: underline; margin: 8px 0 4px; }
    .checklist-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 12px; margin-bottom: 6px; }
    .check-item { font-size: 10.5px; }
    .check-circle { display: inline-block; width: 14px; }
    .examen-libre { border: 1px dashed #000; min-height: 50px; padding: 8px; font-size: 11px; margin-bottom: 10px; }
    .seccion-numero { font-weight: bold; font-size: 11.5px; margin: 14px 0 4px; }
    .sirvase { font-weight: bold; font-size: 10.5px; margin: 2px 0 6px; }
    .linea-completar { border-bottom: 1px dotted #000; min-height: 18px; font-size: 10.5px; padding-bottom: 2px; margin-bottom: 6px; }
    .linea-firma { border-top: 1px solid #000; width: 260px; margin-top: 30px; text-align: center; font-size: 9.5px; padding-top: 3px; }
  `;

  renderizarEImprimir(`Solicitud_${f.pacienteNombre.replace(/ /g, "_")}`, cuerpo, estilos);
};
