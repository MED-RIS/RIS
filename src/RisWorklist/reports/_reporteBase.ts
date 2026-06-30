// src/RisWorklist/reports/_reporteBase.ts
// Helpers compartidos por los reportes de laboratorio CNS.
// Mantiene un único punto de verdad para filiación, formato y evaluación de rangos.

export const v = (val: any) => {
  if (val === undefined || val === null || val === "") return "-";
  return String(val);
};

// Normaliza coma decimal y parsea. Devuelve NaN si no es numérico.
export const num = (val: any): number => {
  if (val === undefined || val === null || val === "") return NaN;
  return parseFloat(String(val).replace(",", "."));
};

// Formatea fecha: acepta string ISO, Date o serial Excel.
export const vFecha = (val: any) => {
  if (val === undefined || val === null || val === "") return "-";
  if (typeof val === "number" || /^\d{5}$/.test(String(val))) {
    const base = new Date(Date.UTC(1899, 11, 30));
    base.setUTCDate(base.getUTCDate() + Number(val));
    return base.toLocaleDateString("es-ES");
  }
  return String(val);
};

export interface Filiacion {
  pacienteNombre: string;
  codBeneficiario: string;
  edad: string;
  institucion: string;
  numeroOrden: string;
  aseguradoReal: string;
  medico: string;
  centro: string;
  servicio: string;
  consultorio: string;
  fechaSolicitud: string;
}

// Resuelve los datos de filiación con la misma cadena que usan los reportes existentes.
export const resolverFiliacion = (p: any): Filiacion => {
  const d = p.datos || p || {};
  
  // 🌟 Limpieza segura de correlativos largos
  let ordenLimpia = String(p.orden ?? d.orden ?? p.id_consulta ?? d.id_consulta ?? "1");
  if (ordenLimpia.length > 6) {
    ordenLimpia = "1";
  }

  return {
    pacienteNombre: String(p.paciente ?? d.paciente ?? p.nombre ?? d.nombre ?? "Paciente").trim().toUpperCase(),
    codBeneficiario: p.codBeneficiario ?? p.id_paciente ?? d.id_paciente ?? d.codBeneficiario ?? "-",
    edad: p.edad ?? d.edad ?? p.datos?.edad ?? "-",
    institucion: p.institucion ?? d.institucion ?? p.policlinico ?? d.policlinico ?? "CNS",
    numeroOrden: ordenLimpia,
    aseguradoReal: p.codigoAsegurado ?? p.cod ?? d.codigoAsegurado ?? d.cod ?? "-",
    medico: p.medico_solicitante ?? d.medico_solicitante ?? "-",
    centro: p.centro_asistencial ?? d.centro_asistencial ?? "-",
    servicio: p.servicio ?? d.servicio ?? "",
    consultorio: p.consultorio ?? d.consultorio ?? "-",
    fechaSolicitud: vFecha(p.fecha ?? p.fecha_solicitud ?? d.fecha ?? d.fecha_solicitud),
  };
};

// Cabecera institucional + bloque de filiación (HTML). color = acento del header.
export const cabeceraHTML = (f: Filiacion, subtitulo: string, color: string, colorClaro: string) => `
  <div class="header-container">
    <div class="blue-box" style="background-color: ${color};">
      ${v(f.institucion).toUpperCase()}<br>
      <div class="sub">${subtitulo}</div>
    </div>
    <div class="green-box" style="background-color: ${colorClaro};">${v(f.numeroOrden)}</div>
  </div>

  <table class="filiacion-table" style="margin-bottom: 6px; margin-top: 8px;">
    <tr>
      <td style="width: 42%; text-align: right; padding-right: 8px; font-weight: bold;">Nº de Asegurado:</td>
      <td style="width: 23%;" class="border-dotted">${v(f.aseguradoReal)}</td>
      <td style="width: 14%; text-align: right; padding-right: 8px; font-weight: bold;">Cod. Benef.:</td>
      <td style="width: 8%;" class="border-dotted">${v(f.codBeneficiario)}</td>
      <td style="width: 8%; text-align: right; padding-right: 8px; font-weight: bold;">Edad:</td>
      <td style="width: 5%;" class="border-dotted">${v(f.edad)}</td>
    </tr>
  </table>

  <table class="filiacion-table">
    <tr>
      <td style="width: 33%;" class="border-dotted">${v(f.medico).toUpperCase()}</td>
      <td style="width: 33%;" class="border-dotted">${v(f.centro).toUpperCase()}</td>
      <td style="width: 34%;" class="border-dotted">${f.pacienteNombre}</td>
    </tr>
    <tr>
      <td><span class="filiacion-label">Médico Solicitante</span></td>
      <td><span class="filiacion-label">Centro Asistencial</span></td>
      <td><span class="filiacion-label">Nombres y Apellidos</span></td>
    </tr>
  </table>

  <table class="filiacion-table">
    <tr>
      <td style="width: 33%;" class="border-dotted">${v(f.servicio).toUpperCase()}</td>
      <td style="width: 33%;" class="border-dotted">${v(f.consultorio).toUpperCase()}</td>
      <td style="width: 34%;" class="border-dotted">${v(f.fechaSolicitud)}</td>
    </tr>
    <tr>
      <td><span class="filiacion-label">Policlínico o Servicio</span></td>
      <td><span class="filiacion-label">Consultorio</span></td>
      <td><span class="filiacion-label">Fecha de Solicitud</span></td>
    </tr>
  </table>
`;

