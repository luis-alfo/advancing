// Genera los assets geográficos que empaqueta la extensión (frontend/geo/).
// Se ejecuta UNA vez (o cuando haya que refrescar las fuentes), FUERA del block → sin CORS en runtime.
//   node scripts/build-geo.mjs
// Fuentes (cacheadas en scripts/.cache/, gitignored):
//   - Provincias: es-atlas (TopoJSON, id = código INE de provincia). https://github.com/martgnz/es-atlas
//   - Centroides de CP: GeoNames ES (CC-BY). https://download.geonames.org/export/zip/ES.zip
// Requiere Node 18+ (fetch nativo) y `unzip` en el PATH (macOS/Linux lo traen).
import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'node:fs';
import {execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const CACHE = join(here, '.cache');
const GEO = join(here, '..', 'frontend', 'geo');
mkdirSync(CACHE, {recursive: true});
mkdirSync(GEO, {recursive: true});

async function download(url, dest) {
  if (existsSync(dest)) return;
  process.stdout.write(`↓ ${url}\n`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

// 1) Provincias (es-atlas) → solo objetos provinces + border para adelgazar.
await download('https://unpkg.com/es-atlas/es/provinces.json', join(CACHE, 'es-provinces.json'));
const atlas = JSON.parse(readFileSync(join(CACHE, 'es-provinces.json'), 'utf8'));
const objects = {};
for (const k of ['autonomous_regions', 'provinces', 'border']) if (atlas.objects[k]) objects[k] = atlas.objects[k];
const provincias = {type: 'Topology', transform: atlas.transform, objects, arcs: atlas.arcs};
writeFileSync(join(GEO, 'provincias-es.json'), JSON.stringify(provincias));

// 2) Centroides de CP (GeoNames) → promediar filas del mismo CP, redondear a 4 decimales.
await download('https://download.geonames.org/export/zip/ES.zip', join(CACHE, 'ES.zip'));
execSync(`unzip -o -q "${join(CACHE, 'ES.zip')}" ES.txt -d "${CACHE}"`);
const tsv = readFileSync(join(CACHE, 'ES.txt'), 'utf8');
const acc = new Map();
for (const line of tsv.split('\n')) {
  const c = line.split('\t'); // 1=postal_code, 9=lat, 10=lng
  if (c.length < 11) continue;
  const cp = c[1].trim();
  const lat = parseFloat(c[9]);
  const lng = parseFloat(c[10]);
  if (!cp || Number.isNaN(lat) || Number.isNaN(lng)) continue;
  (acc.get(cp) || acc.set(cp, []).get(cp)).push([lat, lng]);
}
const centroides = {};
for (const [cp, pts] of acc) {
  const la = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const lo = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  centroides[cp] = [Math.round(la * 1e4) / 1e4, Math.round(lo * 1e4) / 1e4];
}
writeFileSync(join(GEO, 'cp-centroides.json'), JSON.stringify(centroides));

console.log(`✓ provincias-es.json (${Object.keys(objects).length} objetos) · cp-centroides.json (${Object.keys(centroides).length} CPs)`);
