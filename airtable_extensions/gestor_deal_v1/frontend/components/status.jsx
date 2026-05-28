// Primitivas visuales de estado (marca Advancing). level: 'ok' | 'warn' | 'partial' | 'empty'.
import React from 'react';

export function StatusDot({level}) {
  const map = {
    ok: 'bg-mint-500 ring-mint-100',
    warn: 'bg-amber-500 ring-amber-100',
    partial: 'bg-slate-300 ring-slate-200',
    empty: 'bg-slate-200 ring-transparent',
  };
  return (
    <span className="inline-flex items-center justify-center shrink-0" style={{width: 14, height: 14}}>
      <span className={'rounded-full ring-4 ' + (map[level] || map.empty)} style={{width: 6, height: 6}} />
    </span>
  );
}

export function StatusPill({status}) {
  if (status.level === 'ok') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-mint-100 text-mint-700">
        <StatusDot level="ok" /> Completa
      </span>
    );
  }
  if (status.level === 'warn') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
        <StatusDot level="warn" />
        <span className="tabular-nums">{status.count}</span>{' '}
        {status.count === 1 ? 'incidencia' : 'incidencias'}
      </span>
    );
  }
  if (status.level === 'partial') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-canvas text-slate-500">
        <StatusDot level="partial" />
        <span className="tabular-nums">{status.count}</span> sin rellenar
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-canvas text-slate-400">
      <StatusDot level="empty" /> Sin datos
    </span>
  );
}
