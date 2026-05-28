// Índice flotante de 2 niveles: Resumen fijo + bloques de categoría (icono Lucide, clicables
// para expandir todo el grupo) con sus secciones. Marca Advancing.
import React from 'react';
import {StatusDot} from './status';
import {SECTION_ICONS, CATEGORY_ICONS} from '../lib/icons';

function Meter({ok, total, issues}) {
  const pct = total ? Math.round((ok / total) * 100) : 0;
  return (
    <div className="px-4 pt-4 pb-3.5 border-b border-line">
      <div className="flex items-baseline gap-2">
        <span className="text-[26px] font-bold leading-none text-ink tabular-nums">
          {ok}<span className="text-slate-300">/{total}</span>
        </span>
        <span className="text-[10px] uppercase tracking-[0.12em] text-slate-400 font-bold leading-tight">
          secciones
          <br />
          completas
        </span>
      </div>
      <div className="mt-2.5 h-1.5 rounded-full bg-line overflow-hidden">
        <div
          className={'h-full rounded-full transition-all duration-500 ' + (issues ? 'bg-amber-500' : 'bg-mint-500')}
          style={{width: `${pct}%`}}
        />
      </div>
      {issues > 0 && (
        <div className="mt-2 text-xs text-amber-700">
          <span className="tabular-nums font-semibold">{issues}</span>{' '}
          {issues === 1 ? 'dato pendiente' : 'datos pendientes'}
        </div>
      )}
    </div>
  );
}

function Item({id, title, status, active, onSelect}) {
  const Icon = SECTION_ICONS[id];
  const chip =
    status.level === 'warn'
      ? <span className="text-[11px] px-1.5 rounded bg-amber-100 text-amber-700 tabular-nums font-semibold">{status.count}</span>
      : status.level === 'partial'
        ? <span className="text-[11px] px-1.5 rounded bg-canvas text-slate-500 tabular-nums">{status.count}</span>
        : null;
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={
        'group w-full flex items-center gap-2 pl-3 pr-2.5 py-2 border-l-2 transition-colors text-left ' +
        (active ? 'border-brand bg-brand-50' : 'border-transparent hover:bg-canvas')
      }
    >
      <StatusDot level={status.level} />
      {Icon && <Icon size={14} strokeWidth={2} className={active ? 'text-brand' : 'text-slate-400'} />}
      <span className={'flex-1 truncate text-[13px] ' + (active ? 'text-ink font-semibold' : 'text-slate-600')}>
        {title}
      </span>
      {chip}
    </button>
  );
}

function aggregate(items, statuses) {
  let warn = 0;
  let ok = 0;
  for (const it of items) {
    const lv = (statuses[it.id] || {}).level;
    if (lv === 'warn') warn++;
    if (lv === 'ok') ok++;
  }
  if (warn) return 'warn';
  if (ok === items.length) return 'ok';
  return 'partial';
}

function CategoryHeader({cat, agg, onClick}) {
  const Icon = CATEGORY_ICONS[cat.id];
  return (
    <button
      type="button"
      onClick={onClick}
      title="Abrir toda la categoría"
      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-canvas transition-colors group"
    >
      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand-50 text-brand shrink-0 group-hover:bg-brand group-hover:text-paper transition-colors">
        {Icon && <Icon size={15} strokeWidth={2.2} />}
      </span>
      <span className="flex-1 text-left text-[11px] uppercase tracking-[0.14em] text-slate-500 font-bold">
        {cat.label}
      </span>
      <StatusDot level={agg} />
    </button>
  );
}

export default function DealSidebar({resumen, categories, statuses, activeId, onSelect, onSelectCategory, overall}) {
  return (
    <nav className="w-64 bg-paper shadow-soft rounded-2xl flex flex-col overflow-hidden max-h-[calc(100vh-6rem)]">
      <Meter ok={overall.ok} total={overall.total} issues={overall.issues} />
      <div className="py-2 overflow-y-auto">
        <Item
          id={resumen.id}
          title={resumen.title}
          status={statuses[resumen.id] || {level: 'empty'}}
          active={activeId === resumen.id}
          onSelect={onSelect}
        />

        {categories.map((cat) => (
          <div key={cat.id} className="mt-2.5 pt-1.5 border-t border-line/70">
            <CategoryHeader cat={cat} agg={aggregate(cat.items, statuses)} onClick={() => onSelectCategory(cat)} />
            {cat.items.map((it) => (
              <Item
                key={it.id}
                id={it.id}
                title={it.title}
                status={statuses[it.id] || {level: 'empty'}}
                active={activeId === it.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
}
