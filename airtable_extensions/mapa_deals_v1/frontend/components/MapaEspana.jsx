// Mapa SVG de España: coropleta de provincias (densidad de deals) + puntos por CP (radio ∝ nº deals).
// Interacción: rueda para zoom, arrastrar para desplazar, clic en provincia para encuadrarla, controles +/−/reset.
// Paths/proyección son constantes de módulo; solo fills, puntos y la vista (zoom) cambian en runtime.
import React, {useMemo, useState, useRef, useEffect, useCallback} from 'react';
import {geoPath} from 'd3-geo';
import {makeProjection, provinceFeatures, borderMesh} from '../lib/geo';
import {fillFor, radiusFor, POINT_FILL, POINT_STROKE, POINT_OPACITY} from '../lib/scales';

const W = 640;
const H = 520;
const M = 10;
const MAXK = 9;

const projection = makeProjection(W, H, M);
const path = geoPath(projection);
const PROVINCE_PATHS = provinceFeatures.map((f) => ({id: f.id, name: f.properties.name, d: path(f), bounds: path.bounds(f)}));
const BORDER_D = borderMesh ? path(borderMesh) : null;
const COMPOSITION_D = typeof projection.getCompositionBorders === 'function' ? projection.getCompositionBorders() : null;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function clampView({k, tx, ty}) {
  if (k <= 1) return {k: 1, tx: 0, ty: 0};
  return {k, tx: clamp(tx, W - W * k, 0), ty: clamp(ty, H - H * k, 0)};
}

