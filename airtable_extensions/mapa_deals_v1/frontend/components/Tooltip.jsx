// Tooltip flotante. createPortal(document.body) porque backdrop-filter en ancestros
// rompe position:fixed (trampa heredada de gestor_deal_v1).
import React from 'react';
import {createPortal} from 'react-dom';

export default function Tooltip({data}) {
  if (!data) return null;
  const {x, y, title, rows} = data;
  return createPortal(
    <div className="fixed z-50 pointer-events-none" style={{left: x + 14, top: y + 14}}>
      <div className="bg-navy text-paper rounded-lg px-3 py-2 shadow-soft border border-brand-900/40 max-w-[260px]">
        <div className="text-xs font-semibold tracking-tight">{title}</div>
        {rows && rows.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {rows.map((r, i) => (
              <div key={i} className="text-[11px] text-brand-200 flex items-center justify-between gap-3">
                <span>{r.label}</span>
                <span className="font-semibold text-paper tabular-nums">{r.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
