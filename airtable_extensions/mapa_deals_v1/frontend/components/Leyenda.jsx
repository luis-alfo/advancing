// Leyenda: escala de color (densidad por provincia) + escala de tamaño (puntos por CP).
import React from 'react';
import {radiusFor, SWATCHES, POINT_FILL, POINT_STROKE, POINT_OPACITY} from '../lib/scales';

export default function Leyenda({maxProvince, maxCP}) {
  const sizes = [...new Set([1, Math.ceil((maxCP || 1) / 2), maxCP || 1])].filter((v) => v > 0);
  return (
    <div className="space-y-3">
      <div>
        <div className="text-[11px] font-semibold text-navy mb-1">Deals por provincia</div>
        <div className="flex items-center gap-0 rounded overflow-hidden">
          {SWATCHES.map((c) => (
            <div key={c} className="h-3 flex-1" style={{backgroundColor: c}} />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
          <span>0</span>
          <span>{maxProvince || 0}</span>
        </div>
      </div>
      <div>
        <div className="text-[11px] font-semibold text-navy mb-1">Deals por código postal</div>
        <div className="flex items-end gap-4 pl-1">
          {sizes.map((n) => {
            const r = radiusFor(n);
            return (
              <div key={n} className="flex flex-col items-center gap-0.5">
                <svg width={r * 2 + 2} height={r * 2 + 2}>
                  <circle cx={r + 1} cy={r + 1} r={r} fill={POINT_FILL} fillOpacity={POINT_OPACITY} stroke={POINT_STROKE} strokeWidth={0.7} />
                </svg>
                <span className="text-[10px] text-slate-500 tabular-nums">{n}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
