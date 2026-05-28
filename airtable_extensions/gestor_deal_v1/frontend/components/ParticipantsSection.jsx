// Participantes: Propietarios (lista) + Estudios como tarjetas-región.
// Cada estudio contiene sus inquilinos; cada inquilino contiene sus avalistas anidados.
// Clic en una persona → expandRecord (detalle nativo). "+ Añadir estudio/inquilino/avalista/propietario".
import React from 'react';
import {Plus, Check, Clock, X, Minus} from 'lucide-react';
import {linkedCells, cellString, CONTACTO_FIELDS} from '../lib/fields';
import {SECTION_ICONS} from '../lib/icons';
import {StatusDot} from './status';
import AccordionCard from './AccordionCard';

const SIN_ESTUDIO = '__none__';

function statusKind(v) {
  v = (v || '').toLowerCase();
  if (!v || /no (cread|aplica)/.test(v)) return 'none';
  if (/(aprobad|firmad|completad|visualizad|creado|sincronizad)/.test(v)) return 'ok';
  if (/(denegad|rechaz|error)/.test(v)) return 'bad';
  return 'pending';
}
const KIND = {
  ok: {cls: 'bg-mint-100 text-mint-700', Icon: Check},
  pending: {cls: 'bg-amber-100 text-amber-700', Icon: Clock},
  bad: {cls: 'bg-[#ffe9ef] text-[#b1103f]', Icon: X},
  none: {cls: 'bg-canvas text-slate-400', Icon: Minus},
};
function StatusTag({label, value, tiny}) {
  const {cls, Icon} = KIND[statusKind(value)];
  return (
    <span className={`inline-flex items-center gap-0.5 rounded font-semibold ${tiny ? 'px-1 py-0 text-[9px]' : 'px-1.5 py-0.5 text-[10px]'} ${cls}`} title={`${label}: ${value || '—'}`}>
      {label}
      <Icon size={tiny ? 9 : 10} strokeWidth={2.5} />
    </span>
  );
}
function initials(name) {
  const p = (name || '').trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase() || '·';
}

function PersonCard({rec, fallbackName, onExpand, sm}) {
  const name = (rec && cellString(rec, CONTACTO_FIELDS.nombre)) || fallbackName || '(sin nombre)';
  const av = sm ? 'w-6 h-6 text-[9px]' : 'w-7 h-7 text-[10px]';
  return (
    <button
      type="button"
      onClick={() => rec && onExpand(rec)}
      title={rec ? 'Abrir detalle' : 'Contacto no cargado'}
      className="w-full text-left rounded-lg border border-line bg-paper p-2 hover:border-brand-300 hover:shadow-soft transition"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className={`flex items-center justify-center rounded-full bg-brand-50 text-brand font-bold shrink-0 ${av}`}>
          {initials(name)}
        </span>
        <span className={`font-semibold text-ink truncate ${sm ? 'text-xs' : 'text-[13px]'}`}>{name}</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-1.5">
        <StatusTag label="LOPD" value={rec && cellString(rec, CONTACTO_FIELDS.lopd)} tiny={sm} />
        <StatusTag label="MITEK" value={rec && cellString(rec, CONTACTO_FIELDS.mitek)} tiny={sm} />
        <StatusTag label="Experian" value={rec && cellString(rec, CONTACTO_FIELDS.experian)} tiny={sm} />
      </div>
    </button>
  );
}

function AddCard({label, onAdd, dashedClass = ''}) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className={`w-full rounded-lg border-2 border-dashed border-line text-slate-400 hover:border-brand hover:text-brand transition flex items-center justify-center gap-1.5 py-2 text-xs font-semibold ${dashedClass}`}
    >
      <Plus size={14} strokeWidth={2} />
      {label}
    </button>
  );
}

function ColHeader({label, count}) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <h3 className="text-[11px] uppercase tracking-[0.12em] text-slate-500 font-bold">{label}</h3>
      <span className="text-[11px] px-1.5 rounded-full bg-canvas text-slate-500 tabular-nums font-semibold">{count}</span>
    </div>
  );
}

