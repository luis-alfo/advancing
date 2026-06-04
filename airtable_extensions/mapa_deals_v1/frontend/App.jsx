// App raíz de la extension "Mapa de deals activos" (marca Advancing, ver design.md).
// Lee deals en vivo, filtra activos, filtro por mes de cierre, mapa SVG offline con detalle por zoom,
// y panel de análisis lateral (deals + ticket medio de renta) al seleccionar una burbuja/región.
import React, {useMemo, useState, useCallback} from 'react';
import {useBase, useRecords} from '@airtable/blocks/interface/ui';
import {DEAL_TABLE_ID, DEAL_FIELDS, euro} from './lib/airtable';
import {activeDeals, monthRange, filterByMonth, aggregate, statsOf} from './lib/deals';
import {PROVINCE_NAME} from './lib/geo';
import MapaEspana from './components/MapaEspana';
import Leyenda from './components/Leyenda';
import FiltroMeses from './components/FiltroMeses';
import PanelRanking from './components/PanelRanking';
import PanelDeals from './components/PanelDeals';
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

function Kpi({value, label, accent}) {
  return (
    <div className="px-3">
      <div className={`text-base font-bold tabular-nums leading-none ${accent ? 'text-brand-700' : 'text-navy'}`}>{value}</div>
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

  const [sel, setSel] = useState(null); // filtro de meses {from,to} | null = todo
  const [includeUndated, setIncludeUndated] = useState(true);
  const [selection, setSelection] = useState(null); // {kind, key, title} seleccionado en el mapa/ranking
  const [tip, setTip] = useState(null);

  const from = sel ? sel.from : range ? range.min : null;
  const to = sel ? sel.to : range ? range.max : null;
  const isAll = !sel;

  const filtered = useMemo(() => filterByMonth(active, from, to, includeUndated), [active, from, to, includeUndated]);
  const agg = useMemo(() => aggregate(filtered), [filtered]);
  const globalStats = useMemo(() => statsOf(filtered), [filtered]);

  // Deals de la selección, derivados del agregado actual (se re-calculan al cambiar el filtro).
  const selectionDeals = useMemo(() => {
    if (!selection) return null;
    const map = {ccaa: agg.byCCAA, provincia: agg.byProvince, municipio: agg.byMunicipio, cp: agg.byCP}[selection.kind];
    const entry = map && map.get(selection.key);
    return entry ? entry.deals : null;
  }, [selection, agg]);

  const onHover = useCallback((d) => setTip(d), []);
  const onSelect = useCallback((s) => setSelection(s), []);
  const clearSelection = useCallback(() => setSelection(null), []);
  const selectProvincia = useCallback((ine) => setSelection({kind: 'provincia', key: ine, title: PROVINCE_NAME.get(ine) || ine}), []);
  const onChange = useCallback((f, t) => setSel({from: f, to: t}), []);
  const onReset = useCallback(() => setSel(null), []);
  const onToggleUndated = useCallback(() => setIncludeUndated((v) => !v), []);

  const selectedKey = selection ? selection.key : null;
  const showPanel = selection && selectionDeals && selectionDeals.length > 0;

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
          <Kpi value={euro(globalStats.avgAlquiler)} label="Ticket medio" accent />
          <Kpi value={euro(globalStats.totalAlquiler)} label="Renta total/mes" />
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
            <div className="text-[11px] font-semibold text-navy mb-2">Provincias</div>
            <PanelRanking byProvince={agg.byProvince} total={filtered.length} selectedId={selection && selection.kind === 'provincia' ? selection.key : null} onSelect={selectProvincia} />
          </div>
        </aside>

        <main className="flex-1 min-w-0 p-5">
          {active.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">No hay deals activos para mostrar.</div>
          ) : (
            <div className="h-full bg-paper rounded-xl shadow-card border border-line p-3">
              <MapaEspana agg={agg} selectedKey={selectedKey} onHover={onHover} onSelect={onSelect} />
            </div>
          )}
        </main>

        {showPanel && <PanelDeals selection={{title: selection.title, deals: selectionDeals}} onClose={clearSelection} />}
      </div>

      <Tooltip data={tip} />
    </div>
  );
}
