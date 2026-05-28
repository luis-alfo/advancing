// Hero del deal: datos clave + anillo de completitud (marca Advancing).
import React from 'react';
import {BASIC_FIELDS, cellString, formatCell} from '../lib/fields';

function Ring({ok, total, issues}) {
  const pct = total ? ok / total : 0;
  const r = 26;
  const c = 2 * Math.PI * r;
  const color = issues ? '#d99a14' : '#24df86'; // amber / mint
  return (
    <div className="relative shrink-0" style={{width: 72, height: 72}}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#e8e9ee" strokeWidth="7" />
        <circle
          cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 36 36)"
          style={{transition: 'stroke-dashoffset .6s ease'}}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-ink leading-none tabular-nums">
          {ok}<span className="text-slate-300">/{total}</span>
        </span>
        <span className="text-[8px] uppercase tracking-wider text-slate-400 mt-0.5">secc.</span>
      </div>
    </div>
  );
}

function Fact({label, children}) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-semibold">{label}</div>
      <div className="mt-0.5 text-sm text-ink font-semibold truncate">{children}</div>
    </div>
  );
}

export default function DealHero({record, overall}) {
  const alquiler = formatCell(record, BASIC_FIELDS.alquilerMensual, 'currency').text;
  return (
    <div className="rounded-2xl bg-paper shadow-soft p-6">
      <div className="flex items-start gap-5">
        <Ring ok={overall.ok} total={overall.total} issues={overall.issues} />
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-ink leading-snug tracking-tight">
            {cellString(record, BASIC_FIELDS.titulo)}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Chip>{cellString(record, BASIC_FIELDS.producto) || '—'}</Chip>
            <Chip>{cellString(record, BASIC_FIELDS.tipoDeal) || '—'}</Chip>
            <Chip tone="brand">{cellString(record, BASIC_FIELDS.etapa) || '—'}</Chip>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
            <Fact label="Alquiler mensual">{alquiler}</Fact>
            <Fact label="Owner">{cellString(record, BASIC_FIELDS.owner) || '—'}</Fact>
            <Fact label="Hubspot ID">
              <span className="tabular-nums">{cellString(record, BASIC_FIELDS.hubspotId) || '—'}</span>
            </Fact>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({children, tone}) {
  const cls = tone === 'brand' ? 'bg-brand-50 text-brand-700' : 'bg-canvas text-slate-600 border border-line';
  return <span className={'px-2 py-0.5 rounded-md text-xs font-semibold ' + cls}>{children}</span>;
}
