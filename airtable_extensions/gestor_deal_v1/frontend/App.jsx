// App raíz de la extension "Gestor del deal" (marca Advancing, ver design.md).
// Standalone: el SDK no da el "record actual" → useRecords(deal) + selección por searchParams.
// Layout: página única con scroll continuo + hero + índice flotante por categorías (scroll-spy) + acordeones.
// Personas/inmueble/estudios: linked records con clic → detalle nativo (expandRecord).
import React, {useMemo, useRef, useState, useEffect, useCallback} from 'react';
import {useBase, useRecords, useSearchParams, expandRecord} from '@airtable/blocks/interface/ui';
import {
  DEAL_TABLE_ID,
  CONTACTOS_TABLE_ID,
  INMUEBLE_TABLE_ID,
  ESTUDIOS_TABLE_ID,
  CONTACTO_SUBSCRIBED,
  SUBSCRIBED_FIELDS,
  BASIC_FIELDS,
  SECTIONS,
  CATEGORIES,
  cellString,
  sectionStatus,
  overallStatus,
  dealValidation,
} from './lib/fields';
import DealSelector from './components/DealSelector';
import DealSidebar from './components/DealSidebar';
import DealHero from './components/DealHero';
import ValidationPanel from './components/ValidationPanel';
import SectionView from './components/SectionView';
import ParticipantsSection from './components/ParticipantsSection';
import LinkedList from './components/LinkedList';

const RESUMEN = {id: 'resumen', title: 'Resumen', special: true};
const SECTION_BY_ID = new Map(SECTIONS.map((s) => [s.id, s]));
const ORDERED_SECTIONS = CATEGORIES.flatMap((c) => c.sectionIds.map((id) => SECTION_BY_ID.get(id)).filter(Boolean));
const ITEMS = [RESUMEN, ...ORDERED_SECTIONS];
const SIDEBAR_CATEGORIES = CATEGORIES.map((c) => ({
  id: c.id,
  label: c.label,
  items: c.sectionIds.map((id) => ({id, title: SECTION_BY_ID.get(id)?.title || id})),
}));

function pickFields(table, names) {
  if (!table) return [];
  return names.map((n) => table.getFieldByNameIfExists(n)).filter(Boolean);
}
function byId(records) {
  return new Map(records.map((r) => [r.id, r]));
}

export default function App() {
  const base = useBase();
  const table = base.getTableByIdIfExists(DEAL_TABLE_ID);
  if (!table) {
    return <div className="font-sans text-base p-4 text-amber-700">No se encuentra la tabla del deal ({DEAL_TABLE_ID}).</div>;
  }
  return <DealManager base={base} table={table} />;
}

function DealManager({base, table}) {
  const {searchParams, setSearchParamsAsync} = useSearchParams();
  const selectedId = searchParams.deal || null;

  const dealFields = useMemo(() => pickFields(table, SUBSCRIBED_FIELDS), [table]);
  const records = useRecords(table, {fields: dealFields});

  // Tablas enlazadas (existen en esta base; en el preview las da el mock).
  const contactosTable = base.getTableByIdIfExists(CONTACTOS_TABLE_ID);
  const inmuebleTable = base.getTableByIdIfExists(INMUEBLE_TABLE_ID);
  const estudiosTable = base.getTableByIdIfExists(ESTUDIOS_TABLE_ID);
  const contactos = useRecords(contactosTable, {fields: pickFields(contactosTable, CONTACTO_SUBSCRIBED)});
  const inmuebles = useRecords(inmuebleTable, {fields: pickFields(inmuebleTable, ['index'])});
  const estudios = useRecords(estudiosTable, {fields: pickFields(estudiosTable, ['Name', 'status'])});

  const contactosById = useMemo(() => byId(contactos), [contactos]);
  const inmuebleById = useMemo(() => byId(inmuebles), [inmuebles]);
  const estudiosById = useMemo(() => byId(estudios), [estudios]);

  const selected = useMemo(
    () => (selectedId ? records.find((r) => r.id === selectedId) || null : null),
    [records, selectedId],
  );

  if (!selected) {
    return (
      <div className="font-sans text-base text-ink bg-canvas h-screen p-6 overflow-y-auto">
        <header className="max-w-2xl mx-auto mb-4">
          <h1 className="text-xl font-display font-bold text-ink tracking-tight">Gestor del deal</h1>
          <p className="text-sm text-slate-500 mt-0.5">Elige un deal para gestionarlo.</p>
        </header>
        <DealSelector records={records} onSelect={(id) => setSearchParamsAsync((prev) => ({...prev, deal: id}))} />
      </div>
    );
  }

  return (
    <DealShell
      key={selected.id}
      selected={selected}
      contactosById={contactosById}
      inmuebleById={inmuebleById}
      estudiosById={estudiosById}
      onClearDeal={() => setSearchParamsAsync((prev) => ({...prev, deal: ''}))}
    />
  );
}

