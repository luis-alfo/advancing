// Dropdown de filtro (canal / producto / tipo / agencia). Las opciones llevan su recuento.
import React from 'react';

export default function FiltroSelect({label, value, entries, onChange, allLabel = 'Todos'}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-navy mb-1">{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full text-xs bg-paper border border-line rounded-md px-2 py-1.5 text-ink focus:outline-none focus:ring-2 focus:ring-brand-300"
      >
        <option value="">{allLabel}</option>
        {entries.map(([k, n]) => (
          <option key={k} value={k}>
            {k} ({n})
          </option>
        ))}
      </select>
    </div>
  );
}
