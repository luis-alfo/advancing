// Ranking de agencias por nº de operaciones (Pareto): nombre · nº · % + mini-barra, ordenado desc,
// con una LÍNEA horizontal en el punto donde el acumulado alcanza el 80% de las operaciones vivas.
// El % y el corte se miden sobre el total de vivas (incluidas las sin agencia). Clic → toggle del filtro.
import React, {useMemo} from 'react';
import {paretoAgencias} from '../lib/deals';

const pctTxt = (x) => `${Math.round(x * 100)}%`;

export default function RankingAgencias({entries, total, selectedKey, onSelect}) {
  const p = useMemo(() => paretoAgencias(entries, total), [entries, total]);
  if (!p.rows.length) return <div className="text-xs text-slate-400 px-1 py-1">Sin agencias en este filtro.</div>;

  return (
    <div className="space-y-0.5">
      {p.rows.map((r, i) => {
        const sel = selectedKey === r.name;
        return (
          <React.Fragment key={r.name}>
            <button
              type="button"
              onClick={() => onSelect(r.name)}
              className={`w-full text-left rounded-md px-2 py-1 transition-colors ${sel ? 'bg-brand-50 ring-1 ring-brand-300' : 'hover:bg-canvas'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs truncate ${sel ? 'text-brand-700 font-semibold' : 'text-ink'}`} title={r.name}>{r.name}</span>
                <span className="text-xs tabular-nums shrink-0 text-slate-500">
                  <span className="font-semibold text-ink">{r.count}</span> · {pctTxt(r.pct)}
                </span>
              </div>
              <div className="mt-1 h-1 rounded-full bg-line overflow-hidden">
                <div className="h-full rounded-full bg-mint-500" style={{width: `${p.maxCount ? (r.count / p.maxCount) * 100 : 0}%`}} />
              </div>
            </button>

            {p.reaches80 && p.cutIndex === i && (
              <div className="flex items-center gap-2 px-1 py-0.5 select-none" aria-hidden="true">
                <div className="h-px flex-1 bg-brand-400" />
                <span className="text-[10px] font-semibold text-brand-700 whitespace-nowrap tabular-nums">
                  {pctTxt(p.threshold)} acumulado · {p.cutIndex + 1} {p.cutIndex === 0 ? 'agencia' : 'agencias'}
                </span>
                <div className="h-px flex-1 bg-brand-400" />
              </div>
            )}
          </React.Fragment>
        );
      })}

      {p.otherAgencias > 0 && (
        <div className="flex items-center justify-between gap-2 px-2 py-1 text-xs text-slate-400">
          <span className="truncate">+ otras {p.otherAgencias} agencias</span>
          <span className="tabular-nums shrink-0">{p.otherCount} · {pctTxt(p.otherPct)}</span>
        </div>
      )}

      {p.sinAgencia > 0 && (
        <div className="flex items-center justify-between gap-2 px-2 py-1 text-xs italic text-slate-400">
          <span className="truncate">Sin agencia</span>
          <span className="tabular-nums shrink-0 not-italic">{p.sinAgencia} · {pctTxt(p.sinAgenciaPct)}</span>
        </div>
      )}

      {!p.reaches80 && (
        <div className="px-2 pt-1 text-[10px] leading-snug text-slate-400">
          Las agencias no concentran el {pctTxt(p.threshold)} de las operaciones vivas.
        </div>
      )}
    </div>
  );
}