function MapaEspana({agg, selectedId, onHoverProvince, onHoverPoint, onClickProvince}) {
  const svgRef = useRef(null);
  const [view, setViewRaw] = useState({k: 1, tx: 0, ty: 0});
  const [animate, setAnimate] = useState(false);
  const drag = useRef(null);
  const isDragging = useRef(false);
  const lastMoved = useRef(false);

  const setView = useCallback((updater, anim) => {
    setAnimate(!!anim);
    setViewRaw((v) => clampView(typeof updater === 'function' ? updater(v) : updater));
  }, []);

  const toSvg = useCallback((clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    return [((clientX - rect.left) / rect.width) * W, ((clientY - rect.top) / rect.height) * H];
  }, []);

  // Zoom con rueda hacia el cursor (listener no-passive para poder preventDefault).
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      const [sx, sy] = toSvg(e.clientX, e.clientY);
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      setView((v) => {
        const k = clamp(v.k * factor, 1, MAXK);
        const rf = k / v.k;
        return {k, tx: sx - (sx - v.tx) * rf, ty: sy - (sy - v.ty) * rf};
      }, false);
    };
    el.addEventListener('wheel', onWheel, {passive: false});
    return () => el.removeEventListener('wheel', onWheel);
  }, [setView, toSvg]);

  const onPointerDown = useCallback((e) => {
    if (e.button !== 0) return;
    const [sx, sy] = toSvg(e.clientX, e.clientY);
    drag.current = {sx, sy, tx: view.tx, ty: view.ty, k: view.k, moved: false};
    lastMoved.current = false;
  }, [toSvg, view]);

  const onPointerMove = useCallback((e) => {
    if (!drag.current) return;
    const [sx, sy] = toSvg(e.clientX, e.clientY);
    const dx = sx - drag.current.sx;
    const dy = sy - drag.current.sy;
    if (!drag.current.moved && Math.abs(dx) + Math.abs(dy) > 3) {
      drag.current.moved = true;
      lastMoved.current = true;
      isDragging.current = true;
      onHoverProvince(null);
    }
    if (drag.current.moved) setView({k: drag.current.k, tx: drag.current.tx + dx, ty: drag.current.ty + dy}, false);
  }, [toSvg, setView, onHoverProvince]);

  const endDrag = useCallback(() => {
    drag.current = null;
    setTimeout(() => {
      isDragging.current = false;
    }, 0);
  }, []);

  const zoomToProvince = useCallback((bounds) => {
    const [[x0, y0], [x1, y1]] = bounds;
    const pad = 28;
    const k = clamp(Math.min((W - 2 * pad) / Math.max(1, x1 - x0), (H - 2 * pad) / Math.max(1, y1 - y0)), 1, MAXK);
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    setView({k, tx: W / 2 - cx * k, ty: H / 2 - cy * k}, true);
  }, [setView]);

  const reset = useCallback(() => setView({k: 1, tx: 0, ty: 0}, true), [setView]);
  const zoomStep = useCallback((dir) => {
    setView((v) => {
      const k = clamp(v.k * (dir > 0 ? 1.5 : 1 / 1.5), 1, MAXK);
      const rf = k / v.k;
      return {k, tx: W / 2 - (W / 2 - v.tx) * rf, ty: H / 2 - (H / 2 - v.ty) * rf};
    }, true);
  }, [setView]);

  const onProvinceClick = useCallback((p) => {
    if (lastMoved.current) return; // fue un desplazamiento, no un clic
    if (selectedId === p.id) {
      onClickProvince(p.id);
      reset();
    } else {
      onClickProvince(p.id);
      zoomToProvince(p.bounds);
    }
  }, [selectedId, onClickProvince, reset, zoomToProvince]);

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
    out.sort((a, b) => b.r - a.r);
    return out;
  }, [agg]);

  const hoverProvince = (payload) => {
    if (isDragging.current) return;
    onHoverProvince(payload);
  };
  const hoverPoint = (payload) => {
    if (isDragging.current) return;
    onHoverPoint(payload);
  };

  const btn = 'w-7 h-7 flex items-center justify-center rounded-md bg-paper border border-line text-navy shadow-card hover:bg-canvas hover:text-brand transition-colors text-base leading-none';

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        className="mapa-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Mapa de deals activos por provincia y código postal"
        style={{cursor: drag.current ? 'grabbing' : 'grab', touchAction: 'none'}}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={endDrag}
        onMouseLeave={() => {
          endDrag();
          onHoverProvince(null);
        }}
      >
        <g transform={`translate(${view.tx},${view.ty}) scale(${view.k})`} className={animate ? 'mapa-zoom-anim' : undefined}>
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
                vectorEffect="non-scaling-stroke"
                onMouseMove={(e) => hoverProvince({provINE: p.id, name: p.name, count, x: e.clientX, y: e.clientY})}
                onMouseLeave={() => onHoverProvince(null)}
                onClick={() => onProvinceClick(p)}
              />
            );
          })}
          {BORDER_D && <path d={BORDER_D} fill="none" stroke="#02005c" strokeWidth={0.8} strokeOpacity={0.5} vectorEffect="non-scaling-stroke" pointerEvents="none" />}
          {COMPOSITION_D && <path d={COMPOSITION_D} fill="none" stroke="#cbd0d8" strokeWidth={0.7} strokeDasharray="3 2" vectorEffect="non-scaling-stroke" pointerEvents="none" />}
          <g>
            {points.map((pt) => (
              <circle
                key={pt.cp}
                className="punto"
                cx={pt.cx}
                cy={pt.cy}
                r={pt.r / view.k}
                fill={POINT_FILL}
                fillOpacity={POINT_OPACITY}
                stroke={POINT_STROKE}
                strokeWidth={0.7}
                vectorEffect="non-scaling-stroke"
                onMouseMove={(e) => hoverPoint({...pt, x: e.clientX, y: e.clientY})}
                onMouseLeave={() => onHoverPoint(null)}
              />
            ))}
          </g>
        </g>
      </svg>

      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <button type="button" className={btn} title="Acercar" onClick={() => zoomStep(1)}>+</button>
        <button type="button" className={btn} title="Alejar" onClick={() => zoomStep(-1)}>−</button>
        <button type="button" className={btn} title="Vista completa" onClick={reset} disabled={view.k === 1} style={{opacity: view.k === 1 ? 0.5 : 1}}>⟲</button>
      </div>
    </div>
  );
}

export default React.memo(MapaEspana);
