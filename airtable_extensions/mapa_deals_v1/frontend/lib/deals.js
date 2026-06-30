// Transformación deals → datos del mapa: normalización, filtro temporal, agregados y estadísticas.
import {F, firstStr, cellStr, dateISO, cellNum, normCP, normName, closeYM, REALIZADO_STATUSES, TERMINADO_STATUS} from './airtable';
import {PROV_TO_CCAA} from './regions';
import {cpLngLat, provinceLngLat, hasProvince} from './geo';

// Normaliza un record de deal a un objeto plano para el mapa + análisis.
export function toDeal(record) {
  const status = firstStr(record, F.status);
  const statusAplicable = cellStr(record, F.statusAplicable);
  const cp = normCP(firstStr(record, F.cp));
  const provINE = cp ? cp.slice(0, 2) : null;
  const ciudad = firstStr(record, F.ciudad);
  const direccion = firstStr(record, F.direccion);
  const provinciaTxt = firstStr(record, F.provincia);
  const ym = closeYM(record); // {year, month, idx} | null
  // Posición: centroide del CP; si falta, centroide de la provincia (degradación elegante).
  let lnglat = cp ? cpLngLat(cp) : null;
  const located = !!lnglat;
  if (!lnglat && provINE && hasProvince(provINE)) lnglat = provinceLngLat(provINE);
  return {
    id: record.id,
    status,
    statusAplicable,
    cp,
    provINE,
    ciudad,
    direccion,
    provinciaTxt,
    ym,
    lnglat,
    located,
    // campos de análisis (panel de deals)
    canal: firstStr(record, F.canal),
    tipoContrato: firstStr(record, F.tipoContrato),
    producto: firstStr(record, F.producto),
    inicio: dateISO(record, F.fechaInicio),
    fin: dateISO(record, F.fechaFin),
    alquiler: cellNum(record, F.alquiler),
    agencia: firstStr(record, F.agencia),
  };
}

// Rango temporal de cierre sobre TODOS los records (no solo activos), limitado a 48 meses
// hacia atrás, para que el filtro de meses ofrezca histórico aunque la cartera activa sea reciente.
export function allMonthRange(records) {
  let min = Infinity;
  let max = -Infinity;
  for (const r of records) {
    const ym = closeYM(r);
    if (!ym) continue;
    if (ym.idx < min) min = ym.idx;
    if (ym.idx > max) max = ym.idx;
  }
  if (min === Infinity) return null;
  return {min: Math.max(min, max - 47), max};
}

// Filtra por facetas (canal / producto / tipo de contrato / agencia). Cada faceta es un valor o null.
export function filterByFacets(deals, facets) {
  if (!facets || (!facets.canal && !facets.producto && !facets.tipo && !facets.agencia)) return deals;
  return deals.filter(
    (d) =>
      (!facets.canal || d.canal === facets.canal) &&
      (!facets.producto || d.producto === facets.producto) &&
      (!facets.tipo || d.tipoContrato === facets.tipo) &&
      (!facets.agencia || d.agencia === facets.agencia),
  );
}