// Estilos base compartidos con BARRA SUPERIOR ANTI-CONGELAMIENTO integrada
export const estilosBase = `
  @page { size: letter; margin: 40px; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #000; margin: 0; padding: 0; font-size: 11px; line-height: 1.4; }
  
  /* Barra de herramientas superior flotante */
  .no-print-bar {
    display: flex;
    justify-content: center;
    gap: 12px;
    background: #111827;
    padding: 12px;
    border-bottom: 2px solid #00bfa5;
    position: sticky;
    top: 0;
    z-index: 9999;
  }
  .btn-report {
    padding: 8px 16px;
    font-family: Arial, sans-serif;
    font-size: 13px;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-print { background: #00bfa5; color: white; }
  .btn-print:hover { background: #009688; }
  .btn-close { background: #ef4444; color: white; }
  .btn-close:hover { background: #dc2626; }

  /* Papel del reporte */
  .print-area {
    padding: 30px;
    background: #ffffff;
    max-width: 800px;
    margin: 0 auto;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  }

  .header-container { display: table; width: 100%; border: 2px solid #000; box-sizing: border-box; margin-bottom: 5px; }
  .blue-box { display: table-cell; color: #fff; padding: 14px; text-align: center; font-weight: bold; font-size: 14px; vertical-align: middle; }
  .blue-box .sub { font-size: 15px; margin-top: 5px; letter-spacing: 2px; font-weight: 900; }
  .green-box { display: table-cell; color: #000; width: 85px; text-align: center; font-size: 34px; font-weight: bold; border-left: 2px solid #000; vertical-align: middle; font-family: monospace; }
  .filiacion-table { width: 100%; border-collapse: collapse; margin-top: 5px; margin-bottom: 10px; table-layout: fixed; }
  .filiacion-table td { padding: 4px 2px; vertical-align: bottom; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .border-dotted { border-bottom: 1px dotted #000; font-weight: bold; font-size: 12px; font-family: monospace; text-align: center; padding-bottom: 1px; }
  .filiacion-label { font-size: 9px; color: #333; display: block; text-align: center; margin-top: 2px; border-top: 1px solid #000; width: 95%; margin-left: auto; margin-right: auto; padding-top: 1px; }
  .main-title { text-align: center; font-size: 15px; font-weight: bold; margin: 16px 0; text-decoration: underline; letter-spacing: 1.2px; }
  .obs-box { margin-top: 16px; border-top: 1px dashed #000; padding-top: 8px; font-size: 10.5px; line-height: 1.6; color: #000; }
  .footer-notes { margin-top: 35px; border-top: 1px dashed #000; padding-top: 6px; display: flex; justify-content: space-between; font-size: 9px; }

  @media print {
    .no-print-bar { display: none !important; }
    body { background: white; }
    .print-area { padding: 0; margin: 0; max-width: 100%; box-shadow: none; }
  }
`;

export const footerHTML = () => `
  <div class="footer-notes">
    <span><b>Elaborado por:</b> Asist. Dig. RIS-SERVER (CNS)</span>
    <span><b>Fecha de Reporte:</b> ${new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
    <span><b>Hrs:</b> ${new Date().toLocaleTimeString().slice(0, 5)}</span>
  </div>
`;

// 🌟 TOTALMENTE REDISEÑADA PARA INTEGRAR EL FLUJO SEGURO DE COMANDOS DE MANERA MODULAR
export const renderizarEImprimir = (titulo: string, cuerpo: string, estilosExtra = "") => {
  const html = `
    <html>
    <head>
      <meta charset="utf-8">
      <title>${titulo}</title>
      <style>${estilosBase}${estilosExtra}</style>
    </head>
    <body style="margin:0; background:#f3f4f6;">
      <div class="no-print-bar">
        <button class="btn-report btn-print" onclick="window.print()">🖨️ Imprimir Reporte Oficial</button>
        <button class="btn-report btn-close" onclick="window.close()">❌ Cerrar Vista Previa</button>
      </div>
      <div class="print-area">
        ${cuerpo}
        ${footerHTML()}
      </div>
    </body>
    </html>
  `;
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
};

// Evalúa un valor numérico contra un rango de forma segura sin loops
export const flagRango = (valor: any, rango: string): "H" | "L" | "" => {
  const n = num(valor);
  if (isNaN(n) || !rango) return "";
  const r = rango.replace(/,/g, ".").replace(/–|—/g, "-");

  const menor = r.match(/<\s*([\d.]+)/);
  if (menor) return n > parseFloat(menor[1]) ? "H" : "";

  const mayor = r.match(/>\s*([\d.]+)/);
  if (mayor) return n < parseFloat(mayor[1]) ? "L" : "";

  const hasta = r.match(/hasta\s*([\d.]+)/i);
  if (hasta) return n > parseFloat(hasta[1]) ? "H" : "";

  const intervalo = r.match(/([\d.]+)\s*-\s*([\d.]+)/);
  if (intervalo) {
    const min = parseFloat(intervalo[1]);
    const max = parseFloat(intervalo[2]);
    if (n < min) return "L";
    if (n > max) return "H";
  }
  return "";
};