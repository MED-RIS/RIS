export const imprimirCoagulogramaCNS = (p: any) => {

  const d = p.datos || p || {};

  // Null-safe display helper (mismo contrato que los reportes existentes)
  const v = (val: any) => {
    if (val === undefined || val === null || val === "") return "-";
    return String(val);
  };

  // Formateo seguro de fecha: acepta string ISO ("2026-06-29"), Date o serial Excel.
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

  // ── Filiación (misma cadena de resolución que ReporteGrupoSanguineo) ──
  const pacienteNombre = String(
    p.paciente ?? d.paciente ?? p.nombre ?? d.nombre ?? "Paciente"
  ).trim().toUpperCase();

  const codBeneficiario = p.codBeneficiario ?? p.id_paciente ?? p.pacienteData?.id_paciente ?? d.id_paciente ?? d.codBeneficiario ?? "-";
  const edad = p.edad ?? d.edad ?? p.pacienteData?.edad ?? p.datos?.edad ?? "-";
  const institucion = p.institucion ?? d.institucion ?? p.policlinico ?? d.policlinico ?? "CNS";
  const numeroOrden = p.orden ?? d.orden ?? p.id_consulta ?? d.id_consulta ?? "1";
  const aseguradoReal = p.codigoAsegurado ?? p.cod ?? d.codigoAsegurado ?? d.cod ?? "-";
  const medico = p.medico_solicitante ?? p.medicoSolicitante ?? d.medico_solicitante ?? d.medicoSolicitante ?? "-";
  const centro = p.centro_asistencial ?? p.centroAsistencial ?? d.centro_asistencial ?? d.centroAsistencial ?? "-";
  const servicio = p.servicio ?? d.servicio ?? "";
  const consultorio = p.consultorio ?? d.consultorio ?? "-";
  const fechaSolicitud = vFecha(p.fecha ?? p.fecha_solicitud ?? d.fecha ?? d.fecha_solicitud);

  // ── Valores del coagulograma (provienen de la bolsa hematoDatos / top-level de datos) ──
  const tProtrombina = d.t_protrombina ?? d.tiempo_protrombina ?? d.tiempo_de_protrombina;
  const actividad = d.actividad ?? d.actividad_protrombina;
  const inr = d.inr;
  const tCoagMin = d.t_coagulacion_min ?? d.tiempo_coagulacion_min;
  const tCoagSeg = d.t_coagulacion_seg ?? d.tiempo_coagulacion_seg;
  const tSangMin = d.t_sangria_min ?? d.tiempo_sangria_min;
  const tSangSeg = d.t_sangria_seg ?? d.tiempo_sangria_seg;
  const observaciones = d.observaciones ?? d.comentario_plaquetas ?? "-";

  const htmlContent = `
    <html>
    <head>
      <meta charset="utf-8">
      <title>CNS_Coagulograma_${pacienteNombre.replace(/ /g, "_")}</title>
      <style>
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
        .results-table td { padding: 10px 14px; border-bottom: 1px dotted #000; font-size: 13px; }
        .results-table td.label { font-weight: bold; width: 55%; }
        .results-table td.val { text-align: right; font-family: monospace; font-weight: bold; font-size: 14px; }
        .results-table td.unit { width: 18%; text-align: left; color: #333; font-size: 11px; }

        .obs-box { margin: 35px auto 0 auto; width: 80%; font-size: 11px; }
        .footer-notes { position: fixed; bottom: 10px; left: 0; right: 0; display: flex; justify-content: space-between; font-size: 9px; border-top: 1px dashed #000; padding-top: 6px; }
      </style>
    </head>
    <body>

      <div class="header-container">
        <div class="blue-box">
          ${v(institucion).toUpperCase()}<br>
          <div class="sub">COAGULOGRAMA</div>
        </div>
        <div class="green-box">${v(numeroOrden)}</div>
      </div>

      <div class="center-order">${v(numeroOrden)}</div>

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
          <td class="val">${v(tCoagMin)} min. ${v(tCoagSeg)} seg.</td>
          <td class="unit"></td>
        </tr>
        <tr>
          <td class="label">Tiempo de Sangría:</td>
          <td class="val">${v(tSangMin)} min. ${v(tSangSeg)} seg.</td>
          <td class="unit"></td>
        </tr>
      </table>

      <div class="obs-box">
        <b>Observaciones:</b> ${v(observaciones)}
      </div>

      <div class="footer-notes">
        <span><b>Elaborado por:</b> Asist. Dig. RIS-SERVER (CNS)</span>
        <span><b>Fecha de Reporte:</b> ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        <span><b>Hrs:</b> ${new Date().toLocaleTimeString().slice(0, 5)}</span>
      </div>

      <script>
        window.onload = function() {
          window.print();
          setTimeout(function(){ window.close(); }, 350);
        }
      </script>
    </body>
    </html>
  `;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(htmlContent);
    win.document.close();
  }
};
