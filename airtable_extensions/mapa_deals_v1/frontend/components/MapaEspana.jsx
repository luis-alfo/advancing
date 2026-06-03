// Mapa SVG de España con detalle adaptativo al zoom:
//   zoom out → CCAA · provincia · municipio · CP (al máximo zoom).
// En cada nivel: relleno/contexto + puntos (municipio/CP) + celdas Voronoi (CP) + etiquetas con recuento.
// Interacción: rueda para zoom, arrastrar para mover, clic en región para encuadrarla, controles +/−/reset.
import React, {useMemo, useState, useRef, useEffect, useCallback} from 'react';
import {geoPath, geoCentroid} from 'd3-geo';
import {Delaunay} from 'd3-delaunay';
import {makeProjection, provinceFeatures, ccaaFeatures, borderMesh} from '../lib/geo';
import {levelForZoom, LEVEL_LABEL} from '../lib/regions';
import {fillFor, radiusFor, EMPTY_FILL, POINT_FILL, POINT_STROKE, POINT_OPACITY} from '../lib/scales';

const W = 640;
const H = 520;
const M = 10;
const MAXK = 9;

const projection = makeProjection(W, H, M);
const path = geoPath(projection);
const mkPaths = (features) =>
  features.map((f) => ({id: f.id, name: f.properties.name, d: path(f), bounds: path.bounds(f), cxy: projection(geoCentroid(f))}));
const PROVINCE_PATHS = mkPaths(provinceFeatures);
const CCAA_PATHS = mkPaths(ccaaFeatures);
const BORDER_D = borderMesh ? path(borderMesh) : null;
const COMPOSITION_D = typeof projection.getCompositionBorders === 'function' ? projection.getCompositionBorders() : null;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function clampView({k, tx, ty}) {
  if (k <= 1) return {k: 1, tx: 0, ty: 0};
  return {k, tx: clamp(tx, W - W * k, 0), ty: clamp(ty, H - H * k, 0)};
}

// Coloca etiquetas evitando solapes (rejilla simple). cands ordenadas por relevancia (count desc).
function layoutLabels(cands, k, tx, ty) {
  const occ = new Set();
  const out = [];
  const cw = 30;
  const ch = 22;
  for (const c of cands) {
    if (!c.x && c.x !== 0) continue;
    const sx = tx + c.x * k;
    const sy = ty + c.y * k;
    if (sx < 8 || sx > W - 8 || sy < 10 || sy > H - 10) continue;
    const key = `${Math.floor(sx / cw)},${Math.floor(sy / ch)}`;
    if (occ.has(key)) continue;
    occ.add(key);
    out.push({...c, sx, sy});
  }
  return out;
}

