// Ranking de provincias por nº de deals (con barra de proporción y % sobre el total filtrado).
import React, {useMemo} from 'react';
import {PROVINCE_NAME} from '../lib/geo';

export default function PanelRanking({byProvince, total, selectedId, onSelect}) {
  const rows = useMemo(() => {
    const r = [...byProvince.entries()].map(([ine, count]) => ({ine, name: PROVINCE_NAME.get(ine) || ine, count}));
    r.sort((a, b) => b.count - a.count);
    return r;
  }, [byProvince]);
  const max = rows.length ? rows[0].count : 0;
  if (!rows.length) return <div className="text-xs text-slate-400 px-1 py-2">Sin deals en este filtro.</div>;

  return (
    <div className="space-y-0.5">
      {rows.map((r) => {
        const sel = selectedId === r.ine;
        const pct = total ? Math.round((r.count / total) * 100) : 0;
        return (
          <button
            key={r.ine}
            type="button"
            onClick={() => onSelect(r.ine)}
            className={`w-full text-left rounded-md px-2 py-1 transition-colors ${sel ? 'bg-brand-50 ring-1 ring-brand-300' : 'hover:bg-canvas'}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`text-xs truncate ${sel ? 'text-brand-700 font-semibold' : 'text-ink'}`}>{r.name}</span>
              <span className="text-xs tabular-nums shrink-0 text-slate-500">
                <span className="font-semibold text-ink">{r.count}</span> · {pct}%
              </span>
            </div>
            <div className="mt-1 h-1 rounded-full bg-line overflow-hidden">
              <div className="h-full rounded-full bg-brand" style={{width: `${max ? (r.count / max) * 100 : 0}%`}} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
