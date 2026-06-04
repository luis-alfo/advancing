// Mini-gráfico de barras para una faceta (canal / producto / tipo de contrato).
// Clic en un valor → activa/desactiva el filtro por ese valor.
import React from 'react';

export default function Facetas({title, entries, active, onToggle}) {
  if (!entries || entries.length === 0) return null;
  const max = entries.reduce((m, [, n]) => Math.max(m, n), 0) || 1;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-1.5">{title}</div>
      <div className="space-y-1.5">
        {entries.map(([k, n]) => {
          const sel = active === k;
          return (
            <button key={k} type="button" onClick={() => onToggle(k)} className="w-full text-left">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className={`text-[11px] truncate ${sel ? 'text-brand-700 font-semibold' : 'text-ink'}`}>{k}</span>
                <span className="text-[11px] tabular-nums text-slate-500">{n}</span>
              </div>
              <div className="h-1.5 rounded-full bg-line overflow-hidden">
                <div className={`h-full rounded-full transition-all ${sel ? 'bg-mint-500' : 'bg-brand group-hover:bg-brand-600'}`} style={{width: `${(n / max) * 100}%`}} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
