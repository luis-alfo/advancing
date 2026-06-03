// Escalas visuales compartidas (mapa + leyenda), con tokens de marca Advancing.

// --- Radio de los puntos: escala ABSOLUTA (área ∝ nº deals), no relativa al máximo,
// para que un CP con 1 deal se vea igual de pequeño tenga el dataset el tamaño que tenga. ---
export const R_MIN = 3;
export const R_MAX = 22;
const R_K = 3.0;
export function radiusFor(count) {
  if (!count) return 0;
  return Math.min(R_MAX, R_MIN + Math.sqrt(count) * R_K);
}
export const POINT_FILL = '#24df86'; // mint-500
export const POINT_STROKE = '#02005c'; // brand-900
export const POINT_OPACITY = 0.6;

// --- Color de la coropleta: brand-100 → brand-700 según densidad (sqrt realza valores bajos). ---
export const EMPTY_FILL = '#eef1f6'; // provincia sin deals
function hexToRgb(h) {
  const s = h.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}
function mix(c1, c2, t) {
  const a = hexToRgb(c1);
  const b = hexToRgb(c2);
  const f = (i) => Math.round(a[i] + (b[i] - a[i]) * t);
  return `rgb(${f(0)},${f(1)},${f(2)})`;
}
export function fillFor(count, max) {
  if (!count || !max) return EMPTY_FILL;
  return mix('#e6ebff', '#050f8d', Math.sqrt(count / max));
}
export const SWATCHES = [EMPTY_FILL, '#e6ebff', '#aebdf2', '#5d6fc9', '#050f8d'];
