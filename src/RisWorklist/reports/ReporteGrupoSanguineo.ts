// src/RisWorklist/reports/ReporteGrupoSanguineo.ts

export const imprimirGrupoSanguineoCNS = (p: any) => {
  // Extraemos la bolsa de datos consolidada
  const d = p.datos || p || {};
  
  // Función auxiliar para renderizar el valor real o un guion si está vacío
  const v = (val: any) => {
    if (val === undefined || val === null || val === "") return "-";
    return String(val);
  };

  // 📝 EXTRACCIÓN DINÁMICA DE CAMPOS (Basado en tu objeto consolidado y FormQuimica)
  const numeroOrden = p.orden ?? d.orden ?? p.id ?? "1"; 
  const aseguradoReal = p.codigoAsegurado ?? p.cod ?? d.codigoAsegurado ?? d.cod;
  const codBeneficiario = p.codBeneficiario || p.id_paciente || "-";
  const edad = p.edad || d.edad || "-";
  
  const medico = p.medico_solicitante ?? p.medicoSolicitante ?? d.medico_solicitante ?? d.medicoSolicitante ?? "-";
  const centro = p.centro_asistencial ?? p.centroAsistencial ?? d.centro_asistencial ?? d.centroAsistencial ?? "-";
  const pacienteNombre = (p.paciente || p.nombre || 'Paciente').toUpperCase();
  
  const institucion = p.institucion ?? d.institucion ?? p.policlinico ?? d.policlinico ?? "-"; 
  const servicio = p.servicio ?? d.servicio ?? "-";
  const consultorio = p.consultorio ?? d.consultorio ?? "-";
  const fechaSolicitud = p.fecha || p.fechaSolicitud || p.fecha_solicitud || "-";

  // Valores dinámicos que provienen del FormQuimica
  const glucemia = d.gli || "-";
  const creatinina = d.crea || "-";
  const colesterol = d.col || "-";
  const trigliceridos = d.tri || "-";
  const observacionesQuimica = d.observaciones || "-";

  // Mapeo del grupo sanguíneo (por si se hereda de hematología)
  const grupoSanguineoReal = p.grupo_sanguineo ?? d.grupo_sanguineo ?? "-";

  const htmlContent = `
    <html>
    <head>
      <meta charset="utf-8">
      <title>CNS_Quimicas_${pacienteNombre.replace(/ /g, "_")}</title>
      <style>
        body { font-family: Arial, sans-serif; color: #000; margin: 0; padding: 20px; font-size: 12px; background-color: #fff; }
        
        /* 🔵 CABECERA AZUL E IDENTIFICADOR VERDE (Formato image_da9673.png) */
        .header-container { display: flex; width: 100%; border: 1px solid #000; box-sizing: border-box; }
        .blue-box { background-color: #00a8e8; color: #000; flex-grow: 1; padding: 12px; text-align: center; font-weight: bold; font-size: 13px; line-height: 1.5; text-transform: uppercase; }
        .blue-box .sub { font-size: 14px; margin-top: 4px; letter-spacing: 1px; }
        .green-box { background-color: #92d050; color: #000; width: 80px; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; border-left: 1px solid #000; }
        
        /* 📝 LINEAS PUNTEADAS DE FILIACIÓN */
        .filiacion-table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; }
        .filiacion-table td { padding: 6px 4px; vertical-align: bottom; font-size: 11px; }
        .border-dotted { border-bottom: 1px dotted #000; }
        .val-bold { font-weight: bold; font-family: 'Courier New', Courier, monospace; font-size: 13px; }
        .filiacion-label { font-size: 9px; color: #000; display: block; text-align: center; margin-top: 2px; }
        
        .center-order { text-align: center; font-size: 20px; font-weight: bold; margin: 8px 0; font-family: monospace; }
        .main-title { text-align: center; font-size: 15px; font-weight: bold; margin: 20px 0 25px 0; text-decoration: underline; letter-spacing: 1px; }
        
        /* 🧪 TABLA DE RESULTADOS DE QUÍMICA */
        .results-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .results-table th, .results-table td { padding: 8px; border: 1px solid #000; text-align: left; }
        .results-table th { background-color: #f2f2f2; font-weight: bold; }
        .text-center { text-align: center; }

        .footer-notes { position: fixed; bottom: 20px; left: 20px; right: 20px; display: flex; justify-content: space-between; font-size: 10px; border-top: 1px dashed #000; padding-top: 8px; }
      </style>
    </head>
    <body>

      <!-- 🔵 CABECERA AZUL Y VERDE DINÁMICA -->
      <div class="header-container">
        <div class="blue-box">
          ${v(institucion).toUpperCase()}<br>
          <div class="sub">QUÍMICAS</div>
        </div>
        <div class="green-box">${v(numeroOrden)}</div>
      </div>

      <div class="center-order">${v(numeroOrden)}</div>

      <!-- 📝 LÍNEAS DE SEGURO, ID Y EDAD -->
      <table class="filiacion-table" style="margin-bottom: 5px;">
        <tr>
          <td style="width: 45%; text-align: right;">Nº de Asegurado:</td>
          <td style="width: 25%; text-align: left;" class="val-bold border-dotted">${v(aseguradoReal)}</td>
          <td style="width: 12%; text-align: right;">Cod. Beneficiario:</td>
          <td style="width: 8%; text-align: center;" class="val-bold border-dotted">${v(codBeneficiario)}</td>
          <td style="width: 5%; text-align: right;">Edad:</td>
          <td style="width: 5%; text-align: center;" class="val-bold border-dotted">${v(edad)}</td>
        </tr>
      </table>

      <!-- 📝 CUADRO DE FILIACIÓN GENERAL -->
      <table class="filiacion-table">
        <tr>
          <td style="width: 33%; text-align: center;" class="val-bold border-dotted">${v(medico)}<span class="filiacion-label">Medico Solicitante</span></td>
          <td style="width: 33%; text-align: center;" class="val-bold border-dotted">${v(centro)}<span class="filiacion-label">Centro Asistencial</span></td>
          <td style="width: 34%; text-align: center;" class="val-bold border-dotted">${pacienteNombre}<span class="filiacion-label">Nombres y Apellidos</span></td>
        </tr>
        <tr>
          <td style="text-align: center;" class="val-bold border-dotted">${v(servicio)}<span class="filiacion-label">Policlinico o Servicio</span></td>
          <td style="text-align: center;" class="val-bold border-dotted">${v(consultorio)}<span class="filiacion-label">Consultorio</span></td>
          <td style="text-align: center;" class="val-bold border-dotted">${v(fechaSolicitud)}<span class="filiacion-label">Fecha de Solicitud</span></td>
        </tr>
      </table>

      <div class="main-title">EXAMEN DE QUÍMICA SANGUÍNEA Y ANÁLISIS</div>

      <!-- 📊 RENDERS DE LOS INPUTS DE TU FORMQUIMICA -->
      <table class="results-table">
        <thead>
          <tr>
            <th>Análisis Solicitado</th>
            <th class="text-center">Resultado Obtenido</th>
            <th>Valores de Referencia</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><b>GLI</b> (Glucemia)</td>
            <td class="val-bold text-center">${v(glucemia)} mg/dL</td>
            <td>70 - 110 mg/dL</td>
          </tr>
          <tr>
            <td><b>CREA</b> (Creatinina)</td>
            <td class="val-bold text-center">${v(creatinina)} mg/dL</td>
            <td>0.6 - 1.2 mg/dL</td>
          </tr>
          <tr>
            <td><b>COL</b> (Colesterol Total)</td>
            <td class="val-bold text-center">${v(colesterol)} mg/dL</td>
            <td>Hasta 200 mg/dL</td>
          </tr>
          <tr>
            <td><b>TRI</b> (Triglicéridos)</td>
            <td class="val-bold text-center">${v(trigliceridos)} mg/dL</td>
            <td>Hasta 150 mg/dL</td>
          </tr>
          ${grupoSanguineoReal !== "-" ? `
          <tr>
            <td><b>GRUPO SANGUÍNEO</b></td>
            <td class="val-bold text-center" style="color: #ff0000;">${v(grupoSanguineoReal).toUpperCase()}</td>
            <td>Factor ABO</td>
          </tr>
          ` : ''}
        </tbody>
      </table>

      <div style="margin-top: 20px; font-size: 11px;">
        <b>Observaciones Clínicas:</b> ${v(observacionesQuimica)}
      </div>

      <!-- 📋 PIE DE INFORME -->
      <div class="footer-notes">
        <span><b>Elaborado por:</b> Asist. Dig. RIS-SERVER (CNS)</span>
        <span><b>Fecha de Reporte:</b> ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        <span><b>Hrs:</b> ${new Date().toLocaleTimeString().slice(0,5)}</span>
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