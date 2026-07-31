// src/RisWorklist/reports/ReporteHematologia.ts

export const imprimirHematologiaCNS = (p: any) => {
  const d = p.datos || p || {};
  
  const v = (val: any) => {
    if (val === undefined || val === null || String(val).trim() === "") return "-";
    return String(val);
  };

  const n = (val: any) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  // Cálculo exacto de la Fórmula Diferencial según el estándar de la CNS
  const { mielo, metamie, cay, seg, eosi, baso, linf, mon } = d;
  const sumaTotalFormula = n(mielo) + n(metamie) + n(cay) + n(seg) + n(eosi) + n(baso) + n(linf) + n(mon);
  const totalMostrar = sumaTotalFormula > 0 ? String(sumaTotalFormula) : (d.total ? v(d.total) : "-");

  // Correlativo secuencial blindado contra marcas de tiempo gigantes
  let numeroSecuencialLimpio = String(p.orden ?? d.orden ?? p.id ?? "1");
  if (numeroSecuencialLimpio.length > 6) {
    numeroSecuencialLimpio = "1";
  }

  const sector = p.sector ?? d.sector ?? "-";
  const aseguradoReal = p.codigoAsegurado ?? p.cod ?? p.codigo_asegurado ?? p["Nº de Asegurado"] ?? d.codigoAsegurado ?? d.cod ?? "-";
  
  const medico = p.medico_solicitante ?? p.medicoSolicitante ?? d.medico_solicitante ?? d.medicoSolicitante ?? p.medico ?? d.medico ?? "-";
  const centro = p.centro_asistencial ?? p.centroAsistencial ?? d.centro_asistencial ?? d.centroAsistencial ?? p.centro ?? d.centro ?? "-";
  
  const institucion = p.institucion ?? d.institucion ?? p.policlinico ?? d.policlinico ?? "CNS"; 
  const servicio = p.servicio ?? d.servicio ?? "LABORATORIO";
  const consultorio = p.consultorio ?? d.consultorio ?? p.nro_consultorio ?? d.nro_consultorio ?? "-";
  const fechaReporte = p.fecha || p.fecha_solicitud || d.fecha || d.fecha_solicitud || "-";

  // 1️⃣ Estructura HTML pura del reporte oficial de Hemograma
  const htmlInforme = `
    <!-- 🏢 CABECERA ROJA INSTITUCIONAL -->
    <div class="red-header">
      ${v(institucion).toUpperCase()}<br>HEMOGRAMA
    </div>

    <table class="filiacion-table">
      <tr>
        <td style="width: 25%; text-align: center;" class="val-bold">${v(numeroSecuencialLimpio)}</td>
        <td style="width: 20%; text-align: center;" class="val-bold">${v(sector)}</td>
        <td style="width: 55%; text-align: right; color: #000;">Nº de Asegurado: <span class="val-bold" style="font-size: 14px; border-bottom: 1px solid #000; padding: 0 10px;">${v(aseguradoReal)}</span></td>
      </tr>
      <tr>
        <td style="text-align: center;" class="val-bold">${v(medico).toUpperCase()}<span class="filiacion-label">Médico Solicitante</span></td>
        <td style="text-align: center;" class="val-bold">${v(centro).toUpperCase()}<span class="filiacion-label">Centro Asistencial</span></td>
        <td style="text-align: center;" class="val-bold">${String(p.paciente || p.nombre || '').toUpperCase()}<span class="filiacion-label">Nombre y Apellidos</span></td>
      </tr>
      <tr>
        <td style="text-align: center;" class="val-bold">${v(servicio).toUpperCase()}<span class="filiacion-label">Policlínico o Servicio</span></td>
        <td style="text-align: center;" class="val-bold">${v(consultorio).toUpperCase()}<span class="filiacion-label">Consultorio</span></td>
        <td style="text-align: center;" class="val-bold">${v(fechaReporte)}<span class="filiacion-label">Fecha de Solicitud</span></td>
      </tr>
    </table>

    <div class="main-title">HEMOGRAMA</div>

    <div class="results-grid">
      <!-- 🔴 COLUMNA 1: SERIE ROJA Y GLOBULAR -->
      <div class="col-box">
        <div class="row-item"><span>HTO:</span><span class="val-bold">${v(d.hto)} %</span></div>
        <div class="row-item"><span>HB:</span><span class="val-bold">${v(d.hb)} g/dL</span></div>
        <div class="row-item"><span>V.C.M.:</span><span class="val-bold">${v(d.vcm)} fL</span></div>
        <div class="row-item"><span>H.C.M.:</span><span class="val-bold">${v(d.hcm)} pg</span></div>
        <div class="row-item"><span>C.H.C.M.:</span><span class="val-bold">${v(d.chcm)} g/dL</span></div>
        <div class="row-item"><span>RETICULOCITOS:</span><span class="val-bold">${v(d.reticulocitos)} %</span></div>
        <div style="margin-top: 10px;" class="row-item"><span>GRUPO SANGUÍNEO:</span><span class="val-bold">${v(d.grupo_sanguineo)}</span></div>
      </div>

      <!-- 🔬 COLUMNA 2: FÓRMULA DIFERENCIAL (Con abreviaturas oficiales del Excel) -->
      <div class="col-box">
        <table class="diff-table">
          <thead>
            <tr><th style="font-size: 9px; color: #000;">FÓRMULA DIFERENCIAL</th><th style="color: #000;">%</th><th style="color: #000;">uL</th></tr>
          </thead>
          <tbody>
            <tr><td>MIELO</td><td class="val-bold">${v(d.mielo)}</td><td>-</td></tr>
            <tr><td>METAMIE</td><td class="val-bold">${v(d.metamie)}</td><td>-</td></tr>
            <tr><td>CAY.</td><td class="val-bold">${v(d.cay)}</td><td>-</td></tr>
            <tr><td>SEG</td><td class="val-bold">${v(d.seg)}</td><td>-</td></tr>
            <tr><td>EOSI.</td><td class="val-bold">${v(d.eosi)}</td><td>-</td></tr>
            <tr><td>BASO.</td><td class="val-bold">${v(d.baso)}</td><td>-</td></tr>
            <tr><td>LINF.</td><td class="val-bold">${v(d.linf)}</td><td>-</td></tr>
            <tr><td>MON.</td><td class="val-bold">${v(d.mon)}</td><td>-</td></tr>
            <tr style="font-weight: bold; background-color: #f5f5f5;">
              <td>TOTAL</td>
              <td class="val-bold" style="color: #ff0000;">${totalMostrar}</td>
              <td class="val-bold">${v(d.globulos_blancos)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 📊 COLUMNA 3: RECUENTO Y SEDIMENTACIÓN -->
      <div class="col-box">
        <div class="row-item"><span>GLOBULOS BLANCOS:</span><span class="val-bold">${v(d.globulos_blancos)} uL</span></div>
        <div class="row-item"><span>PLAQUETAS:</span><span class="val-bold">${v(d.plaquetas)} uL</span></div>
        <div style="margin-top: 15px;" class="row-item"><span>VES 1 HORA:</span><span class="val-bold">${v(d.ves_1_hora)} mm</span></div>
        <div class="row-item"><span>VES 2HORA:</span><span class="val-bold">${v(d.ves_2_hora)} mm</span></div>
        <div class="row-item"><span>INDICE DE KATZ:</span><span class="val-bold">${v(d.indice_katz)}</span></div>
      </div>
    </div>

    <!-- 📝 COMENTARIOS OFICIALES -->
    <div class="comentarios-seccion">
      <div><b>COMENTARIO SERIE ROJA:</b> ${v(d.comentario_roja)}</div>
      <div><b>COMENTARIO SERIE BLANCA:</b> ${v(d.comentario_blanca)}</div>
      <div><b>COMENTARIO PLAQUETAS:</b> ${v(d.comentario_plaquetas)}</div>
      <div><b>OBSERVACIONES:</b> ${v(d.observaciones)}</div>
    </div>

    <div class="footer-notes">
      <span>Elaborado por: Asist. Dig. RIS-SERVER (CNS)</span>
      <span>Fecha de Reporte: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} a las ${new Date().toLocaleTimeString().slice(0,5)}</span>
    </div>
  `;

  // 2️⃣ CSS del documento
  const estilosCompleto = `
    .no-print-bar {
      display: flex;
      justify-content: center;
      gap: 12px;
      background: #111827;
      padding: 12px;
      border-bottom: 2px solid #dc2626;
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
    .btn-print { background: #dc2626; color: white; }
    .btn-print:hover { background: #b91c1c; }
    .btn-close { background: #ef4444; color: white; }
    .btn-close:hover { background: #dc2626; }

    .print-area {
      padding: 30px;
      background: #ffffff;
      max-width: 850px;
      margin: 0 auto;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }

    body { font-family: Arial, sans-serif; color: #000; margin: 0; padding: 0; font-size: 11px; }
    .red-header { background-color: #ff0000; color: #000; padding: 14px; font-weight: bold; font-size: 16px; text-align: center; border: 1px solid #000; line-height: 1.4; }
    .filiacion-table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; }
    .filiacion-table td { padding: 4px; border-bottom: 1px dotted #000; vertical-align: bottom; color: #000; }
    .filiacion-label { font-size: 10px; color: #333; text-align: center; display: block; margin-top: 2px; border-top: 1px solid #000; width: 90%; margin-left: auto; margin-right: auto; padding-top: 1px; }
    .main-title { text-align: center; font-size: 18px; font-weight: bold; margin: 15px 0; letter-spacing: 1px; text-decoration: underline; }
    .results-grid { display: grid; grid-template-columns: 1fr 1.2fr 1fr; gap: 15px; margin-top: 10px; }
    .col-box { display: flex; flex-direction: column; gap: 5px; }
    .row-item { display: flex; justify-content: space-between; border-bottom: 1px dotted #000; padding: 3px 0; min-height: 20px; align-items: center; color: #000; }
    .val-bold { font-weight: bold; font-family: monospace; font-size: 12px; color: #000; }
    
    .diff-table { width: 100%; border-collapse: collapse; text-align: center; background: #fff; }
    .diff-table th, .diff-table td { border: 1px solid #000; padding: 4px; font-size: 11px; color: #000; }
    .comentarios-seccion { margin-top: 25px; font-size: 10px; line-height: 1.6; color: #000; display: flex; flex-direction: column; gap: 4px; }
    .footer-notes { margin-top: 35px; border-top: 1px dashed #000; padding-top: 10px; display: flex; justify-content: space-between; font-size: 10px; color: #000; }

    @media print {
      .no-print-bar { display: none !important; }
      body { background: white; }
      .print-area { padding: 0; margin: 0; max-width: 100%; box-shadow: none; }
    }
  `;

  // 3️⃣ Lanzamiento e impresión
  const tituloArchivo = `CNS_Hemograma_${(p.paciente || p.nombre || 'Paciente').replace(/ /g, "_")}`;
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
            <button class="btn-report btn-print" onclick="window.print()">🖨️ Imprimir Hemograma</button>
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