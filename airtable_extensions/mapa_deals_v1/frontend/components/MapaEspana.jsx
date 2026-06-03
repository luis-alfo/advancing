// Mapa SVG de España: coropleta de provincias (densidad de deals) + puntos por CP (radio ∝ nº deals).
// Paths/proyección son constantes de módulo (no se recalculan); solo fills y puntos dependen de los datos.
import React, {useMemo} from 'react';
import {geoPath} from 'd3-geo';
import {makeProjection, provinceFeatures, borderMesh} from '../lib/geo';
import {fillFor, radiusFor, POINT_FILL, POINT_STROKE, POINT_OPACITY} from '../lib/scales';

const W = 640;
const H = 520;
const M = 10;

// Proyección + paths fijos (una sola vez al cargar el módulo).
const projection = makeProjection(W, H, M);
const path = geoPath(projection);
const PROVINCE_PATHS = provinceFeatures.map((f) => ({id: f.id, name: f.properties.name, d: path(f)}));
const BORDER_D = borderMesh ? path(borderMesh) : null;
// Línea discontinua que enmarca el inset de Canarias (propia de la proyección compuesta).
const COMPOSITION_D = typeof projection.getCompositionBorders === 'function' ? projection.getCompositionBorders() : null;

function MapaEspana({agg, selectedId, onHoverProvince, onHoverPoint, onClickProvince}) {
  const fills = useMemo(() => {
    const m = new Map();
    for (const p of PROVINCE_PATHS) m.set(p.id, fillFor(agg.byProvince.get(p.id) || 0, agg.maxProvince));
    return m;
  }, [agg]);

  const points = useMemo(() => {
    const out = [];
    for (const e of agg.byCP.values()) {
      const xy = projection(e.lnglat);
      if (!xy || Number.isNaN(xy[0])) continue;
      out.push({cp: e.cp, ciudad: e.ciudad, provINE: e.provINE, count: e.count, cx: xy[0], cy: xy[1], r: radiusFor(e.count)});
    }
    // grandes detrás, pequeños delante (mejor clicabilidad de los pequeños)
    out.sort((a, b) => b.r - a.r);
    return out;
  }, [agg]);

  return (
    <svg className="mapa-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Mapa de deals activos por provincia y código postal">
      <g>
        {PROVINCE_PATHS.map((p) => {
          const count = agg.byProvince.get(p.id) || 0;
          const isSel = selectedId === p.id;
          return (
            <path
              key={p.id}
              className="provincia"
              d={p.d}
              fill={fills.get(p.id)}
              stroke={isSel ? '#43feae' : '#ffffff'}
              strokeWidth={isSel ? 1.6 : 0.6}
              onMouseMove={(e) => onHoverProvince({provINE: p.id, name: p.name, count, x: e.clientX, y: e.clientY})}
              onMouseLeave={() => onHoverProvince(null)}
              onClick={() => onClickProvince(p.id)}
            />
          );
        })}
        {BORDER_D && <path d={BORDER_D} fill="none" stroke="#02005c" strokeWidth={0.8} strokeOpacity={0.5} pointerEvents="none" />}
        {COMPOSITION_D && <path d={COMPOSITION_D} fill="none" stroke="#cbd0d8" strokeWidth={0.7} strokeDasharray="3 2" pointerEvents="none" />}
        <g>
          {points.map((pt) => (
            <circle
              key={pt.cp}
              className="punto"
              cx={pt.cx}
              cy={pt.cy}
              r={pt.r}
              fill={POINT_FILL}
              fillOpacity={POINT_OPACITY}
              stroke={POINT_STROKE}
              strokeWidth={0.7}
              onMouseMove={(e) => onHoverPoint({...pt, x: e.clientX, y: e.clientY})}
              onMouseLeave={() => onHoverPoint(null)}
            />
          ))}
        </g>
      </g>
    </svg>
  );
}

export default React.memo(MapaEspana);