// Cartera activa: statusAplicable en estado 'realizado' (eslabón vivo) y contrato no vencido (deal status ≠ TERMINADO).
// No usa el antiguo filtro temporal puro (deal status), que colaba cancelados/finalizados/caídas/pipeline/standby.
export function activeDeals(records) {
  const out = [];
  for (const r of records) {
    if (!REALIZADO_STATUSES.has(cellStr(r, F.statusAplicable))) continue;
    if (firstStr(r, F.status) === TERMINADO_STATUS) continue;
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

// Agregados jerárquicos. Cada entrada guarda {count, deals[]} (+ posición en municipio/CP) para el panel.
export function aggregate(deals) {
  const byCCAA = new Map();
  const byProvince = new Map();
  const byMunicipio = new Map();
  const byCP = new Map();
  const byAgencia = new Map();
  let located = 0;
  let undated = 0;

  const bump = (map, key, init) => {
    let e = map.get(key);
    if (!e) {
      e = init();
      map.set(key, e);
    }
    return e;
  };

  for (const d of deals) {
    if (d.agencia) {
      const a = bump(byAgencia, d.agencia, () => ({count: 0, deals: []}));
      a.count++;
      a.deals.push(d);
    }
    if (d.provINE) {
      const p = bump(byProvince, d.provINE, () => ({count: 0, deals: []}));
      p.count++;
      p.deals.push(d);
      const cc = PROV_TO_CCAA[d.provINE];
      if (cc) {
        const c = bump(byCCAA, cc, () => ({count: 0, deals: []}));
        c.count++;
        c.deals.push(d);
      }
    }
    if (d.located && d.cp && d.lnglat) {
      const e = bump(byCP, d.cp, () => ({cp: d.cp, provINE: d.provINE, ciudad: d.ciudad, lnglat: d.lnglat, count: 0, deals: []}));
      e.count++;
      e.deals.push(d);
      located++;
      const cityKey = normName(d.ciudad) || `cp${d.cp}`;
      const mkey = `${d.provINE || '??'}|${cityKey}`;
      const m = bump(byMunicipio, mkey, () => ({key: mkey, name: d.ciudad || `CP ${d.cp}`, provINE: d.provINE, count: 0, deals: [], sumLng: 0, sumLat: 0}));
      m.count++;
      m.deals.push(d);
      m.sumLng += d.lnglat[0];
      m.sumLat += d.lnglat[1];
    }
    if (!d.ym) undated++;
  }
  for (const m of byMunicipio.values()) m.lnglat = [m.sumLng / m.count, m.sumLat / m.count];

  const maxOf = (iter) => {
    let mx = 0;
    for (const v of iter) mx = Math.max(mx, v.count);
    return mx;
  };
  return {
    byCCAA,
    byProvince,
    byMunicipio,
    byCP,
    byAgencia,
    maxCCAA: maxOf(byCCAA.values()),
    maxProvince: maxOf(byProvince.values()),
    maxMunicipio: maxOf(byMunicipio.values()),
    maxCP: maxOf(byCP.values()),
    located,
    undated,
    total: deals.length,
  };
}

// Estadísticas de una lista de deals (para el panel y los KPIs): ticket medio, total renta, breakdowns.
export function statsOf(deals) {
  let sum = 0;
  let n = 0;
  const byCanal = new Map();
  const byProducto = new Map();
  const byTipo = new Map();
  const byAgencia = new Map();
  const inc = (map, k) => map.set(k || '—', (map.get(k || '—') || 0) + 1);
  const incIf = (map, k) => {
    if (k) map.set(k, (map.get(k) || 0) + 1);
  };
  for (const d of deals) {
    if (typeof d.alquiler === 'number') {
      sum += d.alquiler;
      n++;
    }
    inc(byCanal, d.canal);
    inc(byProducto, d.producto);
    inc(byTipo, d.tipoContrato);
    incIf(byAgencia, d.agencia);
  }
  const sortDesc = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]);
  return {
    count: deals.length,
    avgAlquiler: n ? sum / n : null,
    totalAlquiler: sum,
    nConAlquiler: n,
    byCanal: sortDesc(byCanal),
    byProducto: sortDesc(byProducto),
    byTipo: sortDesc(byTipo),
    byAgencia: sortDesc(byAgencia),
  };
}

// Pareto de agencias por nº de operaciones. `entries`: [[nombre, count], ...] (p. ej. statsOf().byAgencia).
// `totalVivas`: denominador = total de operaciones vivas (INCLUIDAS las sin agencia) → el % y el corte
// del umbral se miden sobre ese total. Ordena desc, acumula, marca el corte del 80% y agrupa la cola.
export function paretoAgencias(entries, totalVivas, {threshold = 0.8, tailExtra = 3} = {}) {
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const total = totalVivas || 0;
  const sumAgencias = sorted.reduce((s, [, c]) => s + c, 0);
  const sinAgencia = Math.max(0, total - sumAgencias);

  let cum = 0;
  const all = sorted.map(([name, count]) => {
    cum += count;
    return {name, count, pct: total ? count / total : 0, cumCount: cum, cumPct: total ? cum / total : 0};
  });

  // Índice (0-based) de la última agencia necesaria para que el acumulado cruce el umbral.
  // -1 si las agencias no llegan al umbral (demasiadas operaciones sin agencia).
  let cutIndex = -1;
  for (let i = 0; i < all.length; i++) {
    if (all[i].cumPct >= threshold) {
      cutIndex = i;
      break;
    }
  }
  const reaches = cutIndex >= 0;

  // Mostrar hasta el corte + cola corta; si no se alcanza el umbral, mostrar todas.
  const shownCount = reaches ? Math.min(all.length, cutIndex + 1 + tailExtra) : all.length;
  const rows = all.slice(0, shownCount);
  const hidden = all.slice(shownCount);
  const otherCount = hidden.reduce((s, r) => s + r.count, 0);

  return {
    rows,
    total,
    maxCount: all.length ? all[0].count : 0,
    cutIndex: reaches ? cutIndex : -1, // posición dentro de `rows` tras la cual va la línea
    reaches80: reaches,
    threshold,
    sinAgencia,
    sinAgenciaPct: total ? sinAgencia / total : 0,
    otherAgencias: hidden.length,
    otherCount,
    otherPct: total ? otherCount / total : 0,
  };
}
