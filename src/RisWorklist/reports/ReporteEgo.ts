// src/RisWorklist/reports/ReporteEgo.ts

export const imprimirEgoCNS = (p: any) => {
  const d = p.datos || p || {};
  // Los campos del EGO viven en la bolsa anidada egoDatos; fallback al nivel datos.
  const e = d.egoDatos || p.egoDatos || d || {};

  const v = (val: any) => {
    if (val === undefined || val === null || val === "") return "-";
    return String(val);
  };

  const vFecha = (val: any) => {
    if (val === undefined || val === null || val === "") return "-";
    if (typeof val === "number" || /^\d{5}$/.test(String(val))) {
      const serial = Number(val);
      const base = new Date(Date.UTC(1899, 11, 30));
      base.setUTCDate(base.getUTCDate() + serial);
      return base.toLocaleDateString('es-ES');
    }
    return String(val);
  };

  // ── Filiación ──
  const pacienteNombre = String(
    p.paciente ?? d.paciente ?? p.nombre ?? d.nombre ?? "Paciente"
  ).trim().toUpperCase();

  const codBeneficiario = p.codBeneficiario ?? p.id_paciente ?? d.id_paciente ?? d.codBeneficiario ?? "-";
  const edad = p.edad ?? d.edad ?? p.datos?.edad ?? "-";
  const institucion = p.institucion ?? d.institucion ?? p.policlinico ?? d.policlinico ?? "CNS";
  
  // 🌟 Correlativo secuencial blindado contra marcas de tiempo gigantes
  let numeroSecuencialLimpio = String(p.orden ?? d.orden ?? p.id_consulta ?? d.id_consulta ?? "1");
  if (numeroSecuencialLimpio.length > 6) {
    numeroSecuencialLimpio = "1";
  }

  const aseguradoReal = p.codigoAsegurado ?? p.cod ?? d.codigoAsegurado ?? d.cod ?? "-";
  const medico = p.medico_solicitante ?? d.medico_solicitante ?? "-";
  const centro = p.centro_asistencial ?? d.centro_asistencial ?? "-";
  const servicio = p.servicio ?? d.servicio ?? "";
  const consultorio = p.consultorio ?? d.consultorio ?? "-";
  const fechaSolicitud = vFecha(p.fecha ?? p.fecha_solicitud ?? d.fecha ?? d.fecha_solicitud);

  // 1️⃣ Estructura HTML del documento institucional puro
  const htmlInforme = `
    <div class="header-container">
      <div class="blue-box">
        ${v(institucion).toUpperCase()}<br>
        <div class="sub">EXAMEN GENERAL DE ORINA</div>
      </div>
      <div class="green-box">${v(numeroSecuencialLimpio)}</div>
    </div>

    <table class="filiacion-table" style="margin-bottom: 6px; margin-top: 8px;">
      <tr>
        <td style="width: 42%; text-align: right; padding-right: 8px; font-weight: bold;">Nº de Asegurado:</td>
        <td style="width: 23%;" class="border-dotted">${v(aseguradoReal)}</td>
        <td style="width: 14%; text-align: right; padding-right: 8px; font-weight: bold;">Cod. Benef.:</td>
        <td style="width: 8%;" class="border-dotted">${v(codBeneficiario)}</td>
        <td style="width: 8%; text-align: right; padding-right: 8px; font-weight: bold;">Edad:</td>
        <td style="width: 5%;" class="border-dotted">${v(edad)}</td>
      </tr>
    </table>

    <table class="filiacion-table">
      <tr>
        <td style="width: 33%;" class="border-dotted">${v(medico).toUpperCase()}</td>
        <td style="width: 33%;" class="border-dotted">${v(centro).toUpperCase()}</td>
        <td style="width: 34%;" class="border-dotted">${pacienteNombre}</td>
      </tr>
      <tr>
        <td><span class="filiacion-label">Médico Solicitante</span></td>
        <td><span class="filiacion-label">Centro Asistencial</span></td>
        <td><span class="filiacion-label">Nombres y Apellidos</span></td>
      </tr>
    </table>

    <table class="filiacion-table">
      <tr>
        <td style="width: 33%;" class="border-dotted">${v(servicio).toUpperCase()}</td>
        <td style="width: 33%;" class="border-dotted">${v(consultorio).toUpperCase()}</td>
        <td style="width: 34%;" class="border-dotted">${v(fechaSolicitud)}</td>
      </tr>
      <tr>
        <td><span class="filiacion-label">Policlínico o Servicio</span></td>
        <td><span class="filiacion-label">Consultorio</span></td>
        <td><span class="filiacion-label">Fecha de Solicitud</span></td>
      </tr>
    </table>

    <div class="main-title">EXAMEN GENERAL DE ORINA</div>

    <div class="grid-3">
      <!-- COLUMNA 1: EXAMEN FÍSICO -->
      <div class="col-box">
        <div class="col-title">EXAMEN FÍSICO</div>
        <div class="row-item"><span>Volumen:</span><span>${v(e.volumen)}</span></div>
        <div class="color-row row-item"><span>Color:</span><span>${v(e.color)}</span></div>
        <div class="row-item"><span>Olor:</span><span>${v(e.olor)}</span></div>
        <div class="row-item"><span>Aspecto:</span><span>${v(e.aspecto)}</span></div>
        <div class="row-item"><span>Espuma:</span><span>${v(e.espuma)}</span></div>
        <div class="row-item"><span>Otros:</span><span>${v(e.otros_fisico)}</span></div>
      </div>

      <!-- COLUMNA 2: EXAMEN QUÍMICO -->
      <div class="col-box">
        <div class="col-title">EXAMEN QUÍMICO</div>
        <div class="row-item"><span>Densidad:</span><span>${v(e.densidad)}</span></div>
        <div class="row-item"><span>pH:</span><span>${v(e.ph)}</span></div>
        <div class="row-item"><span>Proteínas:</span><span>${v(e.prot)}</span></div>
        <div class="row-item"><span>Glucosa:</span><span>${v(e.glucosa)}</span></div>
        <div class="row-item"><span>Cetonas:</span><span>${v(e.cetonas)}</span></div>
        <div class="row-item"><span>Bilirrubinas:</span><span>${v(e.bilirrubinas)}</span></div>
        <div class="row-item"><span>Sangre:</span><span>${v(e.sangre)}</span></div>
        <div class="row-item"><span>Urobilinógeno:</span><span>${v(e.urobilinogeno)}</span></div>
        <div class="row-item"><span>Nitritos:</span><span>${v(e.nitritos)}</span></div>
      </div>

      <!-- COLUMNA 3: SEDIMENTO + CILINDROS -->
      <div class="col-box">
        <div class="col-title">SEDIMENTO MICROSCÓPICO</div>
        <div class="row-item"><span>Sedimento:</span><span>${v(e.sedimento)}</span></div>
        <div class="row-item"><span>Cel. Epiteliales:</span><span>${v(e.cel_epiteliales)}</span></div>
        <div class="row-item"><span>Leucocitos:</span><span>${v(e.leucocitos)}</span></div>
        <div class="row-item"><span>Eritrocitos:</span><span>${v(e.eritrocitos)}</span></div>
        <div class="row-item"><span>Piocitos:</span><span>${v(e.piocitos)}</span></div>
        <div class="row-item"><span>Bacterias:</span><span>${v(e.bacterias)}</span></div>
        <div class="row-item"><span>Cel. Renales:</span><span>${v(e.cel_renales)}</span></div>
        <div class="row-item"><span>Fil. Mucoso:</span><span>${v(e.filamento_mucoso)}</span></div>
        <div class="row-item"><span>Cristales:</span><span>${v(e.cristales)}</span></div>
        <div class="col-title" style="border-top: 1px solid #000;">CILINDROS</div>
        <div class="row-item"><span>Hialinos:</span><span>${v(e.cilindros_hialinos)}</span></div>
        <div class="row-item"><span>Granulosos:</span><span>${v(e.cilindros_granuloso)}</span></div>
        <div class="row-item"><span>Hemáticos:</span><span>${v(e.cilindros_hematico)}</span></div>
        <div class="row-item"><span>Céreos:</span><span>${v(e.cilindros_cereo)}</span></div>
        <div class="row-item"><span>Otros:</span><span>${v(e.cilindros_otros)}</span></div>
      </div>
    </div>

    <div class="obs-box">
      <div><b>Observaciones 1:</b> ${v(e.observaciones1)}</div>
      <div><b>Observaciones 2:</b> ${v(e.observaciones2)}</div>
    </div>

    <div class="footer-notes">
      <span><b>Elaborado por:</b> Asist. Dig. RIS-SERVER (CNS)</span>
      <span><b>Fecha de Reporte:</b> ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
      <span><b>Hrs:</b> ${new Date().toLocaleTimeString().slice(0, 5)}</span>
    </div>
  `;

  // 2️⃣ Mapeado CSS combinado con la barra de herramientas flotante
  const estilosCompleto = `
    /* Barra de herramientas superior flotante */
    .no-print-bar {
      display: flex;
      justify-content: center;
      gap: 12px;
      background: #111827;
      padding: 12px;
      border-bottom: 2px solid #009688;
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
    .btn-print { background: #009688; color: white; }
    .btn-print:hover { background: #00796b; }
    .btn-close { background: #ef4444; color: white; }
    .btn-close:hover { background: #dc2626; }

    /* Contenedor del documento */
    .print-area {
      padding: 35px;
      background: #ffffff;
      max-width: 800px;
      margin: 0 auto;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }

    @page { size: letter; margin: 35px; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #000; margin: 0; padding: 0; font-size: 10.5px; line-height: 1.35; }

    .header-container { display: table; width: 100%; border: 2px solid #000; box-sizing: border-box; margin-bottom: 5px; }
    .blue-box { display: table-cell; background-color: #009688; color: #fff; padding: 14px; text-align: center; font-weight: bold; font-size: 14px; vertical-align: middle; }
    .blue-box .sub { font-size: 15px; margin-top: 5px; letter-spacing: 2px; font-weight: 900; }
    .green-box { display: table-cell; background-color: #80cbc4; color: #000; width: 85px; text-align: center; font-size: 34px; font-weight: bold; border-left: 2px solid #000; vertical-align: middle; font-family: monospace; }

    .filiacion-table { width: 100%; border-collapse: collapse; margin-top: 5px; margin-bottom: 10px; table-layout: fixed; }
    .filiacion-table td { padding: 4px 2px; vertical-align: bottom; font-size: 10.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .border-dotted { border-bottom: 1px dotted #000; font-weight: bold; font-size: 11px; font-family: monospace; text-align: center; padding-bottom: 1px; }
    .filiacion-label { font-size: 8.5px; color: #333; display: block; text-align: center; margin-top: 2px; border-top: 1px solid #000; width: 95%; margin-left: auto; margin-right: auto; padding-top: 1px; }

    .main-title { text-align: center; font-size: 14px; font-weight: bold; margin: 14px 0; text-decoration: underline; letter-spacing: 1px; }

    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-top: 6px; }
    .col-box { border: 1px solid #000; background: #fff; }
    .col-title { background-color: #e0f2f1; font-weight: bold; text-align: center; padding: 4px; border-bottom: 1px solid #000; font-size: 10.5px; color: #000; }
    .row-item { display: flex; justify-content: space-between; padding: 3px 8px; border-bottom: 1px dotted #999; min-height: 17px; color: #000; }
    .row-item span:last-child { font-family: monospace; font-weight: bold; text-align: right; }

    .obs-box { margin-top: 16px; border-top: 1px dashed #000; padding-top: 8px; font-size: 10px; line-height: 1.6; color: #000; }
    .footer-notes { margin-top: 30px; display: flex; justify-content: space-between; font-size: 9px; border-top: 1px dashed #000; padding-top: 6px; }

    @media print {
      .no-print-bar { display: none !important; }
      body { background: white; }
      .print-area { padding: 0; margin: 0; max-width: 100%; box-shadow: none; }
    }
  `;

  // 3️⃣ Apertura asíncrona segura en ventana aislada para romper el congelamiento del sistema
  const tituloArchivo = `CNS_EGO_${pacienteNombre.replace(/ /g, "_")}`;
  const win = window.open('', '_blank');

  if (win) {
    win.document.write(`
      <html>
        <head>
          <title>${tituloArchivo}</title>
          <style>${estilosCompleto}</style>
        </head>
        <body style="margin:0; background:#f3f4f6;">
          <div class="no-print-bar">
            <button class="btn-report btn-print" onclick="window.print()">🖨️ Imprimir EGO Oficial</button>
            <button class="btn-report btn-close" onclick="window.close()">❌ Cerrar Vista Previa</button>
          </div>
          <div class="print-area">
            ${htmlInforme}
          </div>
        </body>
      </html>
    `);
    win.document.close();
  }
};