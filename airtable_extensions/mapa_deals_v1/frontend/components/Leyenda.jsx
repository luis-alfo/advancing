// Leyenda compacta y horizontal, pensada como overlay al pie del mapa.
import React from 'react';
import {radiusFor, SWATCHES, POINT_FILL, POINT_STROKE, POINT_OPACITY} from '../lib/scales';

export default function Leyenda({maxProvince, maxCP}) {
  const sizes = [...new Set([1, Math.ceil((maxCP || 1) / 2), maxCP || 1])].filter((v) => v > 0);
  return (
    <div className="flex items-center gap-3 bg-paper/90 border border-line rounded-lg px-3 py-1.5 shadow-card text-[10px]">
      <div>
        <div className="text-slate-400 mb-0.5">Deals por región</div>
        <div className="flex items-center gap-1">
          <span className="text-slate-400">0</span>
          <div className="flex rounded overflow-hidden">
            {SWATCHES.map((c) => (
              <div key={c} className="w-5 h-2.5" style={{backgroundColor: c}} />
            ))}
          </div>
          <span className="text-slate-500 font-semibold tabular-nums">{maxProvince || 0}</span>
        </div>
      </div>
      <div className="w-px h-7 bg-line" />
      <div>
        <div className="text-slate-400 mb-0.5">Por código postal</div>
        <div className="flex items-end gap-2">
          {sizes.map((n) => {
            const r = Math.min(radiusFor(n), 10);
            return (
              <div key={n} className="flex flex-col items-center">
                <svg width={r * 2 + 2} height={r * 2 + 2}>
                  <circle cx={r + 1} cy={r + 1} r={r} fill={POINT_FILL} fillOpacity={POINT_OPACITY} stroke={POINT_STROKE} strokeWidth={0.7} />
                </svg>
                <span className="text-slate-400 tabular-nums">{n}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
