// Panel lateral derecho: al seleccionar una burbuja/región/agencia muestra el listado de deals con
// stats de análisis (recuento, renta media, renta total) + facetas (canal/producto/tipo) clicables
// que filtran la cartera, y la lista de tarjetas ordenable.
import React, {useMemo, useState} from 'react';
import {statsOf} from '../lib/deals';
import {euro, fmtDate} from '../lib/airtable';
import Facetas from './Facetas';

const SORTS = {
  alquilerDesc: {label: 'Mayor renta', fn: (a, b) => (b.alquiler || 0) - (a.alquiler || 0)},
  alquilerAsc: {label: 'Menor renta', fn: (a, b) => (a.alquiler || 0) - (b.alquiler || 0)},
  inicio: {label: 'Inicio reciente', fn: (a, b) => (b.inicio || '').localeCompare(a.inicio || '')},
};

function Stat({value, label, accent}) {
  return (
    <div>
      <div className={`text-lg font-bold tabular-nums leading-none ${accent ? 'text-brand-700' : 'text-navy'}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}

function DealCard({d}) {
  return (
    <div className="rounded-lg border border-line bg-paper px-3 py-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-bold text-ink tabular-nums">
          {euro(d.alquiler)}
          <span className="text-[10px] text-slate-400 font-normal"> /mes</span>
        </span>
        <span className="text-[10px] font-medium text-slate-500 shrink-0">{d.canal || '—'}</span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {d.producto && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-medium">{d.producto}</span>}
        {d.tipoContrato && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-mint-100 text-mint-700 font-medium">{d.tipoContrato}</span>}
      </div>
      {d.agencia && <div className="mt-1 text-[11px] text-slate-500 truncate" title={d.agencia}>{d.agencia}</div>}
      <div className="mt-1 text-[11px] text-slate-500 tabular-nums">
        {fmtDate(d.inicio)} <span className="text-slate-300">→</span> {fmtDate(d.fin)}
      </div>
    </div>
  );
}

export default function PanelDeals({selection, facets, onToggleFacet, onClose}) {
  const [sort, setSort] = useState('alquilerDesc');
  const stats = useMemo(() => statsOf(selection.deals), [selection]);
  const deals = useMemo(() => [...selection.deals].sort(SORTS[sort].fn), [selection, sort]);

  return (
    <aside className="w-80 shrink-0 bg-paper border-l border-line flex flex-col min-h-0">
      <header className="shrink-0 px-4 pt-3 pb-3 border-b border-line">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wide text-slate-400">Selección</div>
            <h2 className="text-sm font-display font-bold text-ink truncate" title={selection.title}>{selection.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 text-slate-400 hover:text-ink transition-colors text-lg leading-none" title="Cerrar">×</button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat value={stats.count} label="Deals" />
          <Stat value={euro(stats.avgAlquiler)} label="Renta media" accent />
          <Stat value={euro(stats.totalAlquiler)} label="Renta total" />
        </div>

        <div className="mt-3 space-y-2.5">
          <Facetas title="Canal" entries={stats.byCanal} active={facets.canal} onToggle={(v) => onToggleFacet('canal', v)} />
          <Facetas title="Producto" entries={stats.byProducto} active={facets.producto} onToggle={(v) => onToggleFacet('producto', v)} />
          <Facetas title="Tipo de contrato" entries={stats.byTipo} active={facets.tipo} onToggle={(v) => onToggleFacet('tipo', v)} />
        </div>
      </header>

      <div className="shrink-0 px-4 py-2 flex items-center gap-1 border-b border-line">
        <span className="text-[10px] text-slate-400 mr-1">Ordenar:</span>
        {Object.entries(SORTS).map(([k, s]) => (
          <button
            key={k}
            type="button"
            onClick={() => setSort(k)}
            className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${sort === k ? 'bg-brand text-paper' : 'bg-canvas text-slate-500 hover:text-brand'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {deals.map((d) => (
          <DealCard key={d.id} d={d} />
        ))}
      </div>
    </aside>
  );
}
