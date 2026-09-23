import { renderizarEImprimir } from "./_reporteBase";

interface ResumenCajaDiaria {
  orders: number;
  billed: number;
  insurance: number;
  patient: number;
  pending: number;
  paid: number;
  byMethod: Record<string, number>;
}

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
  INSURANCE: "Seguro",
  OTHER: "Otro",
};

const fmt = (n: number) =>
  `$${new Intl.NumberFormat("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;

export const imprimirResumenCajaDiaria = (resumen: ResumenCajaDiaria) => {
  const fecha = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const filasMetodo = Object.entries(resumen.byMethod).length
    ? Object.entries(resumen.byMethod)
        .map(
          ([metodo, monto]) => `
        <tr>
          <td style="text-align:left;">${PAYMENT_LABELS[metodo] || metodo}</td>
          <td style="text-align:right; font-weight:bold;">${fmt(monto)}</td>
        </tr>`
        )
        .join("")
    : `<tr><td colspan="2" style="text-align:center; color:#666;">Todavía no hay pagos registrados hoy.</td></tr>`;

  const cuerpo = `
    <div class="header-container">
      <div class="blue-box" style="background-color:#0891b2;">
        RESUMEN DE CAJA<br>
        <div class="sub">DEL DÍA</div>
      </div>
      <div class="green-box">${resumen.orders}</div>
    </div>

    <p style="text-align:center; margin: 10px 0 20px; font-size: 12px; color:#333;">${fecha}</p>

    <table class="filiacion-table" style="margin-bottom: 16px;">
      <tr>
        <td style="width:50%; text-align:left; font-weight:bold;">Total facturado</td>
        <td style="width:50%; text-align:right; font-size:16px; font-weight:bold;">${fmt(resumen.billed)}</td>
      </tr>
      <tr>
        <td style="text-align:left; font-weight:bold;">Cubre el seguro</td>
        <td style="text-align:right;">${fmt(resumen.insurance)}</td>
      </tr>
      <tr>
        <td style="text-align:left; font-weight:bold;">Paga el paciente</td>
        <td style="text-align:right;">${fmt(resumen.patient)}</td>
      </tr>
    </table>

    <div class="main-title" style="font-size:13px;">RECAUDACIÓN POR MÉTODO DE PAGO</div>
    <table class="filiacion-table">
      ${filasMetodo}
    </table>

    <div class="obs-box">
      <div><b>Órdenes del día:</b> ${resumen.orders}</div>
      <div><b>Pagos recibidos:</b> ${resumen.paid}</div>
      <div><b>Pagos pendientes:</b> ${resumen.pending}</div>
    </div>
  `;

  renderizarEImprimir(`Resumen_Caja_${new Date().toISOString().slice(0, 10)}`, cuerpo, "");
};