function InquilinoCard({rec, fallbackName, contactosById, onExpand, onAdd}) {
  const avalistas = rec ? linkedCells(rec, CONTACTO_FIELDS.avalistas) : [];
  const inqName = (rec && cellString(rec, CONTACTO_FIELDS.nombre)) || fallbackName || 'inquilino';
  return (
    <div className="rounded-lg border border-line bg-paper p-2.5">
      <PersonCard rec={rec} fallbackName={fallbackName} onExpand={onExpand} />
      <div className="mt-2 ml-1.5 pl-3 border-l-2 border-line">
        <div className="text-[9px] uppercase tracking-[0.1em] text-slate-400 font-bold mb-1.5">Avalistas</div>
        <div className="space-y-1.5">
          {avalistas.map((a) => (
            <PersonCard key={a.id} rec={contactosById.get(a.id)} fallbackName={a.name} onExpand={onExpand} sm />
          ))}
          <AddCard label="Añadir avalista" onAdd={() => onAdd(`avalista de ${inqName}`)} />
        </div>
      </div>
    </div>
  );
}

function EstudioCard({estudio, estRec, inquilinos, contactosById, onExpand, onAdd}) {
  const statusValue = estRec && cellString(estRec, 'status');
  const k = statusKind(statusValue);
  return (
    <div className="rounded-xl border border-line bg-canvas/60 p-3">
      <div className="flex items-center gap-2 mb-2.5">
        <StatusDot level={k === 'bad' ? 'warn' : k === 'pending' ? 'partial' : 'ok'} />
        <span className="text-[12px] font-bold text-ink truncate flex-1">{estudio.name}</span>
        {statusValue && (
          <span className={'px-1.5 py-0.5 rounded text-[10px] font-semibold ' + KIND[k].cls}>{statusValue}</span>
        )}
        <span className="text-[11px] px-1.5 rounded-full bg-paper text-slate-500 tabular-nums font-semibold">{inquilinos.length}</span>
      </div>
      <div className="space-y-2">
        {inquilinos.map((p) => (
          <InquilinoCard key={p.id} rec={p.rec} fallbackName={p.name} contactosById={contactosById} onExpand={onExpand} onAdd={onAdd} />
        ))}
        <AddCard label="Añadir inquilino" onAdd={() => onAdd(`inquilino en ${estudio.name}`)} />
      </div>
    </div>
  );
}

export default function ParticipantsSection({section, dealRecord, contactosById, estudiosById, status, open, onToggle, onExpand, onAdd}) {
  const propietarios = linkedCells(dealRecord, section.propietariosField).map((l) => ({...l, rec: contactosById.get(l.id)}));
  const inquilinos = linkedCells(dealRecord, section.inquilinosField).map((l) => ({...l, rec: contactosById.get(l.id)}));
  const estudios = linkedCells(dealRecord, section.estudiosField);

  // Agrupar inquilinos por estudio (estudiosAffi).
  const groups = new Map(); // estudioId -> {name, inquilinos:[]}
  estudios.forEach((e) => groups.set(e.id, {name: e.name, inquilinos: []}));
  for (const inq of inquilinos) {
    const est = inq.rec ? linkedCells(inq.rec, CONTACTO_FIELDS.estudio)[0] : null;
    const key = est?.id || SIN_ESTUDIO;
    if (!groups.has(key)) groups.set(key, {name: est?.name || 'Sin estudio', inquilinos: []});
    groups.get(key).inquilinos.push(inq);
  }

  const total = propietarios.length + inquilinos.length;
  const summary = <span className="text-sm text-slate-600">{total === 0 ? 'Sin participantes' : `${total} participantes · ${estudios.length} estudios`}</span>;

  return (
    <AccordionCard
      icon={SECTION_ICONS[section.id]}
      title={section.title}
      status={status}
      open={open}
      onToggle={onToggle}
      summary={summary}
    >
      <div className="px-5 pb-5 pt-1 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Propietarios */}
        <div className="lg:col-span-1">
          <ColHeader label="Propietarios" count={propietarios.length} />
          <div className="space-y-2">
            {propietarios.map((p) => (
              <PersonCard key={p.id} rec={p.rec} fallbackName={p.name} onExpand={onExpand} />
            ))}
            <AddCard label="Añadir propietario" onAdd={() => onAdd('propietario')} />
          </div>
        </div>

        {/* Estudios (con inquilinos → avalistas) */}
        <div className="lg:col-span-2">
          <ColHeader label="Estudios" count={estudios.length} />
          <div className="space-y-3">
            {[...groups.entries()].map(([key, g]) => (
              <EstudioCard
                key={key}
                estudio={{id: key, name: g.name}}
                estRec={key !== SIN_ESTUDIO ? estudiosById.get(key) : null}
                inquilinos={g.inquilinos}
                contactosById={contactosById}
                onExpand={onExpand}
                onAdd={onAdd}
              />
            ))}
            <AddCard label="Añadir estudio" onAdd={() => onAdd('estudio')} dashedClass="py-3" />
          </div>
        </div>
      </div>
    </AccordionCard>
  );
}
