// Capa geográfica: TopoJSON de provincias (es-atlas, id = código INE) + proyección de España
// con inset de Canarias (geoConicConformalSpain de d3-composite-projections) + centroides de CP.
// Todo OFFLINE: los assets se empaquetan en el bundle (cero red en runtime → inmune a CORS/CSP).
import {geoPath, geoCentroid} from 'd3-geo';
import {geoConicConformalSpain} from 'd3-composite-projections';
import {feature, mesh} from 'topojson-client';
import topo from '../geo/provincias-es.json';
import cpCentroids from '../geo/cp-centroides.json';

export const provincesFC = feature(topo, topo.objects.provinces);
export const provinceFeatures = provincesFC.features; // {id:'02', properties:{name:'Albacete'}}
export const borderMesh = topo.objects.border ? mesh(topo, topo.objects.border) : null;

export const PROVINCE_NAME = new Map(provinceFeatures.map((f) => [f.id, f.properties.name]));
// Centroide [lng,lat] por provincia (fallback de posición cuando falta/está sucio el CP).
const PROVINCE_CENTROID = new Map(provinceFeatures.map((f) => [f.id, geoCentroid(f)]));

// Proyección compuesta (península + Baleares + Canarias en inset), ajustada al viewport
// con un margen interior. fitExtent evita recolocar el inset (a diferencia de fitSize + translate).
export function makeProjection(width, height, margin = 0) {
  return geoConicConformalSpain().fitExtent([[margin, margin], [width - margin, height - margin]], provincesFC);
}
export function makePath(projection) {
  return geoPath(projection);
}

// [lng,lat] del centroide de un CP. El asset guarda [lat,lng] → se invierte para d3-geo.
export function cpLngLat(cp) {
  const c = cpCentroids[cp];
  return c ? [c[1], c[0]] : null;
}
export function provinceLngLat(provINE) {
  return PROVINCE_CENTROID.get(provINE) || null;
}
export function hasProvince(provINE) {
  return PROVINCE_NAME.has(provINE);
}
