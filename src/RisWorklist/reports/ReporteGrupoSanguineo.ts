// src/RisWorklist/reports/ReporteGrupoSanguineo.ts

export const imprimirGrupoSanguineoCNS = (p: any) => {
  const d = p.datos || p || {};
  
  const v = (val: any) => {
    if (val === undefined || val === null || val === "") return "-";
    return String(val);
  };

  // Extracción dinámica sin datos quemados
  const numeroOrden = p.orden ?? d.orden ?? p.id ?? "1"; 
  const aseguradoReal = p.codigoAsegurado ?? p.cod ?? d.codigoAsegurado ?? d.cod;
  const codBeneficiario = p.codBeneficiario || p.id_paciente || "-";
  const edad = p.edad || d.edad || "-";
  
  const medico = p.medico_solicitante ?? p.medicoSolicitante ?? d.medico_solicitante ?? d.medicoSolicitante ?? "-";
  const centro = p.centro_asistencial ?? p.centroAsistencial ?? d.centro_asistencial ?? d.centroAsistencial ?? "-";
  const pacienteNombre = (p.paciente || p.nombre || 'Paciente').toUpperCase();
  
  const institucion = p.institucion ?? d.institucion ?? p.policlinico ?? d.policlinico ?? "POLICLÍNICO CNS"; 
  const servicio = p.servicio ?? d.servicio ?? "LABORATORIO";
  const consultorio = p.consultorio ?? d.consultorio ?? "-";
  const fechaSolicitud = p.fecha || p.fechaSolicitud || p.fecha_solicitud || "-";

  const glucemia = d.gli || "-";
  const creatinina = d.crea || "-";
  const col = d.col || "-";
  const tri = d.tri || "-";
  const observacionesQuimica = d.observaciones || "-";
  const grupoSanguineoReal = p.grupo_sanguineo ?? d.grupo_sanguineo ?? d.grupo_sanguineo_real ?? "-";

  const htmlContent = `
    <html>
    <head>
      <meta charset="utf-8">
      <title>CNS_Quimicas_${pacienteNombre.replace(/ /g, "_")}</title>
      <style>
        @page { size: letter; margin: 40px; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #000; margin: 0; padding: 0; font-size: 11px; line-height: 1.4; }
        
        /* 🔵 CABECERA IDENTICA A image_da9673.png */
        .header-container { display: table; width: 100%; border: 2px solid #000; box-sizing: border-box; margin-bottom: 5px; }
        .blue-box { display: table-cell; bg-color: #00a8e8; background-color: #00a8e8; color: #000; padding: 15px; text-align: center; font-weight: bold; font-size: 14px; vertical-align: middle; }
        .blue-box .sub { font-size: 16px; margin-top: 5px; letter-spacing: 2px; font-weight: 900; }
        .green-box { display: table-cell; bg-color: #92d050; background-color: #92d050; color: #000; width: 90px; text-align: center; font-size: 38px; font-weight: bold; border-left: 2px solid #000; vertical-align: middle; font-family: monospace; }
        
        .center-order { text-align: center; font-size: 22px; font-weight: bold; margin: 10px 0; font-family: monospace; letter-spacing: -1px; }
        
        /* 📝 TABLAS DE FILIACIÓN ULTRA ESTRICTAS */
        .filiacion-table { width: 100%; border-collapse: collapse; margin-top: 5px; margin-bottom: 15px; table-layout: fixed; }
        .filiacion-table td { padding: 5px 2px; vertical-align: bottom; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .border-dotted { border-bottom: 1px dotted #000; font-weight: bold; font-size: 12px; font-family: monospace; text-align: center; padding-bottom: 1px; }
        .filiacion-label { font-size: 9px; color: #333; display: block; text-align: center; margin-top: 2px; border-top: 1px solid #000; width: 95%; margin-left: auto; margin-right: auto; padding-top: 1px; }
        
        .main-title { text-align: center; font-size: 15px; font-weight: bold; margin: 25px 0 15px 0; text-decoration: underline; letter-spacing: 1.5px; }
        
        /* 🧪 TABLA DE EXÁMENES */
        .results-table { width: 100%; border-collapse: collapse; margin-top: 15px; table-layout: fixed; }
        .results-table th, .results-table td { padding: 8px 12px; border: 1px solid #000; font-size: 11px; }
        .results-table th { background-color: #f2f2f2; font-weight: bold; text-align: left; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
        .val-bold { font-weight: bold; font-family: monospace; font-size: 13px; }
        .text-center { text-align: center; }

        .obs-box { margin-top: 25px; padding: 10px; border: 1px dashed #666; background-color: #fafafa; border-radius: 4px; }
        
        .footer-notes { position: fixed; bottom: 10px; left: 0; right: 0; display: flex; justify-content: space-between; font-size: 9px; border-top: 1px dashed #000; padding-top: 6px; }
      </style>
    </head>
    <body>

      <!-- 🔵 CABECERA COMPACTA DE DOS BLOQUES -->
      <div class="header-container">
        <div class="blue-box">
          ${v(institucion).toUpperCase()}<br>
          <div class="sub">QUÍMICAS</div>
        </div>
        <div class="green-box">${v(numeroOrden)}</div>
      </div>

      <!-- 🔢 CONSECUTIVO CENTRAL DE CONTROL -->
      <div class="center-order">${v(numeroOrden)}</div>

      <!-- 📝 LINEA SUPERIOR DE ASEGURADOS -->
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

      <!-- 📝 GRILLA DE DATOS GENERALES FILA 1 -->
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

      <!-- 📝 GRILLA DE DATOS GENERALES FILA 2 -->
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

      <div class="main-title">EXAMEN DE QUÍMICA SANGUÍNEA Y ANÁLISIS</div>

      <!-- 📊 RENDERS ESTRUCTURADOS CON FORMATO PROFESIONAL -->
      <table class="results-table">
        <thead>
          <tr>
            <th style="width: 40%;">Análisis Solicitado</th>
            <th style="width: 30%; text-align: center;">Resultado Obtenido</th>
            <th style="width: 30%;">Valores de Referencia</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><b>GLI</b> (Glucemia)</td>
            <td class="val-bold text-center">${glucemia !== "-" ? `${v(glucemia)} mg/dL` : "-"}</td>
            <td>70 - 110 mg/dL</td>
          </tr>
          <tr>
            <td><b>CREA</b> (Creatinina)</td>
            <td class="val-bold text-center">${creatinina !== "-" ? `${v(creatinina)} mg/dL` : "-"}</td>
            <td>0.6 - 1.2 mg/dL</td>
          </tr>
          <tr>
            <td><b>COL</b> (Colesterol Total)</td>
            <td class="val-bold text-center">${col !== "-" ? `${v(col)} mg/dL` : "-"}</td>
            <td>Hasta 200 mg/dL</td>
          </tr>
          <tr>
            <td><b>TRI</b> (Triglicéridos)</td>
            <td class="val-bold text-center">${tri !== "-" ? `${v(tri)} mg/dL` : "-"}</td>
            <td>Hasta 150 mg/dL</td>
          </tr>
          ${grupoSanguineoReal !== "-" ? `
          <tr style="background-color: #fff9f9;">
            <td><b>GRUPO SANGUÍNEO (ABO)</b></td>
            <td class="val-bold text-center" style="color: #d32f2f; font-size: 14px;">${v(grupoSanguineoReal).toUpperCase()}</td>
            <td>Factor Globular</td>
          </tr>
          ` : ''}
        </tbody>
      </table>

      ${observacionesQuimica !== "-" ? `
      <div class="obs-box">
        <b>Observaciones de Laboratorio:</b> ${v(observacionesQuimica)}
      </div>
      ` : ''}

      <!-- 📋 PIE DE INFORME OFICIAL -->
      <div class="footer-notes">
        <span><b>Elaborado por:</b> Asist. Dig. RIS-SERVER (CNS)</span>
        <span><b>Fecha de Emisión:</b> ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        <span><b>Hrs:</b> ${new Date().toLocaleTimeString().slice(0,5)}</span>
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