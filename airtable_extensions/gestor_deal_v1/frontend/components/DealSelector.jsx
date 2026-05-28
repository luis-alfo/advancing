// Selector de deal (marca Advancing): busca por título o Hubspot ID y selecciona uno.
import React, {useMemo, useState, useDeferredValue} from 'react';
import {BASIC_FIELDS, cellString} from '../lib/fields';

const MAX_RESULTS = 40;

export default function DealSelector({records, onSelect}) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return records.slice(0, MAX_RESULTS);
    const out = [];
    for (const r of records) {
      const hay =
        cellString(r, BASIC_FIELDS.titulo).toLowerCase() + ' ' + cellString(r, BASIC_FIELDS.hubspotId).toLowerCase();
      if (hay.includes(q)) {
        out.push(r);
        if (out.length >= MAX_RESULTS) break;
      }
    }
    return out;
  }, [records, deferredQuery]);

  return (
    <div className="max-w-2xl mx-auto">
      <input
        type="text"
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar deal por nombre o Hubspot ID…"
        className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-paper text-base text-ink
                   placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-300/50 focus:border-brand"
      />
      <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-paper shadow-card overflow-hidden">
        {results.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onSelect(r.id)}
              className="w-full text-left px-4 py-2.5 hover:bg-brand-50 transition-colors flex items-center justify-between gap-3"
            >
              <span className="text-sm text-ink truncate">{cellString(r, BASIC_FIELDS.titulo) || '(sin título)'}</span>
              <span className="text-xs text-slate-400 tabular-nums shrink-0">{cellString(r, BASIC_FIELDS.hubspotId)}</span>
            </button>
          </li>
        ))}
        {results.length === 0 && <li className="px-4 py-3 text-sm text-slate-500">Sin resultados.</li>}
      </ul>
    </div>
  );
}
