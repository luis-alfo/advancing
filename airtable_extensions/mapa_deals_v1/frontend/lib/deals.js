// Transformación deals → datos del mapa: normalización, filtro temporal y agregados.
import {F, cell, first, normCP, closeYM, ACTIVE_STATUSES} from './airtable';
import {cpLngLat, provinceLngLat, hasProvince} from './geo';

// Normaliza un record de deal a un objeto plano para el mapa.
export function toDeal(record) {
  const status = first(cell(record, F.status));
  const cp = normCP(first(cell(record, F.cp)));
  const provINE = cp ? cp.slice(0, 2) : null;
  const ciudad = first(cell(record, F.ciudad));
  const direccion = first(cell(record, F.direccion));
  const provinciaTxt = first(cell(record, F.provincia));
  const ym = closeYM(record); // {year, month, idx} | null
  // Posición: centroide del CP; si falta, centroide de la provincia (degradación elegante).
  let lnglat = cp ? cpLngLat(cp) : null;
  const located = !!lnglat;
  if (!lnglat && provINE && hasProvince(provINE)) lnglat = provinceLngLat(provINE);
  return {id: record.id, status, cp, provINE, ciudad, direccion, provinciaTxt, ym, lnglat, located};
}

// Solo los deals activos (ABIERTO / EN TRAMITE), ya normalizados.
export function activeDeals(records) {
  const out = [];
  for (const r of records) {
    const status = first(cell(r, F.status));
    if (!ACTIVE_STATUSES.has(status)) continue;
    out.push(toDeal(r));
  }
  return out;
}

// Rango temporal disponible (min/max de idx de cierre).
export function monthRange(deals) {
  let min = Infinity;
  let max = -Infinity;
  for (const d of deals) {
    if (!d.ym) continue;
    if (d.ym.idx < min) min = d.ym.idx;
    if (d.ym.idx > max) max = d.ym.idx;
  }
  return min === Infinity ? null : {min, max};
}

// Filtra por rango [from,to] inclusive sobre idx. Los deals sin fecha solo entran si includeUndated.
export function filterByMonth(deals, from, to, includeUndated) {
  if (from == null || to == null) return deals;
  return deals.filter((d) => (d.ym ? d.ym.idx >= from && d.ym.idx <= to : includeUndated));
}

// Agregados para el render: coropleta (por provincia) y puntos (por CP).
export function aggregate(deals) {
  const byProvince = new Map(); // provINE → count
  const byCP = new Map(); // cp → {cp, provINE, ciudad, lnglat, count}
  let located = 0;
  let undated = 0;
  for (const d of deals) {
    if (d.provINE) byProvince.set(d.provINE, (byProvince.get(d.provINE) || 0) + 1);
    if (d.located && d.cp && d.lnglat) {
      let e = byCP.get(d.cp);
      if (!e) {
        e = {cp: d.cp, provINE: d.provINE, ciudad: d.ciudad, lnglat: d.lnglat, count: 0};
        byCP.set(d.cp, e);
      }
      e.count++;
      located++;
    }
    if (!d.ym) undated++;
  }
  const maxProvince = byProvince.size ? Math.max(...byProvince.values()) : 0;
  const maxCP = byCP.size ? Math.max(...[...byCP.values()].map((e) => e.count)) : 0;
  return {byProvince, byCP, maxProvince, maxCP, located, undated, total: deals.length};
}
