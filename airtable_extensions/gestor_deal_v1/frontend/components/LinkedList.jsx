// Lista de linked records (Scoring Affi → estudios, Inmueble → inmueble).
// Clic en un registro → detalle nativo (expandRecord).
import React from 'react';
import {ChevronRight} from 'lucide-react';
import {linkedCells, cellString} from '../lib/fields';
import {SECTION_ICONS} from '../lib/icons';
import AccordionCard from './AccordionCard';

export default function LinkedList({section, dealRecord, recordsById, status, open, onToggle, onExpand}) {
  const linked = linkedCells(dealRecord, section.linkField);
  const summary = (
    <span className="text-sm text-slate-600">
      {linked.length === 0 ? 'Sin registros' : `${linked.length} ${linked.length === 1 ? 'registro' : 'registros'}`}
    </span>
  );

  return (
    <AccordionCard
      icon={SECTION_ICONS[section.id]}
      title={section.title}
      status={status}
      open={open}
      onToggle={onToggle}
      summary={summary}
    >
      <div className="divide-y divide-line border-t border-line">
        {linked.length === 0 ? (
          <div className="px-5 py-5 text-sm text-slate-400">Sin registros vinculados.</div>
        ) : (
          linked.map((l) => {
            const rec = recordsById.get(l.id);
            const name = (rec && cellString(rec, undefined)) || l.name || '(sin nombre)';
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => rec && onExpand(rec)}
                className="w-full text-left px-5 py-3 hover:bg-canvas transition-colors flex items-center justify-between gap-3"
                title={rec ? 'Abrir detalle' : 'Registro no cargado'}
              >
                <span className="text-sm text-ink truncate">{l.name || name}</span>
                <ChevronRight size={16} className="text-slate-300 shrink-0" />
              </button>
            );
          })
        )}
      </div>
    </AccordionCard>
  );
}