function DealShell({selected, contactosById, inmuebleById, estudiosById, onClearDeal}) {
  const scrollRef = useRef(null);
  const sectionEls = useRef(new Map());
  const visible = useRef({});
  const [activeId, setActiveId] = useState('resumen');

  const [openMap, setOpenMap] = useState(() => {
    const o = {resumen: true};
    for (const s of SECTIONS) o[s.id] = false;
    return o;
  });
  const allOpen = ITEMS.every((i) => openMap[i.id]);
  const toggleOne = (id) => setOpenMap((p) => ({...p, [id]: !p[id]}));
  const setAll = (v) => setOpenMap(Object.fromEntries(ITEMS.map((i) => [i.id, v])));

  const statuses = useMemo(() => {
    const out = {};
    const dv = dealValidation(selected);
    out.resumen = dv.ok ? {level: 'ok', count: 0} : {level: 'warn', count: dv.issues};
    for (const s of SECTIONS) out[s.id] = sectionStatus(selected, s);
    return out;
  }, [selected]);

  const overall = useMemo(() => overallStatus(selected, SECTIONS), [selected]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.current[e.target.dataset.secid] = e.isIntersecting;
        const first = ITEMS.find((it) => visible.current[it.id]);
        if (first) setActiveId(first.id);
      },
      {root, rootMargin: '-8% 0px -75% 0px', threshold: 0},
    );
    sectionEls.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [selected]);

  const setRef = useCallback(
    (id) => (el) => {
      if (el) sectionEls.current.set(id, el);
      else sectionEls.current.delete(id);
    },
    [],
  );
  const goTo = useCallback((id) => {
    const el = sectionEls.current.get(id);
    if (el) el.scrollIntoView({behavior: 'smooth', block: 'start'});
  }, []);
  const selectSection = useCallback(
    (id) => {
      setOpenMap((p) => ({...p, [id]: true}));
      goTo(id);
    },
    [goTo],
  );
  const selectCategory = useCallback(
    (cat) => {
      setOpenMap((p) => {
        const next = {...p};
        cat.items.forEach((it) => (next[it.id] = true));
        return next;
      });
      if (cat.items[0]) goTo(cat.items[0].id);
    },
    [goTo],
  );

  const onExpand = useCallback((rec) => {
    if (rec) expandRecord(rec);
  }, []);
  // Alta/vínculo — pendiente de F2/F4 (escritura). Placeholder por ahora.
  const onAdd = useCallback((what) => {
    window.alert(`Próximamente: añadir/vincular ${what}.`);
  }, []);

  const renderSection = (item) => {
    const common = {
      record: selected,
      status: statuses[item.id],
      open: openMap[item.id],
      onToggle: () => toggleOne(item.id),
    };
    if (item.special) return <ValidationPanel {...common} />;
    if (item.type === 'participants')
      return (
        <ParticipantsSection
          section={item}
          dealRecord={selected}
          contactosById={contactosById}
          estudiosById={estudiosById}
          onExpand={onExpand}
          onAdd={onAdd}
          {...common}
        />
      );
    if (item.type === 'links') {
      const map = item.linkedTableId === INMUEBLE_TABLE_ID ? inmuebleById : estudiosById;
      return <LinkedList section={item} dealRecord={selected} recordsById={map} onExpand={onExpand} {...common} />;
    }
    return <SectionView section={item} {...common} />;
  };

  return (
    <div className="font-sans text-ink bg-canvas h-screen flex flex-col">
      <header className="shrink-0 flex items-center gap-3 px-4 h-12 bg-paper border-b border-line z-10">
        <button type="button" onClick={onClearDeal} className="text-sm text-slate-500 hover:text-brand transition-colors shrink-0" title="Cambiar de deal">
          ← deals
        </button>
        <div className="w-px h-5 bg-line" />
        <div className="min-w-0 flex-1 text-sm font-semibold text-ink truncate">{cellString(selected, BASIC_FIELDS.titulo)}</div>
        <button type="button" onClick={() => setAll(!allOpen)} className="text-xs text-slate-500 hover:text-brand transition-colors shrink-0">
          {allOpen ? 'Colapsar todo' : 'Expandir todo'}
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="flex items-start gap-6 max-w-5xl mx-auto px-6 py-6">
          <aside className="sticky top-6 shrink-0">
            <DealSidebar
              resumen={RESUMEN}
              categories={SIDEBAR_CATEGORIES}
              statuses={statuses}
              activeId={activeId}
              onSelect={selectSection}
              onSelectCategory={selectCategory}
              overall={overall}
            />
          </aside>

          <main className="flex-1 min-w-0 space-y-5">
            <DealHero record={selected} overall={overall} />
            {ITEMS.map((item) => (
              <section key={item.id} ref={setRef(item.id)} data-secid={item.id} className="scroll-mt-6">
                {renderSection(item)}
              </section>
            ))}
            <div className="h-[40vh]" aria-hidden />
          </main>
        </div>
      </div>
    </div>
  );
}
