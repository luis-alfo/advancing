// Sección de campos del deal (acordeón). Colapsado → resumen; expandido → rejilla.
import React from 'react';
import {formatCell} from '../lib/fields';
import {SECTION_ICONS} from '../lib/icons';
import AccordionCard from './AccordionCard';

function Value({record, def, size = 'base'}) {
  const {text, kind} = formatCell(record, def.field, def.format);
  if (kind === 'badge') {
    return (
      <span className="inline-block px-2 py-0.5 rounded-md text-[13px] font-semibold bg-brand-50 text-brand-700 border border-brand-300">
        {text}
      </span>
    );
  }
  const cls =
    kind === 'todo'
      ? 'text-amber-700 italic text-sm'
      : kind === 'empty'
        ? 'text-slate-300'
        : 'text-ink font-semibold tabular-nums';
  return <span className={(size === 'sm' ? 'text-sm ' : 'text-[15px] ') + cls}>{text}</span>;
}

function FieldCell({record, def}) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-semibold">{def.label}</div>
      <div className="mt-1 truncate">
        <Value record={record} def={def} />
      </div>
    </div>
  );
}

function Summary({section, record}) {
  const labels = section.summary && section.summary.length ? section.summary : section.fields.slice(0, 3).map((f) => f.label);
  const defs = labels.map((l) => section.fields.find((f) => f.label === l)).filter(Boolean);
  return (
    <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
      {defs.map((def) => (
        <div key={def.label} className="flex items-baseline gap-2 min-w-0">
          <span className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-semibold shrink-0">{def.label}</span>
          <Value record={record} def={def} size="sm" />
        </div>
      ))}
    </div>
  );
}

export default function SectionView({section, record, status, open, onToggle}) {
  return (
    <AccordionCard
      icon={SECTION_ICONS[section.id]}
      title={section.title}
      status={status}
      open={open}
      onToggle={onToggle}
      summary={<Summary section={section} record={record} />}
    >
      <div className="px-5 pb-5 pt-1 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
        {section.fields.map((def) => (
          <FieldCell key={def.label} record={record} def={def} />
        ))}
      </div>
    </AccordionCard>
  );
}
