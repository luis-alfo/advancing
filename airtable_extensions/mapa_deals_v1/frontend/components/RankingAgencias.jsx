// Ranking de top agencias por nº de deals (con barra y %). Clic → selecciona los deals de la agencia.
import React, {useMemo} from 'react';

export default function RankingAgencias({byAgencia, total, selectedKey, onSelect, limit = 12}) {
  const rows = useMemo(() => {
    const r = [...byAgencia.entries()].map(([name, e]) => ({name, count: e.count}));
    r.sort((a, b) => b.count - a.count);
    return r.slice(0, limit);
  }, [byAgencia, limit]);
  const max = rows.length ? rows[0].count : 0;
  if (!rows.length) return <div className="text-xs text-slate-400 px-1 py-1">Sin agencias en este filtro.</div>;

  return (
    <div className="space-y-0.5">
      {rows.map((r) => {
        const sel = selectedKey === r.name;
        const pct = total ? Math.round((r.count / total) * 100) : 0;
        return (
          <button
            key={r.name}
            type="button"
            onClick={() => onSelect(r.name)}
            className={`w-full text-left rounded-md px-2 py-1 transition-colors ${sel ? 'bg-brand-50 ring-1 ring-brand-300' : 'hover:bg-canvas'}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`text-xs truncate ${sel ? 'text-brand-700 font-semibold' : 'text-ink'}`} title={r.name}>{r.name}</span>
              <span className="text-xs tabular-nums shrink-0 text-slate-500">
                <span className="font-semibold text-ink">{r.count}</span> · {pct}%
              </span>
            </div>
            <div className="mt-1 h-1 rounded-full bg-line overflow-hidden">
              <div className="h-full rounded-full bg-mint-500" style={{width: `${max ? (r.count / max) * 100 : 0}%`}} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
