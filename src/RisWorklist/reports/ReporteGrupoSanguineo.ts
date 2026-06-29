// src/RisWorklist/reports/ReporteGrupoSanguineo.ts

export const imprimirGrupoSanguineoUnicoCNS = (p: any) => {
  const d = p.datos || p || {};
  
  const v = (val: any) => {
    if (val === undefined || val === null || val === "") return "-";
    return String(val);
  };

  // Extracción 100% dinámica de filiación
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

  // Buscamos el grupo sanguíneo tanto en la raíz como en las bolsas internas (hematoDatos o quimicaDatos)
  const grupoSanguineoReal = p.grupo_sanguineo ?? d.grupo_sanguineo ?? d.grupoSanguineo ?? "-";

  const htmlContent = `
    <html>
    <head>
      <meta charset="utf-8">
      <title>CNS_GrupoSanguineo_${pacienteNombre.replace(/ /g, "_")}</title>
      <style>
        @page { size: letter; margin: 40px; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #000; margin: 0; padding: 0; font-size: 11px; line-height: 1.4; }
        
        /* 🔵 CABECERA INSTITUCIONAL (Formato exacto image_dc1179.png) */
        .header-container { display: table; width: 100%; border: 2px solid #000; box-sizing: border-box; margin-bottom: 5px; }
        .blue-box { display: table-cell; background-color: #00a8e8; color: #000; padding: 15px; text-align: center; font-weight: bold; font-size: 14px; vertical-align: middle; }
        .blue-box .sub { font-size: 16px; margin-top: 5px; letter-spacing: 2px; font-weight: 900; }
        .green-box { display: table-cell; background-color: #92d050; color: #000; width: 90px; text-align: center; font-size: 38px; font-weight: bold; border-left: 2px solid #000; vertical-align: middle; font-family: monospace; }
        
        .center-order { text-align: center; font-size: 22px; font-weight: bold; margin: 10px 0; font-family: monospace; }
        
        /* 📝 LINEAS DE FILIACIÓN */
        .filiacion-table { width: 100%; border-collapse: collapse; margin-top: 5px; margin-bottom: 15px; table-layout: fixed; }
        .filiacion-table td { padding: 5px 2px; vertical-align: bottom; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .border-dotted { border-bottom: 1px dotted #000; font-weight: bold; font-size: 12px; font-family: monospace; text-align: center; padding-bottom: 1px; }
        .filiacion-label { font-size: 9px; color: #333; display: block; text-align: center; margin-top: 2px; border-top: 1px solid #000; width: 95%; margin-left: auto; margin-right: auto; padding-top: 1px; }
        
        .main-title { text-align: center; font-size: 15px; font-weight: bold; margin: 40px 0 30px 0; text-decoration: underline; letter-spacing: 1.5px; }
        
        /* 🩸 SECCIÓN GRUPO SANGUÍNEO ESPACIADO */
        .resultado-unico-container { 
          margin: 60px 0 100px 0; 
          display: flex; 
          justify-content: space-between; 
          padding: 0 80px; 
          font-size: 15px; 
          font-weight: bold;
        }
        .res-val { font-family: monospace; font-size: 18px; letter-spacing: 1px; }

        .footer-notes { position: fixed; bottom: 10px; left: 0; right: 0; display: flex; justify-content: space-between; font-size: 9px; border-top: 1px dashed #000; padding-top: 6px; }
      </style>
    </head>
    <body>

      <!-- 🔵 CABECERA AZUL / VERDE -->
      <div class="header-container">
        <div class="blue-box">
          ${v(institucion).toUpperCase()}<br>
          <div class="sub">QUÍMICAS</div>
        </div>
        <div class="green-box">${v(numeroOrden)}</div>
      </div>

      <div class="center-order">${v(numeroOrden)}</div>

      <!-- 📝 FILA SUPERIOR -->
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

      <!-- 📝 FILIACIÓN BLOQUE 1 -->
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

      <!-- 📝 FILIACIÓN BLOQUE 2 -->
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

      <!-- 🏷️ SUBRAYADO CENTRAL -->
      <div class="main-title">HEMATOLOGIA</div>

      <!-- 🩸 VALOR DEL GRUPO SANGUÍNEO ESPACIADO EN DOS EXTREMOS (Igual a image_dc1179.png) -->
      <div class="resultado-unico-container">
        <span>GRUPO SANGUINEO:</span>
        <span class="res-val">${v(grupoSanguineoReal).toUpperCase()}</span>
      </div>

      <!-- 📋 PIE DE INFORME OFICIAL -->
      <div class="footer-notes">
        <span><b>Elaborado por:</b> Asist. Dig. RIS-SERVER (CNS)</span>
        <span><b>Fecha de Reporte:</b> ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
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