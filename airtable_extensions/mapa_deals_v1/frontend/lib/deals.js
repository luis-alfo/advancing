// Transformación deals → datos del mapa: normalización, filtro temporal y agregados.
import {F, cell, first, normCP, normName, closeYM, ACTIVE_STATUSES} from './airtable';
import {PROV_TO_CCAA} from './regions';
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

// Agregados jerárquicos para el render adaptativo al zoom: CCAA, provincia, municipio y CP.
export function aggregate(deals) {
  const byCCAA = new Map(); // ccaaINE → count
  const byProvince = new Map(); // provINE → count
  const byMunicipio = new Map(); // key → {key, name, provINE, lnglat, count}
  const byCP = new Map(); // cp → {cp, provINE, ciudad, lnglat, count}
  let located = 0;
  let undated = 0;

  for (const d of deals) {
    if (d.provINE) {
      byProvince.set(d.provINE, (byProvince.get(d.provINE) || 0) + 1);
      const cc = PROV_TO_CCAA[d.provINE];
      if (cc) byCCAA.set(cc, (byCCAA.get(cc) || 0) + 1);
    }
    if (d.located && d.cp && d.lnglat) {
      let e = byCP.get(d.cp);
      if (!e) {
        e = {cp: d.cp, provINE: d.provINE, ciudad: d.ciudad, lnglat: d.lnglat, count: 0};
        byCP.set(d.cp, e);
      }
      e.count++;
      located++;
      // Municipio: agrupa por provincia + ciudad normalizada (sin assets extra).
      const cityKey = normName(d.ciudad) || `cp${d.cp}`;
      const mkey = `${d.provINE || '??'}|${cityKey}`;
      let m = byMunicipio.get(mkey);
      if (!m) {
        m = {key: mkey, name: d.ciudad || `CP ${d.cp}`, provINE: d.provINE, count: 0, sumLng: 0, sumLat: 0};
        byMunicipio.set(mkey, m);
      }
      m.count++;
      m.sumLng += d.lnglat[0];
      m.sumLat += d.lnglat[1];
    }
    if (!d.ym) undated++;
  }
  for (const m of byMunicipio.values()) m.lnglat = [m.sumLng / m.count, m.sumLat / m.count];

  const maxOf = (iter, pick) => {
    let mx = 0;
    for (const v of iter) mx = Math.max(mx, pick ? pick(v) : v);
    return mx;
  };
  return {
    byCCAA,
    byProvince,
    byMunicipio,
    byCP,
    maxCCAA: maxOf(byCCAA.values()),
    maxProvince: maxOf(byProvince.values()),
    maxMunicipio: maxOf(byMunicipio.values(), (m) => m.count),
    maxCP: maxOf(byCP.values(), (e) => e.count),
    located,
    undated,
    total: deals.length,
  };
}
