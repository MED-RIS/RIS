// Comprobante de programación: hoja que caja entrega al paciente al preprogramarlo. Lleva
// su día, sus exámenes, las indicaciones de cada examen y un QR del sistema; el día que
// vuelve se escanea ese QR y el sistema lo encuentra y lo marca como "Llegó".
// (El QR de la boleta CNS no sirve para esto: viene sin los datos del paciente.)
import qrcode from '../../vendor/qrcode-generator';
import { UNIDAD_SANITARIA } from '../pacienteExcel';

// Indicaciones para el paciente según el examen (a confirmar con el laboratorio)
const INDICACIONES: Record<string, string> = {
  QMC_SANGUINEA: 'Venir en ayunas (8 a 12 horas sin comer).',
  HORMONAS: 'Venir en ayunas y temprano.',
  EGO: 'Traer la primera orina de la mañana en un frasco limpio.',
  COPROLOGIA: 'Traer muestra de heces del día en un frasco limpio.',
  H_PYLORI_SANGRE_OCULTA: 'Traer muestra de heces del día en un frasco limpio.',
};

// Horario de toma de muestras para imprimir; vacío = no se imprime (a confirmar)
const HORARIO_MUESTRAS = '';

// Lo que va dentro del QR: el id de la preprogramación y su día
export const textoQrComprobante = (f: any) => `PRG:${f._id}:${f.fechaExamen}`;

export const leerQrComprobante = (texto: string): { id: string; fecha: string } | null => {
  const m = String(texto || '').trim().match(/^PRG:([a-f0-9]{24}):(\d{4}-\d{2}-\d{2})$/i);
  return m ? { id: m[1], fecha: m[2] } : null;
};

// Número corto para leer a la vista (los últimos caracteres del id)
export const numeroComprobante = (f: any) => `PRG-${String(f._id || '').slice(-6).toUpperCase()}`;

const esc = (s: any) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

export function imprimirComprobante(f: any, nombre: string, examenes: { id: string; label: string }[]) {
  const v = window.open('', '_blank');
  if (!v) return false;

  const qr = qrcode(0, 'M');
  qr.addData(textoQrComprobante(f));
  qr.make();
  const svgQr = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });

  const [a, m, d] = String(f.fechaExamen).split('-').map(Number);
  const dia = new Date(a, m - 1, d).toLocaleDateString('es-BO', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  const indicaciones = [...new Set(examenes.map((e) => INDICACIONES[e.id]).filter(Boolean)), 'Traer este comprobante y su boleta CNS.'];
  const creado = f.createdAt ? new Date(f.createdAt).toLocaleString('es-BO') : '';

  v.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Comprobante ${esc(numeroComprobante(f))}</title>
<style>@page{size:A5 portrait;margin:10mm}body{font-family:Arial,sans-serif;font-size:10.5pt;color:#111;margin:0}
.hoja{border:1.5px solid #0b3d33;border-radius:8px;padding:14px 16px;max-width:520px;margin:auto}
.cab{text-align:center;border-bottom:2px solid #0b3d33;padding-bottom:8px;margin-bottom:10px}
.cab b{display:block;font-size:10pt;letter-spacing:.5px}.cab h1{margin:4px 0 0;font-size:13pt;color:#0b3d33}
.fila{margin:4px 0}.et{color:#555;font-size:9pt;text-transform:uppercase;letter-spacing:.4px}
.dia{font-size:14pt;font-weight:bold;color:#0b3d33;text-transform:capitalize;margin:2px 0 8px}
.emerg{display:inline-block;background:#b91c1c;color:#fff;font-weight:bold;font-size:9pt;padding:2px 8px;border-radius:4px;margin-left:6px}
ul{margin:4px 0 8px;padding-left:18px}li{margin:2px 0}
.pie{display:flex;justify-content:space-between;align-items:flex-end;margin-top:10px;border-top:1px dashed #999;padding-top:8px}
.qr{width:120px;height:120px}.qr svg{width:100%;height:100%}.num{font-weight:bold;font-size:11pt;text-align:center;margin-top:2px}
.peq{font-size:8.5pt;color:#555}</style></head><body><div class="hoja">
<div class="cab"><b>CNS · ${esc(UNIDAD_SANITARIA)} · LABORATORIO</b><h1>COMPROBANTE DE PROGRAMACIÓN</h1></div>
<div class="fila"><span class="et">Paciente</span><br><b>${esc(nombre)}</b>${f.emergencia ? '<span class="emerg">EMERGENCIA</span>' : ''}</div>
<div class="fila"><span class="et">Matrícula</span><br><b>${esc(f.matricula)}</b></div>
<div class="fila" style="margin-top:8px"><span class="et">Venga el día</span><div class="dia">${esc(dia)}</div></div>
${HORARIO_MUESTRAS ? `<div class="fila"><span class="et">Hora de toma de muestra</span><br><b>${esc(HORARIO_MUESTRAS)}</b></div>` : ''}
<div class="fila"><span class="et">Exámenes</span><ul>${examenes.map((e) => `<li>${esc(e.label)}</li>`).join('')}</ul></div>
<div class="fila"><span class="et">Indicaciones</span><ul>${indicaciones.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
<div class="pie"><div class="peq">${f.creadoPor ? `Programó: ${esc(f.creadoPor)}<br>` : ''}${esc(creado)}</div>
<div><div class="qr">${svgQr}</div><div class="num">${esc(numeroComprobante(f))}</div></div></div>
</div><script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`);
  v.document.close();
  return true;
}
