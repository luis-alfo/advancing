// Filtro temporal por mes de cierre: rango [desde, hasta] sobre los meses disponibles.
import React from 'react';
import {labelFromIndex} from '../lib/airtable';

export default function FiltroMeses({range, from, to, includeUndated, undatedCount, isAll, onChange, onToggleUndated, onReset}) {
  if (!range) return null;
  const opts = [];
  for (let i = range.min; i <= range.max; i++) opts.push(i);

  const sel =
    'text-xs bg-paper border border-line rounded-md px-2 py-1 text-ink focus:outline-none focus:ring-2 focus:ring-brand-300';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold text-navy">Mes de cierre</div>
        {!isAll && (
          <button type="button" onClick={onReset} className="text-[10px] text-brand hover:text-brand-700 transition-colors">
            Todo el periodo
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <select className={sel} value={from} onChange={(e) => onChange(Math.min(+e.target.value, to), to)}>
          {opts.map((i) => (
            <option key={i} value={i}>
              {labelFromIndex(i)}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-400">→</span>
        <select className={sel} value={to} onChange={(e) => onChange(from, Math.max(+e.target.value, from))}>
          {opts.map((i) => (
            <option key={i} value={i}>
              {labelFromIndex(i)}
            </option>
          ))}
        </select>
      </div>
      {undatedCount > 0 && (
        <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer select-none">
          <input type="checkbox" checked={includeUndated} onChange={onToggleUndated} className="accent-brand" />
          Incluir sin fecha de cierre ({undatedCount})
        </label>
      )}
    </div>
  );
}
