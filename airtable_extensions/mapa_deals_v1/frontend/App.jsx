// App raíz de la extension "Mapa de deals activos" (marca Advancing, ver design.md).
// Lee los deals en vivo, filtra activos (ABIERTO/EN TRAMITE), permite filtrar por mes de cierre
// y pinta un mapa SVG offline de España: coropleta por provincia + puntos por código postal.
import React, {useMemo, useState, useCallback} from 'react';
import {useBase, useRecords} from '@airtable/blocks/interface/ui';
import {DEAL_TABLE_ID, DEAL_FIELDS} from './lib/airtable';
import {activeDeals, monthRange, filterByMonth, aggregate} from './lib/deals';
import MapaEspana from './components/MapaEspana';
import Leyenda from './components/Leyenda';
import FiltroMeses from './components/FiltroMeses';
import PanelRanking from './components/PanelRanking';
import Tooltip from './components/Tooltip';

function pickFields(table, names) {
  if (!table) return [];
  return names.map((n) => table.getFieldByNameIfExists(n)).filter(Boolean);
}

export default function App() {
  const base = useBase();
  const table = base.getTableByIdIfExists(DEAL_TABLE_ID);
  if (!table) {
    return <div className="font-sans text-base p-4 text-amber-700">No se encuentra la tabla del deal ({DEAL_TABLE_ID}).</div>;
  }
  return <MapaDeals table={table} />;
}

function Kpi({value, label}) {
  return (
    <div className="px-3">
      <div className="text-base font-bold text-navy tabular-nums leading-none">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}

function MapaDeals({table}) {
  const fields = useMemo(() => pickFields(table, DEAL_FIELDS), [table]);
  const records = useRecords(table, {fields});

  const active = useMemo(() => activeDeals(records), [records]);
  const range = useMemo(() => monthRange(active), [active]);
  const undatedCount = useMemo(() => active.reduce((n, d) => n + (d.ym ? 0 : 1), 0), [active]);

  const [sel, setSel] = useState(null); // {from,to} | null = todo el periodo
  const [includeUndated, setIncludeUndated] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [tip, setTip] = useState(null);

  const from = sel ? sel.from : range ? range.min : null;
  const to = sel ? sel.to : range ? range.max : null;
  const isAll = !sel;

  const filtered = useMemo(() => filterByMonth(active, from, to, includeUndated), [active, from, to, includeUndated]);
  const agg = useMemo(() => aggregate(filtered), [filtered]);

  const onHover = useCallback((data) => setTip(data), []);
  const onClickProvince = useCallback((ine) => setSelectedId((s) => (s === ine ? null : ine)), []);
  const onChange = useCallback((f, t) => setSel({from: f, to: t}), []);
  const onReset = useCallback(() => setSel(null), []);
  const onToggleUndated = useCallback(() => setIncludeUndated((v) => !v), []);

  return (
    <div className="font-sans text-ink bg-canvas h-screen flex flex-col">
      <header className="shrink-0 flex items-center gap-4 px-5 h-14 bg-paper border-b border-line z-10">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-mint-500" />
          <h1 className="text-sm font-display font-bold text-ink tracking-tight truncate">Mapa de deals activos</h1>
        </div>
        <div className="flex-1" />
        <div className="flex items-center divide-x divide-line">
          <Kpi value={active.length} label="Activos" />
          <Kpi value={filtered.length} label="En filtro" />
          <Kpi value={agg.located} label="En mapa" />
          <Kpi value={agg.byProvince.size} label="Provincias" />
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <aside className="w-72 shrink-0 bg-paper border-r border-line overflow-y-auto p-4 space-y-5">
          <FiltroMeses
            range={range}
            from={from}
            to={to}
            includeUndated={includeUndated}
            undatedCount={undatedCount}
            isAll={isAll}
            onChange={onChange}
            onToggleUndated={onToggleUndated}
            onReset={onReset}
          />
          <div className="border-t border-line pt-4">
            <Leyenda maxProvince={agg.maxProvince} maxCP={agg.maxCP} />
          </div>
          <div className="border-t border-line pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-semibold text-navy">Provincias</div>
              {selectedId && (
                <button type="button" onClick={() => setSelectedId(null)} className="text-[10px] text-brand hover:text-brand-700">
                  Quitar selección
                </button>
              )}
            </div>
            <PanelRanking byProvince={agg.byProvince} total={filtered.length} selectedId={selectedId} onSelect={onClickProvince} />
          </div>
        </aside>

        <main className="flex-1 min-w-0 p-5">
          {active.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">No hay deals activos para mostrar.</div>
          ) : (
            <div className="h-full bg-paper rounded-xl shadow-card border border-line p-3">
              <MapaEspana agg={agg} selectedId={selectedId} onHover={onHover} onClickProvince={onClickProvince} />
            </div>
          )}
        </main>
      </div>

      <Tooltip data={tip} />
    </div>
  );
}
