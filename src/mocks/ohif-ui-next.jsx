import React from 'react';

export const Header = () => null;
export const Onboarding = () => null;

// Avisos en pantalla (arriba a la derecha). Antes solo iban a la consola y no había
// `warning`, así que mensajes como "Falta la matrícula" no se veían.
const COLORES = {
  success: ['#064e3b', '#10b981'],
  error: ['#7f1d1d', '#ef4444'],
  warning: ['#78350f', '#f59e0b'],
  info: ['#0c4a6e', '#38bdf8'],
};

const mostrar = (tipo, msg) => {
  if (typeof document === 'undefined') return;
  let caja = document.getElementById('ris-avisos');
  if (!caja) {
    caja = document.createElement('div');
    caja.id = 'ris-avisos';
    caja.style.cssText =
      'position:fixed;top:16px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;max-width:min(380px,calc(100vw - 32px))';
    document.body.appendChild(caja);
  }
  const [fondo, borde] = COLORES[tipo];
  const aviso = document.createElement('div');
  aviso.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
  aviso.textContent = String(msg ?? '');
  aviso.style.cssText = `background:${fondo};border:1px solid ${borde};color:#fff;padding:10px 14px;border-radius:10px;font:600 13px/1.4 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.4);cursor:pointer;transition:opacity .3s`;
  const quitar = () => {
    aviso.style.opacity = '0';
    setTimeout(() => aviso.remove(), 300);
  };
  aviso.onclick = quitar;
  caja.appendChild(aviso);
  setTimeout(quitar, tipo === 'error' ? 6000 : 3500);
};

export const toast = {
  success: (msg) => mostrar('success', msg),
  error: (msg) => mostrar('error', msg),
  warning: (msg) => mostrar('warning', msg),
  info: (msg) => mostrar('info', msg),
};

export const useModal = () => ({
  show: (modalComponent) => console.log('Show modal:', modalComponent),
  hide: () => console.log('Hide modal'),
});
