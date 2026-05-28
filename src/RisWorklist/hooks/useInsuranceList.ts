/**
 * useInsuranceList — Hook para gestionar el catálogo de aseguradoras.
 *
 * - La lista base (SEGUROS_BOLIVIA) es inmutable y siempre está disponible.
 * - Las aseguradoras personalizadas se persisten en localStorage.
 * - Expone `addCustomInsurer(name)` para añadir una nueva entrada.
 * - La lista combinada `allInsurers` fusiona base + personalizadas (sin duplicados).
 */

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'ris_custom_insurers';

export const SEGUROS_BOLIVIA: { group: string; nombre: string; poliza: string }[] = [
  // 🟢 Seguridad Social (Cajas)
  { group: 'Seguridad Social (Cajas)', nombre: 'Caja Nacional de Salud (CNS)',       poliza: 'seguro_social_corto_plazo' },
  { group: 'Seguridad Social (Cajas)', nombre: 'Caja Petrolera de Salud (CPS)',      poliza: 'seguro_social_sectorial' },
  { group: 'Seguridad Social (Cajas)', nombre: 'Caja Bancaria Estatal de Salud',     poliza: 'seguro_social_sectorial' },
  { group: 'Seguridad Social (Cajas)', nombre: 'Caja de Salud de la Banca Privada',  poliza: 'seguro_social_sectorial' },
  { group: 'Seguridad Social (Cajas)', nombre: 'Caja de Salud CORDES',               poliza: 'seguro_social_corto_plazo' },
  { group: 'Seguridad Social (Cajas)', nombre: 'Caja de Salud de Caminos',           poliza: 'seguro_social_sectorial' },
  { group: 'Seguridad Social (Cajas)', nombre: 'Seguro Social Universitario',        poliza: 'seguro_social_universitario' },
  { group: 'Seguridad Social (Cajas)', nombre: 'COSSMIL (Seguro Social Militar)',    poliza: 'seguro_social_militar' },
  // 🟡 Seguro Público Universal
  { group: 'Seguro Público Universal', nombre: 'Sistema Único de Salud (SUS)',       poliza: 'seguro_publico_gratuito' },
  // 🔵 Seguros Privados
  { group: 'Seguros Privados',         nombre: 'Nacional Seguros',                   poliza: 'seguro_salud_privado' },
  { group: 'Seguros Privados',         nombre: 'BISA Seguros',                       poliza: 'seguro_salud_privado' },
  { group: 'Seguros Privados',         nombre: 'Alianza Seguros',                    poliza: 'seguro_salud_privado' },
  { group: 'Seguros Privados',         nombre: 'La Boliviana Ciacruz',               poliza: 'seguro_salud_privado' },
  { group: 'Seguros Privados',         nombre: 'Fortaleza Seguros',                  poliza: 'seguro_salud_privado' },
  // 🏥 Prestadores Privados
  { group: 'Prestadores Privados',     nombre: 'Clínica Modelo',                     poliza: 'prestador_privado' },
  { group: 'Prestadores Privados',     nombre: 'Clínica Alemana',                    poliza: 'prestador_privado' },
  { group: 'Prestadores Privados',     nombre: 'Clínica Foianini',                   poliza: 'prestador_privado' },
  { group: 'Prestadores Privados',     nombre: 'Hospital Metodista',                 poliza: 'prestador_privado' },
];

const BASE_NAMES = new Set(SEGUROS_BOLIVIA.map(s => s.nombre.toLowerCase()));

/** Lee las aseguradoras personalizadas del localStorage */
function readCustom(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Hook principal */
export function useInsuranceList() {
  const [custom, setCustom] = useState<string[]>(readCustom);

  /** Todas las entradas (base + personalizadas) */
  const allInsurers = [
    ...SEGUROS_BOLIVIA,
    ...custom.map(n => ({ group: 'Personalizadas', nombre: n, poliza: 'personalizado' })),
  ];

  /** Devuelve true si el nombre ya existe en la lista (insensible a mayúsculas) */
  const exists = useCallback(
    (name: string) =>
      BASE_NAMES.has(name.trim().toLowerCase()) ||
      custom.some(c => c.toLowerCase() === name.trim().toLowerCase()),
    [custom]
  );

  /** Agrega un nuevo nombre al catálogo personalizado y lo persiste */
  const addCustomInsurer = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCustom(prev => {
      if (prev.some(c => c.toLowerCase() === trimmed.toLowerCase())) return prev;
      const next = [...prev, trimmed];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  /** Elimina una aseguradora personalizada */
  const removeCustomInsurer = useCallback((name: string) => {
    setCustom(prev => {
      const next = prev.filter(c => c.toLowerCase() !== name.trim().toLowerCase());
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return { allInsurers, custom, exists, addCustomInsurer, removeCustomInsurer };
}
