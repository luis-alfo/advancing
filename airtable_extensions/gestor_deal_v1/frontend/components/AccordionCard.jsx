// Shell de tarjeta-acordeón compartida (cabecera clicable + estado). Marca Advancing.
import React from 'react';
import {StatusPill} from './status';

export function Chevron({open}) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
      className={'text-slate-400 transition-transform duration-200 ' + (open ? 'rotate-90' : '')}>
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AccordionCard({icon: Icon, title, status, open, onToggle, summary, children}) {
  return (
    <div className="rounded-2xl bg-paper shadow-soft overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-canvas transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Chevron open={open} />
          {Icon && (
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand-50 text-brand shrink-0">
              <Icon size={15} strokeWidth={2} />
            </span>
          )}
          <h2 className="text-base font-display font-bold text-ink tracking-tight truncate">{title}</h2>
        </div>
        {status && <StatusPill status={status} />}
      </button>
      {open ? children : summary != null ? <div className="px-5 pb-4">{summary}</div> : null}
    </div>
  );
}
