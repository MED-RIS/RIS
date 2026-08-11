// src/RisWorklist/reports/ReporteCoagulograma.ts

export const imprimirCoagulogramaCNS = (p: any) => {
  // El objeto d representa la raíz de los datos clínicos guardados
  const d = p.datos || p || {};
  
  const v = (val: any) => {
    if (val === undefined || val === null || val === "") return "-";
    return String(val);
  };

  // 👤 EXTRACCIÓN DINÁMICA DE FILIACIÓN (Mapeado con FormularioTab)
  const pacienteNombre = String(p.paciente ?? d.paciente ?? p.nombre ?? d.nombre ?? "Paciente").trim().toUpperCase();
  const codBeneficiario = p.codBeneficiario ?? p.id_paciente ?? d.id_paciente ?? "-";
  const edad = p.edad ?? d.edad ?? "-";
  const institucion = p.institucion ?? d.institucion ?? p.policlinico ?? d.policlinico ?? "CNS";
  
  // 🌟 Correlativo secuencial seguro: si es un número largo (timestamp), lo limpia a "1"
  let numeroSecuencialLimpio = String(p.orden ?? d.orden ?? p.numero_orden ?? d.numero_orden ?? "1");
  if (numeroSecuencialLimpio.length > 6) {
    numeroSecuencialLimpio = "1";
  }

  const aseguradoReal = p.codigoAsegurado ?? p.cod ?? d.codigoAsegurado ?? d.cod ?? "-";
  const medico = p.medico_solicitante ?? p.medicoSolicitante ?? d.medico_solicitante ?? d.medicoSolicitante ?? "-";
  const centro = p.centro_asistencial ?? p.centroAsistencial ?? d.centro_asistencial ?? d.centroAsistencial ?? "-";
  const servicio = p.servicio ?? d.servicio ?? "LABORATORIO";
  const consultorio = p.consultorio ?? d.consultorio ?? "-";
  const fechaSolicitud = p.fecha ?? p.fecha_solicitud ?? d.fecha ?? d.fecha_solicitud ?? "-";

  // 🩸 JALANDO DATOS DE COAGULACIÓN DESDE EL EXPEDIENTE DE HEMATOLOGÍA (Sin quemar nada)
  const tiempoProtrombina = d.tiempo_protrombina ?? d.hematoDatos?.tiempo_protrombina ?? "-";
  const actividadProtrombina = d.actividad_protrombina ?? d.hematoDatos?.actividad_protrombina ?? "-";
  const inr = d.inr ?? d.hematoDatos?.inr ?? "-";
  
  // Variables de tiempo de coagulación y sangría (Minutos y Segundos)
  const coagulacionMin = d.tiempo_coagulacion_min ?? d.hematoDatos?.tiempo_coagulacion_min ?? "-";
  const coagulacionSeg = d.tiempo_coagulacion_seg ?? d.hematoDatos?.tiempo_coagulacion_seg ?? "-";
  const sangriaMin = d.tiempo_sangria_min ?? d.hematoDatos?.tiempo_sangria_min ?? "-";
  const sangriaSeg = d.tiempo_sangria_seg ?? d.hematoDatos?.tiempo_sangria_seg ?? "-";

  // 1️⃣ Construimos únicamente el bloque interno del reporte de la CNS
  const htmlInforme = `
    <div class="header-container">
      <div class="blue-box">
        ${v(institucion).toUpperCase()}<br>
        <div class="sub">QUÍMICAS</div>
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

    <div class="main-title">HEMATOLOGIA</div>

    <table class="results-table">
      <thead>
        <tr>
          <th style="width: 45%;">Análisis Solicitado</th>
          <th style="width: 25%; text-align: center;">Resultado Obtenido</th>
          <th style="width: 30%;">Valores de Referencia</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><b>Tiempo de Protrombina</b></td>
          <td class="val-bold">${v(tiempoProtrombina)} seg</td>
          <td>11 - 15 segundos</td>
        </tr>
        <tr>
          <td><b>Actividad de Protrombina</b></td>
          <td class="val-bold">${v(actividadProtrombina)} %</td>
          <td>70 - 100 %</td>
        </tr>
        <tr>
          <td><b>INR</b></td>
          <td class="val-bold">${v(inr)}</td>
          <td>1.0 - 1.2</td>
        </tr>
        <tr>
          <td><b>Tiempo de Coagulación</b></td>
          <td class="val-bold">
            ${coagulacionMin !== "-" || coagulacionSeg !== "-" ? `${v(coagulacionMin)}' ${v(coagulacionSeg)}"` : "-"}
          </td>
          <td>5 - 10 minutos</td>
        </tr>
        <tr>
          <td><b>Tiempo de Sangría</b></td>
          <td class="val-bold">
            ${sangriaMin !== "-" || sangriaSeg !== "-" ? `${v(sangriaMin)}' ${v(sangriaSeg)}"` : "-"}
          </td>
          <td>1 - 3 minutos</td>
        </tr>
      </tbody>
    </table>

    <div class="footer-notes">
      <span><b>Elaborado por:</b> Asist. Dig. RIS-SERVER (CNS)</span>
      <span><b>Fecha de Reporte:</b> ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
      <span><b>Hrs:</b> ${new Date().toLocaleTimeString().slice(0,5)}</span>
    </div>
  `;

  // 2️⃣ Agrupamos los estilos y la interfaz interactiva de la barra de previsualización
  const estilosCompleto = `
    /* Barra de herramientas superior flotante */
    .no-print-bar {
      display: flex;
      justify-content: center;
      gap: 12px;
      background: #111827;
      padding: 12px;
      border-bottom: 2px solid #e67e22;
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
    .btn-print { background: #e67e22; color: white; }
    .btn-print:hover { background: #d35400; }
    .btn-close { background: #ef4444; color: white; }
    .btn-close:hover { background: #dc2626; }

    /* Contenedor del documento tamaño carta */
    .print-area {
      padding: 40px;
      background: #ffffff;
      max-width: 800px;
      margin: 0 auto;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }

    @page { size: letter; margin: 40px; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #000; margin: 0; padding: 0; font-size: 11px; line-height: 1.4; }
    
    /* 🔵 CABECERA INSTITUCIONAL CNS */
    .header-container { display: table; width: 100%; border: 2px solid #000; box-sizing: border-box; margin-bottom: 5px; }
    .blue-box { display: table-cell; background-color: #00a8e8; color: #000; padding: 15px; text-align: center; font-weight: bold; font-size: 14px; vertical-align: middle; }
    .blue-box .sub { font-size: 16px; margin-top: 5px; letter-spacing: 2px; font-weight: 900; }
    .green-box { display: table-cell; background-color: #92d050; color: #000; width: 90px; text-align: center; font-size: 38px; font-weight: bold; border-left: 2px solid #000; vertical-align: middle; font-family: monospace; }
    
    .center-order { text-align: center; font-size: 22px; font-weight: bold; margin: 10px 0; font-family: monospace; }
    
    /* 📝 TABLAS DE FILIACIÓN */
    .filiacion-table { width: 100%; border-collapse: collapse; margin-top: 5px; margin-bottom: 15px; table-layout: fixed; }
    .filiacion-table td { padding: 5px 2px; vertical-align: bottom; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .border-dotted { border-bottom: 1px dotted #000; font-weight: bold; font-size: 12px; font-family: monospace; text-align: center; padding-bottom: 1px; }
    .filiacion-label { font-size: 9px; color: #333; display: block; text-align: center; margin-top: 2px; border-top: 1px solid #000; width: 95%; margin-left: auto; margin-right: auto; padding-top: 1px; }
    
    .main-title { text-align: center; font-size: 15px; font-weight: bold; margin: 30px 0 20px 0; text-decoration: underline; letter-spacing: 1.5px; }
    
    /* 📊 TABLA DE RESULTADOS DE COAGULACIÓN */
    .results-table { width: 100%; border-collapse: collapse; margin-top: 20px; table-layout: fixed; }
    .results-table th, .results-table td { padding: 10px 14px; border: 1px solid #000; font-size: 12px; color: #000; }
    .results-table th { background-color: #f2f2f2; font-weight: bold; text-align: left; text-transform: uppercase; font-size: 10px; }
    .val-bold { font-weight: bold; font-family: monospace; font-size: 13px; text-align: center; }
    .footer-notes { margin-top: 30px; border-top: 1px dashed #000; padding-top: 10px; display: flex; justify-content: space-between; font-size: 9px; }

    @media print {
      .no-print-bar { display: none !important; }
      body { background: white; }
      .print-area { padding: 0; margin: 0; max-width: 100%; box-shadow: none; }
    }
  `;

  // 3️⃣ Apertura asíncrona segura en pestaña limpia (Evita colgar tu pestaña de React)
  const tituloArchivo = `CNS_Coagulograma_${pacienteNombre.replace(/ /g, "_")}`;
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