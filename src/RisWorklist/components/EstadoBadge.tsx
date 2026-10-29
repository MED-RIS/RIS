import React from 'react';
import { Clock, CheckCircle2, Lock, CalendarClock, UserCheck, UserX } from 'lucide-react';

// Mismo color e ícono para cada estado en todo el sistema (lista de informes, editor,
// histórico del paciente y preprogramación)
const ESTILOS: Record<string, { texto: string; clase: string; Icono: React.ComponentType<{ className?: string }> }> = {
  BORRADOR: { texto: 'Borrador', clase: 'bg-amber-500/10 text-amber-300 border-amber-500/30', Icono: Clock },
  COMPLETADO: { texto: 'Completado', clase: 'bg-sky-500/10 text-sky-300 border-sky-500/30', Icono: CheckCircle2 },
  FIRMADO: { texto: 'Firmado', clase: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30', Icono: Lock },
  PROGRAMADO: { texto: 'Programado', clase: 'bg-slate-500/10 text-slate-300 border-slate-400/30', Icono: CalendarClock },
  ASISTIO: { texto: 'Llegó', clase: 'bg-teal-500/10 text-teal-300 border-teal-500/30', Icono: UserCheck },
  NO_VINO: { texto: 'No vino', clase: 'bg-red-500/10 text-red-300 border-red-500/30', Icono: UserX },
};

export default function EstadoBadge({ estado, grande = false }: { estado?: string; grande?: boolean }) {
  const e = ESTILOS[String(estado || '').toUpperCase()];
  const tam = grande ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px]';
  if (!e) {
    return <span className={`inline-flex items-center rounded-full border font-bold bg-white/5 text-gray-300 border-white/10 ${tam}`}>{estado || '—'}</span>;
  }
  const { Icono } = e;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-bold uppercase tracking-wide whitespace-nowrap ${e.clase} ${tam}`}>
      <Icono className={grande ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
      {e.texto}
    </span>
  );
}
