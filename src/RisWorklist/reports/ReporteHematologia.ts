export const imprimirHematologiaCNS = (p: any) => {
  // Extraemos los datos clínicos o la raíz si vienen juntos
  const d = p.datos || p || {};
  
  // Función auxiliar para valores vacíos
  const v = (val: any) => {
    if (val === undefined || val === null || val === "") return "-";
    return String(val);
  };

  // 🧮 FÓRMULA DIFERENCIAL TOTAL
  const n = (val: any) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const { mielo, metamie, cay, seg, eosi, baso, linf, mon } = d;
  const sumaTotalFormula = n(mielo) + n(metamie) + n(cay) + n(seg) + n(eosi) + n(baso) + n(linf) + n(mon);
  const totalMostrar = sumaTotalFormula > 0 ? String(sumaTotalFormula) : (d.total ? v(d.total) : "-");

  // 📝 EXTRACCIÓN 100% DINÁMICA (Sin datos quemados)
  const numeroOrden = p.orden ?? d.orden ?? p.id ?? "-";
  const sector = p.sector ?? d.sector ?? "-";
  const aseguradoReal = p.codigoAsegurado ?? p.cod ?? p.codigo_asegurado ?? p["Nº de Asegurado"] ?? d.codigoAsegurado ?? d.cod;
  
  const medico = p.medico_solicitante ?? p.medicoSolicitante ?? d.medico_solicitante ?? d.medicoSolicitante ?? p.medico ?? d.medico;
  const centro = p.centro_asistencial ?? p.centroAsistencial ?? d.centro_asistencial ?? d.centroAsistencial ?? p.centro ?? d.centro;
  
  // 🏢 Aquí jalamos lo que pones en el formulario. Si no hay nada, el guion te avisará que falta mapear en el Front.
  const institucion = p.institucion ?? d.institucion ?? p.policlinico ?? d.policlinico ?? "-"; 
  const servicio = p.servicio ?? d.servicio ?? "-";
  const consultorio = p.consultorio ?? d.consultorio ?? p.nro_consultorio ?? d.nro_consultorio;

  const htmlContent = `
    <html>
    <head>
      <meta charset="utf-8">
      <title>CNS_Hematologia_${(p.paciente || p.nombre || 'Paciente').replace(/ /g, "_")}</title>
      <style>
        body { font-family: Arial, sans-serif; color: #000; margin: 0; padding: 20px; font-size: 11px; }
        .red-header { background-color: #ff0000; color: #000; padding: 14px; font-weight: bold; font-size: 16px; text-align: center; border: 1px solid #000; }
        .filiacion-table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; }
        .filiacion-table td { padding: 4px; border-bottom: 1px dotted #000; vertical-align: bottom; }
        .filiacion-label { font-size: 10px; color: #333; text-align: center; display: block; margin-top: 2px; border-top: 1px solid #000; width: 90%; margin-left: auto; margin-right: auto; }
        .main-title { text-align: center; font-size: 18px; font-weight: bold; margin: 15px 0; letter-spacing: 1px; }
        .results-grid { display: grid; grid-template-columns: 1fr 1.2fr 1fr; gap: 15px; margin-top: 10px; }
        .col-box { display: flex; flex-direction: column; gap: 5px; }
        .row-item { display: flex; justify-content: space-between; border-bottom: 1px dotted #000; padding: 3px 0; min-height: 20px; align-items: center; }
        .val-bold { font-weight: bold; font-family: monospace; font-size: 12px; color: #000; }
        .diff-table { width: 100%; border-collapse: collapse; text-align: center; }
        .diff-table th, .diff-table td { border: 1px solid #000; padding: 4px; font-size: 11px; }
        .footer-notes { margin-top: 30px; border-top: 1px dashed #000; padding-top: 10px; }
      </style>
    </head>
    <body>
      <!-- 🏢 TITULO TOTALMENTE DINÁMICO SEGÚN TU INPUT -->
      <div class="red-header">
        ${v(institucion).toUpperCase()}<br>HEMATOLOGÍA
      </div>

      <table class="filiacion-table">
        <tr>
          <td style="width: 25%; text-align: center;" class="val-bold">${v(numeroOrden)}</td>
          <td style="width: 20%; text-align: center;" class="val-bold">${v(sector)}</td>
          <td style="width: 55%; text-align: right;">Nº de Asegurado: <span class="val-bold" style="font-size: 14px; border-bottom: 1px solid #000; padding: 0 10px;">${v(aseguradoReal)}</span></td>
        </tr>
        <tr>
          <td style="text-align: center;" class="val-bold">${v(medico)}<span class="filiacion-label">Médico Solicitante</span></td>
          <td style="text-align: center;" class="val-bold">${v(centro)}<span class="filiacion-label">Centro Asistencial</span></td>
          <td style="text-align: center;" class="val-bold">${(p.paciente || p.nombre || '').toUpperCase()}<span class="filiacion-label">Nombre y Apellidos</span></td>
        </tr>
        <tr>
          <td style="text-align: center;" class="val-bold">${v(servicio)}<span class="filiacion-label">Policlínico o Servicio</span></td>
          <td style="text-align: center;" class="val-bold">${v(consultorio)}<span class="filiacion-label">Consultorio</span></td>
          <td style="text-align: center;" class="val-bold">${v(p.fecha || p.fechaSolicitud)}<span class="filiacion-label">Fecha de Solicitud</span></td>
        </tr>
      </table>

      <div class="main-title">HEMATOLOGÍA</div>

      <div class="results-grid">
        
        <!-- 🔴 COLUMNA 1: SERIE ROJA Y GLOBULAR -->
        <div class="col-box">
          <div class="row-item"><span>Glóbulos Rojos:</span><span class="val-bold">${v(d.globulos_rojos ?? d.globulosRojos)}</span></div>
          <div class="row-item"><span>Hematocrito:</span><span class="val-bold">${v(d.hto)} %</span></div>
          <div class="row-item"><span>Hemoglobina:</span><span class="val-bold">${v(d.hb)} g/dL</span></div>
          <div class="row-item"><span>Reticulocitos:</span><span class="val-bold">${v(d.reticulocitos)} %</span></div>
          <div class="row-item"><span>Eritrosedimentación:</span><span class="val-bold">${v(d.ves_1_hora)} 1ra. Hr</span></div>
          <div style="margin-top: 15px;" class="row-item"><span>Grupo Sanguíneo:</span><span class="val-bold">${v(d.grupo_sanguineo)}</span></div>
        </div>

        <!-- 🔬 COLUMNA 2: FÓRMULA DIFERENCIAL -->
        <div class="col-box">
          <table class="diff-table">
            <thead>
              <tr><th style="font-size: 9px;">Fórmula Diferencial</th><th>%</th><th>uL</th></tr>
            </thead>
            <tbody>
              <tr><td>Mielocitos</td><td class="val-bold">${v(d.mielo)}</td><td>-</td></tr>
              <tr><td>Metamielocitos</td><td class="val-bold">${v(d.metamie)}</td><td>-</td></tr>
              <tr><td>Cayados</td><td class="val-bold">${v(d.cay)}</td><td>-</td></tr>
              <tr><td>Segmentados</td><td class="val-bold">${v(d.seg)}</td><td>-</td></tr>
              <tr><td>Eosinófilos</td><td class="val-bold">${v(d.eosi)}</td><td>-</td></tr>
              <tr><td>Basófilos</td><td class="val-bold">${v(d.baso)}</td><td>-</td></tr>
              <tr><td>Linfocitos</td><td class="val-bold">${v(d.linf)}</td><td>-</td></tr>
              <tr><td>Monocitos</td><td class="val-bold">${v(d.mon)}</td><td>-</td></tr>
              <tr style="font-weight: bold; background-color: #f5f5f5;">
                <td>TOTAL</td>
                <td class="val-bold" style="color: #ff0000;">${totalMostrar}</td>
                <td class="val-bold">${v(d.globulos_blancos)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 📊 COLUMNA 3: RECUENTO Y TIEMPOS -->
        <div class="col-box">
          <div class="row-item"><span>Glóbulos Blancos:</span><span class="val-bold">${v(d.globulos_blancos)} uL</span></div>
          <div class="row-item"><span>Plaquetas:</span><span class="val-bold">${v(d.plaquetas)} Ul</span></div>
          <div style="margin-top: 10px;" class="row-item"><span>VES 2 HORA:</span><span class="val-bold">${v(d.ves_2_hora)}</span></div>
          <div class="row-item"><span>INDICE DE KATZ:</span><span class="val-bold">${v(d.indice_katz)}</span></div>
          <div class="row-item"><span>T. de Protrombina:</span><span class="val-bold">${v(d.tiempo_protrombina)}</span></div>
          <div class="row-item"><span>Actividad:</span><span class="val-bold">${v(d.actividad_protrombina)}</span></div>
          <div class="row-item"><span>INR:</span><span class="val-bold">${v(d.inr)}</span></div>
        </div>

      </div>

      <div style="margin-top: 30px; font-size: 10px; line-height: 1.6;">
        <div><b>Comentario Serie Roja:</b> ${v(d.comentario_roja)}</div>
        <div><b>Comentario Serie Blanca:</b> ${v(d.comentario_blanca)}</div>
        <div><b>Comentario Plaquetas:</b> ${v(d.comentario_plaquetas)}</div>
      </div>

      <div class="footer-notes" style="display: flex; justify-content: space-between; font-size: 10px; margin-top: 40px;">
        <span>Elaborado por: Asist. Dig. RIS-SERVER (CNS)</span>
        <span>Fecha de Reporte: ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString().slice(0,5)}</span>
      </div>

      <script>
        window.onload = function() { 
          window.print(); 
          setTimeout(function(){ window.close(); }, 300); 
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