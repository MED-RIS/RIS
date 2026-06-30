// src/RisWorklist/reports/ReporteQuimica.ts

export const imprimirQuimicaSanguineaCNS = (p: any) => {
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
  
  // 🌟 SECUENCIAL DINÁMICO IDÉNTICO A LOS OTROS REPORTES:
  // Filtra y limpia el timestamp largo (Date.now()) obligándolo a tomar el consecutivo limpio del historial
  const numeroSecuencialLimpio = 
    p.orden && String(p.orden).length < 6 ? String(p.orden) :
    d.orden && String(d.orden).length < 6 ? String(d.orden) :
    p.numero_orden && String(p.numero_orden).length < 6 ? String(p.numero_orden) :
    d.numero_orden && String(d.numero_orden).length < 6 ? String(d.numero_orden) : 
    "1"; // Respaldo por si es el primer registro de la sesión
  
  const aseguradoReal = p.codigoAsegurado ?? p.cod ?? d.codigoAsegurado ?? d.cod ?? "-";
  const medico = p.medico_solicitante ?? p.medicoSolicitante ?? d.medico_solicitante ?? d.medicoSolicitante ?? "-";
  const centro = p.centro_asistencial ?? p.centroAsistencial ?? d.centro_asistencial ?? d.centroAsistencial ?? "-";
  const servicio = p.servicio ?? d.servicio ?? "";
  const consultorio = p.consultorio ?? d.consultorio ?? "-";
  const fechaSolicitud = p.fecha ?? p.fecha_solicitud ?? d.fecha ?? d.fecha_solicitud ?? "-";

  // 🧪 JALANDO PARÁMETROS DE QUÍMICA SANGUÍNEA (Aplanados o dentro de quimicaDatos)
  const q = d.quimicaDatos || d || {};
  
  // Columna 1
  const gli = q.gli ?? q.glicemia ?? "-";
  const hba1c = q.hba1c ?? q.hb_glicosilada ?? "-";
  const nus = q.nus ?? "-";
  const urea = q.urea ?? "-";
  const crea = q.crea ?? q.creatinina ?? "-";
  const acido_urico = q.acido_urico ?? q.acidoUrico ?? "-";
  const amilas = q.amilas ?? q.amilasa ?? "-";
  const prot = q.prot ?? q.proteinas_totales ?? "-";
  const alb = q.alb ?? q.albumina ?? "-";

  // Columna 2
  const col = q.col ?? q.colesterol ?? "-";
  const tri = q.tri ?? q.trigliceridos ?? "-";
  const hdl = q.hdl ?? "-";
  const ldl = q.ldl ?? "-";
  const vldl = q.vldl ?? "-";
  const got = q.got ?? q.tgo ?? "-";
  const gpt = q.gpt ?? q.tgp ?? "-";
  const fal = q.fal ?? q.pal ?? "-";
  const bd = q.bd ?? q.bil_directa ?? "-";
  const bi = q.bi ?? q.bil_indirecta ?? "-";
  const bt = q.bt ?? q.bil_total ?? "-";
  
  const observaciones = q.observaciones ?? q.nota_observaciones ?? "-";

  const htmlContent = `
    <html>
    <head>
      <meta charset="utf-8">
      <title>CNS_Quimica_${pacienteNombre.replace(/ /g, "_")}</title>
      <style>
        @page { size: letter; margin: 40px; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #000; margin: 0; padding: 0; font-size: 11px; line-height: 1.3; }
        
        /* 🎛️ BOTÓN INTERACTIVO COMPACTO ABAJO A LA DERECHA (No tapa nada) */
        .no-print-btn {
          position: fixed;
          bottom: 25px;
          right: 25px;
          background-color: #00bfa5; 
          color: white;
          border: 1.5px solid #ffffff;
          padding: 8px 14px;
          font-size: 11px;
          font-weight: bold;
          border-radius: 6px;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,0,0,0.4);
          font-family: Arial, sans-serif;
          z-index: 9999;
          transition: all 0.2s ease;
        }
        .no-print-btn:hover { background-color: #008c7a; transform: scale(1.03); }
        @media print { .no-print-btn { display: none !important; } }

        /* 🔵 CABECERA INSTITUCIONAL OFICIAL */
        .header-container { display: table; width: 100%; border: 2px solid #000; box-sizing: border-box; margin-bottom: 5px; }
        .blue-box { display: table-cell; background-color: #00a8e8; color: #000; padding: 12px; text-align: center; font-weight: bold; font-size: 13px; vertical-align: middle; }
        .blue-box .sub { font-size: 15px; margin-top: 4px; letter-spacing: 2px; font-weight: 900; }
        .green-box { display: table-cell; background-color: #92d050; color: #000; width: 90px; text-align: center; font-size: 38px; font-weight: bold; border-left: 2px solid #000; vertical-align: middle; font-family: monospace; }
        
        .center-order { text-align: center; font-size: 20px; font-weight: bold; margin: 8px 0; font-family: monospace; }
        
        /* 📝 TABLAS DE FILIACIÓN CON RAYA PUNTEADA */
        .filiacion-table { width: 100%; border-collapse: collapse; margin-top: 3px; margin-bottom: 10px; table-layout: fixed; }
        .filiacion-table td { padding: 4px 2px; vertical-align: bottom; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .border-dotted { border-bottom: 1px dotted #000; font-weight: bold; font-size: 11px; font-family: monospace; text-align: center; padding-bottom: 1px; }
        .filiacion-label { font-size: 9px; color: #333; display: block; text-align: center; margin-top: 2px; border-top: 1px solid #000; width: 95%; margin-left: auto; margin-right: auto; padding-top: 1px; }
        
        .main-title { text-align: center; font-size: 14px; font-weight: bold; margin: 15px 0 10px 0; text-decoration: underline; letter-spacing: 1px; }
        
        /* 📊 DISTRIBUCIÓN DE DOS COLUMNAS REFORZADA */
        .quimica-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 10px; padding: 0 10px; }
        .quimica-col { display: flex; flex-direction: column; gap: 4px; }
        
        .item-row { display: flex; align-items: bottom; font-size: 11px; min-height: 18px; }
        .label-name { width: 140px; font-weight: bold; text-transform: uppercase; }
        .label-short { width: 55px; font-family: monospace; color: #333; }
        .label-unit { width: 50px; color: #444; }
        .val-box { width: 60px; font-weight: bold; font-family: monospace; font-size: 12px; text-align: right; padding-right: 10px; }
        .ref-box { color: #555; font-size: 11px; }
      </style>
    </head>
    <body>

      <button class="no-print-btn" onclick="window.print()">🖨️ IMPRIMIR / REPORTE PDF</button>

      <!-- 🔵 CABECERA AZUL / VERDE -->
      <div class="header-container">
        <div class="blue-box">
          ${v(institucion).toUpperCase()}<br>
          <div class="sub">QUÍMICAS</div>
        </div>
        <!-- 🌟 CORREGIDO: Cuadro verde ahora muestra el secuencial limpio (1, 2, 3...) -->
        <div class="green-box">${v(numeroSecuencialLimpio)}</div>
      </div>

      <!-- 🌟 CORREGIDO: El centro ahora muestra el secuencial limpio -->
      <div class="center-order">${v(numeroSecuencialLimpio)}</div>

      <!-- 📝 FILA SUPERIOR -->
      <table class="filiacion-table" style="margin-bottom: 5px;">
        <tr>
          <td style="width: 42%; text-align: right; padding-right: 8px; font-weight: bold;">Nº de Asegurado:</td>
          <td style="width: 23%;" class="border-dotted">${v(aseguradoReal)}</td>
          <td style="width: 14%; text-align: right; padding-right: 8px; font-weight: bold;">Cod. Asegurado:</td>
          <td style="width: 8%;" class="border-dotted">${v(codBeneficiario)}</td>
          <td style="width: 8%; text-align: right; padding-right: 8px; font-weight: bold;">Edad:</td>
          <td style="width: 5%;" class="border-dotted">${v(edad)}</td>
        </tr>
      </table>

      <!-- 📝 FILIACIÓN BLOQUE 1 -->
      <table class="filiacion-table">
        <tr>
          <td style="width: 33%;" class="border-dotted">${v(medico).toUpperCase()}</td>
          <!-- 🌟 CORREGIDO: Aquí mapeamos el centro asistencial dinámico tal como pide image_12214e.png -->
          <td style="width: 33%;" class="border-dotted">${v(centro).toUpperCase()}</td>
          <td style="width: 34%;" class="border-dotted">${pacienteNombre}</td>
        </tr>
        <tr>
          <td><span class="filiacion-label">Medico Solicitante</span></td>
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
          <td><span class="filiacion-label">Policlinico o Servicio</span></td>
          <td><span class="filiacion-label">Consultorio</span></td>
          <td><span class="filiacion-label">Fecha de Solicitud</span></td>
        </tr>
      </table>

      <div class="main-title">QUIMICA SANGUINEA</div>

      <!-- 📊 DOS COLUMNAS DE ANÁLISIS QUÍMICOS -->
      <div class="quimica-grid">
        
        <!-- COLUMNA IZQUIERDA -->
        <div class="quimica-col">
          <div class="item-row"><span class="label-name">Glicemia</span><span class="label-short">GLI</span><span class="label-unit">mg/dl</span><span class="val-box">${v(gli)}</span><span class="ref-box">(70 - 110)</span></div>
          <div class="item-row"><span class="label-name">Hb Glicosilada</span><span class="label-short">HBA 1C</span><span class="label-unit">%</span><span class="val-box">${v(hba1c)}</span><span class="ref-box">(4 - 6)</span></div>
          <div class="item-row"><span class="label-name">Nus</span><span class="label-short">NUS</span><span class="label-unit">mg/dl</span><span class="val-box">${v(nus)}</span><span class="ref-box">(7 - 21)</span></div>
          <div class="item-row"><span class="label-name">Urea</span><span class="label-short">UREA</span><span class="label-unit">mg/dl</span><span class="val-box">${v(urea)}</span><span class="ref-box">(15 - 45)</span></div>
          <div class="item-row"><span class="label-name">Creatinina</span><span class="label-short">CREA</span><span class="label-unit">mg/dl</span><span class="val-box">${v(crea)}</span><span class="ref-box">(0.4 - 1.4)</span></div>
          <div class="item-row"><span class="label-name">Acido Urico</span><span class="label-short">ACIDO U.</span><span class="label-unit">mg/dl</span><span class="val-box">${v(acido_urico)}</span><span class="ref-box">(2.4 - 7.0)</span></div>
          <div class="item-row"><span class="label-name">Amilasa</span><span class="label-short">AMILAS</span><span class="label-unit">U/l</span><span class="val-box">${v(amilas)}</span><span class="ref-box">(<125)</span></div>
          <div class="item-row"><span class="label-name">Proteinas Totales</span><span class="label-short">PROT</span><span class="label-unit">g/dl</span><span class="val-box">${v(prot)}</span><span class="ref-box">(6.4 - 8.3)</span></div>
          <div class="item-row"><span class="label-name">Albumina</span><span class="label-short">ALB</span><span class="label-unit">g/dl</span><span class="val-box">${v(alb)}</span><span class="ref-box">(3.5 - 5.0)</span></div>
        </div>

        <!-- COLUMNA DERECHA -->
        <div class="quimica-col">
          <div class="item-row"><span class="label-name">Colesterol</span><span class="label-short">COL</span><span class="label-unit">mg/dl</span><span class="val-box">${v(col)}</span><span class="ref-box">(120-190)</span></div>
          <div class="item-row"><span class="label-name">Triglicerid.</span><span class="label-short">TRI</span><span class="label-unit">mg/dl</span><span class="val-box">${v(tri)}</span><span class="ref-box">(60-150)</span></div>
          <div class="item-row"><span class="label-name">Hdl</span><span class="label-short">HDL</span><span class="label-unit">mg/dl</span><span class="val-box">${v(hdl)}</span><span class="ref-box">(>55)</span></div>
          <div class="item-row"><span class="label-name">Ldl</span><span class="label-short">LDL</span><span class="label-unit">mg/dl</span><span class="val-box">${v(ldl)}</span><span class="ref-box">(<150)</span></div>
          <div class="item-row"><span class="label-name">Vldl</span><span class="label-short">VLDL</span><span class="label-unit">mg/dl</span><span class="val-box">${v(vldl)}</span><span class="ref-box">-</span></div>
          <div class="item-row"><span class="label-name">T.G.O.</span><span class="label-short">GOT</span><span class="label-unit">U/l</span><span class="val-box">${v(got)}</span><span class="ref-box">(10-39)</span></div>
          <div class="item-row"><span class="label-name">T.G.P.</span><span class="label-short">GPT</span><span class="label-unit">U/l</span><span class="val-box">${v(gpt)}</span><span class="ref-box">(10-37)</span></div>
          <div class="item-row"><span class="label-name">Pal</span><span class="label-short">FAL</span><span class="label-unit">U/l</span><span class="val-box">${v(fal)}</span><span class="ref-box">(hasta 115)</span></div>
          <div class="item-row"><span class="label-name">Bil. Directa</span><span class="label-short">BD</span><span class="label-unit">mg/dl</span><span class="val-box">${v(bd)}</span><span class="ref-box">(hasta 0.3)</span></div>
          <div class="item-row"><span class="label-name">Bil. Indirecta</span><span class="label-short">BI</span><span class="label-unit">mg/dl</span><span class="val-box">${v(bi)}</span><span class="ref-box">(hasta 0.7)</span></div>
          <div class="item-row"><span class="label-name">Bil. Total</span><span class="label-short">BT</span><span class="label-unit">mg/dl</span><span class="val-box">${v(bt)}</span><span class="ref-box">(hasta 1)</span></div>
        </div>

      </div>

      <!-- OBSERVACIONES -->
      <div style="margin-top: 20px; padding: 0 10px; font-size: 11px;">
        <b>NOTA OBSERVACIONES:</b> ${v(observaciones)}
      </div>

      <!-- 📋 PIE DE INFORME OFICIAL -->
      <div style="position: fixed; bottom: 15px; left: 10px; right: 10px; display: flex; justify-content: space-between; font-size: 9px; border-top: 1px dashed #000; padding-top: 4px;">
        <span>Elaborada por: Asist. Dig. RIS-SERVER (CNS)</span>
        <span>Fecha de Reporte: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        <span>Hrs: ${new Date().toLocaleTimeString().slice(0,5)}</span>
      </div>

    </body>
    </html>
  `;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(htmlContent);
    win.document.close();
  }
};