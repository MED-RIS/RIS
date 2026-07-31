// src/RisWorklist/reports/ReporteCoagulograma.ts

export const imprimirCoagulogramaCNS = (p: any) => {
  const d = p.datos || p || {};

  const v = (val: any) => {
    if (val === undefined || val === null || String(val).trim() === "") return "-";
    return String(val);
  };

  const vFecha = (val: any) => {
    if (val === undefined || val === null || String(val).trim() === "") return "-";
    if (typeof val === "number" || /^\d{5}$/.test(String(val))) {
      const serial = Number(val);
      const base = new Date(Date.UTC(1899, 11, 30));
      base.setUTCDate(base.getUTCDate() + serial);
      return base.toLocaleDateString('es-ES');
    }
    return String(val);
  };

  const pacienteNombre = String(
    p.paciente ?? d.paciente ?? p.nombre ?? d.nombre ?? "Paciente"
  ).trim().toUpperCase();

  const codBeneficiario = p.codBeneficiario ?? p.id_paciente ?? p.pacienteData?.id_paciente ?? d.id_paciente ?? d.codBeneficiario ?? "-";
  const edad = p.edad ?? d.edad ?? p.pacienteData?.edad ?? p.datos?.edad ?? "-";
  const institucion = p.institucion ?? d.institucion ?? p.policlinico ?? d.policlinico ?? "CNS";
  
  // 🌟 Correlativo secuencial seguro contra marcas de tiempo
  let numeroSecuencialLimpio = String(p.orden ?? d.orden ?? p.id_consulta ?? d.id_consulta ?? "1");
  if (numeroSecuencialLimpio.length > 6) {
    numeroSecuencialLimpio = "1";
  }

  const aseguradoReal = p.codigoAsegurado ?? p.cod ?? d.codigoAsegurado ?? d.cod ?? "-";
  const medico = p.medico_solicitante ?? p.medicoSolicitante ?? d.medico_solicitante ?? d.medicoSolicitante ?? "-";
  const centro = p.centro_asistencial ?? p.centroAsistencial ?? d.centro_asistencial ?? d.centroAsistencial ?? "-";
  const servicio = p.servicio ?? d.servicio ?? "LABORATORIO";
  const consultorio = p.consultorio ?? d.consultorio ?? "-";
  const fechaSolicitud = vFecha(p.fecha ?? p.fecha_solicitud ?? d.fecha ?? d.fecha_solicitud);

  // 🩸 LECTURA DE VALORES DE HEMOSTASIA
  const tProtrombina = d.tiempo_protrombina ?? d.t_protrombina ?? d.hematoDatos?.tiempo_protrombina ?? d.hematoDatos?.t_protrombina;
  const actividad = d.actividad_protrombina ?? d.actividad ?? d.hematoDatos?.actividad_protrombina ?? d.hematoDatos?.actividad;
  const inr = d.inr ?? d.hematoDatos?.inr;

  const tCoagMin = d.t_coagulacion_min ?? d.tiempo_coagulacion_min ?? d.hematoDatos?.t_coagulacion_min ?? d.hematoDatos?.tiempo_coagulacion_min;
  const tCoagSeg = d.t_coagulacion_seg ?? d.tiempo_coagulacion_seg ?? d.hematoDatos?.t_coagulacion_seg ?? d.hematoDatos?.tiempo_coagulacion_seg;
  const tSangMin = d.t_sangria_min ?? d.tiempo_sangria_min ?? d.hematoDatos?.t_sangria_min ?? d.hematoDatos?.tiempo_sangria_min;
  const tSangSeg = d.t_sangria_seg ?? d.tiempo_sangria_seg ?? d.hematoDatos?.t_sangria_seg ?? d.hematoDatos?.tiempo_sangria_seg;

  // Formateador de min/seg para evitar guiones dobles
  const formatearTiempo = (minVal: any, segVal: any) => {
    const minTxt = v(minVal);
    const segTxt = v(segVal);
    if (minTxt === "-" && segTxt === "-") return "-";
    let res = "";
    if (minTxt !== "-") res += `${minTxt} min. `;
    if (segTxt !== "-") res += `${segTxt} seg.`;
    return res.trim();
  };

  // Agrupación de observaciones y comentarios
  const obsGen = d.observaciones ?? d.obs ?? "-";
  const comRoja = d.comentario_roja;
  const comBlanca = d.comentario_blanca;
  const comPlaquetas = d.comentario_plaquetas;

  // 1️⃣ Estructura HTML pura del reporte oficial de la CNS
  const htmlInforme = `
    <div class="header-container">
      <div class="blue-box">
        ${v(institucion).toUpperCase()}<br>
        <div class="sub">COAGULOGRAMA</div>
      </div>
      <div class="green-box">${v(numeroSecuencialLimpio)}</div>
    </div>

    <div class="center-order">${v(numeroSecuencialLimpio)}</div>

    <table class="filiacion-table" style="margin-bottom: 8px;">
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

    <div class="main-title">COAGULOGRAMA</div>

    <table class="results-table">
      <tr>
        <td class="label">Tiempo de Protrombina:</td>
        <td class="val">${v(tProtrombina)}</td>
        <td class="unit">seg.</td>
      </tr>
      <tr>
        <td class="label">Actividad:</td>
        <td class="val">${v(actividad)}</td>
        <td class="unit">%</td>
      </tr>
      <tr>
        <td class="label">INR:</td>
        <td class="val">${v(inr)}</td>
        <td class="unit"></td>
      </tr>
      <tr>
        <td class="label">Tiempo de Coagulación:</td>
        <td class="val">${formatearTiempo(tCoagMin, tCoagSeg)}</td>
        <td class="unit"></td>
      </tr>
      <tr>
        <td class="label">Tiempo de Sangría:</td>
        <td class="val">${formatearTiempo(tSangMin, tSangSeg)}</td>
        <td class="unit"></td>
      </tr>
    </table>

    <div class="obs-box">
      <div><b>Observaciones:</b> ${v(obsGen)}</div>
      ${comRoja ? `<div><b>Comentario Serie Roja:</b> ${v(comRoja)}</div>` : ''}
      ${comBlanca ? `<div><b>Comentario Serie Blanca:</b> ${v(comBlanca)}</div>` : ''}
      ${comPlaquetas ? `<div><b>Comentario Plaquetas:</b> ${v(comPlaquetas)}</div>` : ''}
    </div>

    <div class="footer-notes">
      <span><b>Elaborado por:</b> Asist. Dig. RIS-SERVER (CNS)</span>
      <span><b>Fecha de Reporte:</b> ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
      <span><b>Hrs:</b> ${new Date().toLocaleTimeString().slice(0, 5)}</span>
    </div>
  `;

  // 2️⃣ Estilos CSS unificados con la barra superior interactiva
  const estilosCompleto = `
    .no-print-bar {
      display: flex;
      justify-content: center;
      gap: 12px;
      background: #111827;
      padding: 12px;
      border-bottom: 2px solid #7e57c2;
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
    .btn-print { background: #7e57c2; color: white; }
    .btn-print:hover { background: #673ab7; }
    .btn-close { background: #ef4444; color: white; }
    .btn-close:hover { background: #dc2626; }

    .print-area {
      padding: 40px;
      background: #ffffff;
      max-width: 800px;
      margin: 0 auto;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }

    @page { size: letter; margin: 40px; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #000; margin: 0; padding: 0; font-size: 11px; line-height: 1.4; }

    .header-container { display: table; width: 100%; border: 2px solid #000; box-sizing: border-box; margin-bottom: 5px; }
    .blue-box { display: table-cell; background-color: #7e57c2; color: #fff; padding: 15px; text-align: center; font-weight: bold; font-size: 14px; vertical-align: middle; }
    .blue-box .sub { font-size: 16px; margin-top: 5px; letter-spacing: 2px; font-weight: 900; }
    .green-box { display: table-cell; background-color: #b39ddb; color: #000; width: 90px; text-align: center; font-size: 38px; font-weight: bold; border-left: 2px solid #000; vertical-align: middle; font-family: monospace; }

    .center-order { text-align: center; font-size: 22px; font-weight: bold; margin: 10px 0; font-family: monospace; }

    .filiacion-table { width: 100%; border-collapse: collapse; margin-top: 5px; margin-bottom: 15px; table-layout: fixed; }
    .filiacion-table td { padding: 5px 2px; vertical-align: bottom; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .border-dotted { border-bottom: 1px dotted #000; font-weight: bold; font-size: 12px; font-family: monospace; text-align: center; padding-bottom: 1px; }
    .filiacion-label { font-size: 9px; color: #333; display: block; text-align: center; margin-top: 2px; border-top: 1px solid #000; width: 95%; margin-left: auto; margin-right: auto; padding-top: 1px; }

    .main-title { text-align: center; font-size: 15px; font-weight: bold; margin: 35px 0 25px 0; text-decoration: underline; letter-spacing: 1.5px; }

    .results-table { width: 80%; margin: 0 auto; border-collapse: collapse; }
    .results-table td { padding: 10px 14px; border-bottom: 1px dotted #000; font-size: 13px; color: #000; }
    .results-table td.label { font-weight: bold; width: 55%; }
    .results-table td.val { text-align: right; font-family: monospace; font-weight: bold; font-size: 14px; }
    .results-table td.unit { width: 18%; text-align: left; color: #333; font-size: 11px; }

    .obs-box { margin: 30px auto 0 auto; width: 80%; font-size: 11px; color: #000; display: flex; flex-direction: column; gap: 4px; }
    .footer-notes { margin-top: 40px; display: flex; justify-content: space-between; font-size: 9px; border-top: 1px dashed #000; padding-top: 6px; }

    @media print {
      .no-print-bar { display: none !important; }
      body { background: white; }
      .print-area { padding: 0; margin: 0; max-width: 100%; box-shadow: none; }
    }
  `;

  // 3️⃣ Apertura asíncrona en ventana aislada
  const tituloArchivo = `CNS_Coagulograma_${pacienteNombre.replace(/ /g, "_")}`;
  const win = window.open('', '_blank');

  if (win) {
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${tituloArchivo}</title>
          <style>${estilosCompleto}</style>
        </head>
        <body style="margin:0; background:#f3f4f6;">
          <div class="no-print-bar">
            <button class="btn-report btn-print" onclick="window.print()">🖨️ Imprimir Coagulograma</button>
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