function MapaEspana({agg, selectedId, onHover, onClickProvince}) {
  const svgRef = useRef(null);
  const [view, setViewRaw] = useState({k: 1, tx: 0, ty: 0});
  const [animate, setAnimate] = useState(false);
  const drag = useRef(null);
  const isDragging = useRef(false);
  const lastMoved = useRef(false);

  const level = levelForZoom(view.k);

  const setView = useCallback((updater, anim) => {
    setAnimate(!!anim);
    setViewRaw((v) => clampView(typeof updater === 'function' ? updater(v) : updater));
  }, []);

  const toSvg = useCallback((clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    return [((clientX - rect.left) / rect.width) * W, ((clientY - rect.top) / rect.height) * H];
  }, []);

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
      onHover(null);
    }
    if (drag.current.moved) setView({k: drag.current.k, tx: drag.current.tx + dx, ty: drag.current.ty + dy}, false);
  }, [toSvg, setView, onHover]);

  const endDrag = useCallback(() => {
    drag.current = null;
    setTimeout(() => {
      isDragging.current = false;
    }, 0);
  }, []);

  const zoomToBounds = useCallback((bounds) => {
    const [[x0, y0], [x1, y1]] = bounds;
    const pad = 30;
    const k = clamp(Math.min((W - 2 * pad) / Math.max(1, x1 - x0), (H - 2 * pad) / Math.max(1, y1 - y0)), 1, MAXK);
    setView({k, tx: W / 2 - ((x0 + x1) / 2) * k, ty: H / 2 - ((y0 + y1) / 2) * k}, true);
  }, [setView]);

  const reset = useCallback(() => setView({k: 1, tx: 0, ty: 0}, true), [setView]);
  const zoomStep = useCallback((dir) => {
    setView((v) => {
      const k = clamp(v.k * (dir > 0 ? 1.5 : 1 / 1.5), 1, MAXK);
      const rf = k / v.k;
      return {k, tx: W / 2 - (W / 2 - v.tx) * rf, ty: H / 2 - (H / 2 - v.ty) * rf};
    }, true);
  }, [setView]);

  const clickRegion = useCallback((id, bounds, isProvince) => {
    if (lastMoved.current) return;
    if (isProvince) onClickProvince(id);
    zoomToBounds(bounds);
  }, [onClickProvince, zoomToBounds]);

  // Marcadores (municipio o CP) proyectados.
  const markers = useMemo(() => {
    if (level !== 'municipio' && level !== 'cp') return [];
    const src = level === 'municipio' ? agg.byMunicipio : agg.byCP;
    const out = [];
    for (const e of src.values()) {
      const xy = projection(e.lnglat);
      if (!xy || Number.isNaN(xy[0])) continue;
      out.push({key: e.key || e.cp, cp: e.cp, name: e.name || e.ciudad, ciudad: e.ciudad, count: e.count, cx: xy[0], cy: xy[1], r: radiusFor(e.count)});
    }
    out.sort((a, b) => b.r - a.r);
    return out;
  }, [level, agg]);

  // Celdas Voronoi de los CP (solo en el nivel máximo).
  const voronoi = useMemo(() => {
    if (level !== 'cp' || markers.length < 2) return null;
    const del = Delaunay.from(markers.map((m) => [m.cx, m.cy]));
    const vor = del.voronoi([0, 0, W, H]);
    return markers.map((m, i) => vor.renderCell(i));
  }, [level, markers]);

  // Etiquetas candidatas del nivel (ordenadas por recuento desc).
  const labelCands = useMemo(() => {
    let c = [];
    if (level === 'ccaa') {
      c = CCAA_PATHS.filter((p) => p.cxy && agg.byCCAA.get(p.id)).map((p) => ({x: p.cxy[0], y: p.cxy[1], name: p.name, count: agg.byCCAA.get(p.id), showName: true}));
    } else if (level === 'provincia') {
      c = PROVINCE_PATHS.filter((p) => p.cxy && agg.byProvince.get(p.id)).map((p) => ({x: p.cxy[0], y: p.cxy[1], name: p.name, count: agg.byProvince.get(p.id), showName: true}));
    } else {
      c = markers.map((m) => ({x: m.cx, y: m.cy, name: m.name, count: m.count, showName: level === 'municipio'}));
    }
    c.sort((a, b) => b.count - a.count);
    return c;
  }, [level, agg, markers]);

  const labels = useMemo(() => layoutLabels(labelCands, view.k, view.tx, view.ty), [labelCands, view]);

  const fillsProv = useMemo(() => {
    const m = new Map();
    for (const p of PROVINCE_PATHS) m.set(p.id, fillFor(agg.byProvince.get(p.id) || 0, agg.maxProvince));
    return m;
  }, [agg]);

  const tipRegion = (name, count, e) => onHover({x: e.clientX, y: e.clientY, title: name, rows: [{label: 'Deals activos', value: count}]});
  const tipMarker = (m, e) => onHover({x: e.clientX, y: e.clientY, title: level === 'cp' ? `CP ${m.cp}${m.ciudad ? ` · ${m.ciudad}` : ''}` : m.name, rows: [{label: 'Deals', value: m.count}]});

  const btn = 'w-7 h-7 flex items-center justify-center rounded-md bg-paper border border-line text-navy shadow-card hover:bg-canvas hover:text-brand transition-colors text-base leading-none';

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        className="mapa-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Mapa de deals activos"
        style={{cursor: drag.current ? 'grabbing' : 'grab', touchAction: 'none'}}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={endDrag}
        onMouseLeave={() => {
          endDrag();
          onHover(null);
        }}
      >
        <defs>
          {BORDER_D && (
            <clipPath id="esp-clip">
              <path d={BORDER_D} />
            </clipPath>
          )}
        </defs>

        <g transform={`translate(${view.tx},${view.ty}) scale(${view.k})`} className={animate ? 'mapa-zoom-anim' : undefined}>
          {level === 'ccaa' ? (
            <>
              {CCAA_PATHS.map((c) => {
                const count = agg.byCCAA.get(c.id) || 0;
                return (
                  <path
                    key={c.id}
                    className="provincia"
                    d={c.d}
                    fill={fillFor(count, agg.maxCCAA)}
                    stroke="#ffffff"
                    strokeWidth={0.7}
                    vectorEffect="non-scaling-stroke"
                    onMouseMove={(e) => tipRegion(c.name, count, e)}
                    onMouseLeave={() => onHover(null)}
                    onClick={() => clickRegion(c.id, c.bounds, false)}
                  />
                );
              })}
              {PROVINCE_PATHS.map((p) => (
                <path key={p.id} d={p.d} fill="none" stroke="#ffffff" strokeWidth={0.3} strokeOpacity={0.6} vectorEffect="non-scaling-stroke" pointerEvents="none" />
              ))}
            </>
          ) : (
            PROVINCE_PATHS.map((p) => {
              const count = agg.byProvince.get(p.id) || 0;
              const isSel = selectedId === p.id;
              const fill = level === 'provincia' ? fillsProv.get(p.id) : EMPTY_FILL;
              return (
                <path
                  key={p.id}
                  className="provincia"
                  d={p.d}
                  fill={fill}
                  stroke={isSel ? '#43feae' : '#ffffff'}
                  strokeWidth={isSel ? 1.6 : 0.6}
                  vectorEffect="non-scaling-stroke"
                  onMouseMove={(e) => tipRegion(p.name, count, e)}
                  onMouseLeave={() => onHover(null)}
                  onClick={() => clickRegion(p.id, p.bounds, true)}
                />
              );
            })
          )}

          {BORDER_D && <path d={BORDER_D} fill="none" stroke="#02005c" strokeWidth={0.8} strokeOpacity={0.5} vectorEffect="non-scaling-stroke" pointerEvents="none" />}
          {COMPOSITION_D && <path d={COMPOSITION_D} fill="none" stroke="#cbd0d8" strokeWidth={0.7} strokeDasharray="3 2" vectorEffect="non-scaling-stroke" pointerEvents="none" />}

          {voronoi && (
            <g clipPath="url(#esp-clip)" pointerEvents="none">
              {voronoi.map((d, i) => d && <path key={markers[i].key} d={d} fill="none" stroke="#24df86" strokeWidth={0.5} strokeOpacity={0.55} vectorEffect="non-scaling-stroke" />)}
            </g>
          )}

          {(level === 'municipio' || level === 'cp') &&
            markers.map((m) => (
              <circle
                key={m.key}
                className="punto"
                cx={m.cx}
                cy={m.cy}
                r={m.r / view.k}
                fill={POINT_FILL}
                fillOpacity={POINT_OPACITY}
                stroke={POINT_STROKE}
                strokeWidth={0.7}
                vectorEffect="non-scaling-stroke"
                onMouseMove={(e) => tipMarker(m, e)}
                onMouseLeave={() => onHover(null)}
              />
            ))}
        </g>

        {/* Etiquetas en coordenadas del viewBox (tamaño constante, fuera del grupo escalado). */}
        <g pointerEvents="none">
          {labels.map((l, i) => (
            <text key={i} x={l.sx} y={l.sy} textAnchor="middle" style={{paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: 3, strokeLinejoin: 'round'}}>
              {l.showName && (
                <tspan x={l.sx} dy="-0.15em" fontSize="8.5" fontWeight="600" fill="#162040">
                  {l.name}
                </tspan>
              )}
              <tspan x={l.sx} dy={l.showName ? '1.05em' : '0.32em'} fontSize="11.5" fontWeight="800" fill="#050f8d">
                {l.count}
              </tspan>
            </text>
          ))}
        </g>
      </svg>

      <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-paper/90 border border-line text-[10px] font-semibold text-navy shadow-card pointer-events-none">
        {LEVEL_LABEL[level]}
      </div>
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <button type="button" className={btn} title="Acercar" onClick={() => zoomStep(1)}>+</button>
        <button type="button" className={btn} title="Alejar" onClick={() => zoomStep(-1)}>−</button>
        <button type="button" className={btn} title="Vista completa" onClick={reset} disabled={view.k === 1} style={{opacity: view.k === 1 ? 0.5 : 1}}>⟲</button>
      </div>
    </div>
  );
}

export default React.memo(MapaEspana);
