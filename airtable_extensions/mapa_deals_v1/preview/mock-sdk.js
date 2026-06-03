// Mock del SDK '@airtable/blocks/interface/ui' para el preview local del mapa.
// Renderiza el App REAL con deals ficticios geolocalizados por toda España (sin Airtable ni cert).
// Alias configurado en el comando esbuild (ver scripts npm: preview:build / preview:watch).
import React from 'react';

function makeRecord(id, data) {
  return {
    id,
    getCellValue(name) {
      const v = data[name];
      return v === undefined ? null : v;
    },
    getCellValueAsString(name) {
      const v = data[name];
      if (v == null) return '';
      return Array.isArray(v) ? v.join(', ') : String(v);
    },
  };
}

// D(id, status, CP, ciudad, provincia(txt), direccion, mesCierre, fechaCierre)
// Los lookups del inmueble son ARRAYS (como en la base real).
const D = (id, status, cp, ciudad, prov, dir, mes, fecha) =>
  makeRecord(id, {
    'deal status': status,
    'CP inmueble': cp ? [cp] : [],
    'ciudad inmueble': ciudad ? [ciudad] : [],
    'provincia inmueble': prov ? [prov] : [],
    'direccion inmueble': dir ? [dir] : [],
    mesCierre: mes ? [mes] : [],
    fechaCierre: fecha || '',
  });

const DEALS = [
  // Valencia (concentración alta)
  D('d1', 'ABIERTO', '46001', 'Valencia', 'Valencia', 'Carrer de la Pau 12', 'Mayo 26', '2026-05-15'),
  D('d2', 'ABIERTO', '46010', 'Valencia', 'Valencia', 'Av del Port 80', 'Marzo 26', '2026-03-04'),
  D('d3', 'ABIERTO', '46940', 'Manises', 'Valencia', 'Av Generalitat 3', 'Enero 26', '2026-01-22'),
  D('d4', 'ABIERTO', '46100', 'Burjassot', 'Valencia', "Carrer Mestre Palau 9", 'Octubre 25', '2025-10-10'),
  // Alicante
  D('d5', 'ABIERTO', '03001', 'Alicante', 'Alicante', 'Rambla Méndez Núñez 4', 'Mayo 26', '2026-05-02'),
  D('d6', 'ABIERTO', '03540', 'Alicante', 'Alicante', 'Av de Niza 22', 'Diciembre 25', '2025-12-18'),
  D('d7', 'ABIERTO', '03181', 'Torrevieja', 'Alicante', 'Av de las Cortes Valencianas 7', 'Marzo 26', '2026-03-29'),
  // Barcelona
  D('d8', 'ABIERTO', '08001', 'Barcelona', 'Barcelona', 'Carrer Nou de la Rambla 30', 'Abril 26', '2026-04-12'),
  D('d9', 'ABIERTO', '08025', 'Barcelona', 'Barcelona', 'Carrer de Sardenya 200', 'Septiembre 25', '2025-09-08'),
  D('d10', 'EN TRAMITE', '08902', "L'Hospitalet de Llobregat", 'Barcelona', 'Carrer de Barcelona 5', 'Mayo 26', '2026-05-20'),
  // Madrid
  D('d11', 'ABIERTO', '28012', 'Madrid', 'Madrid', 'Calle de Embajadores 18', 'Febrero 26', '2026-02-14'),
  D('d12', 'ABIERTO', '28045', 'Madrid', 'Madrid', 'Paseo de las Delicias 100', 'Noviembre 25', '2025-11-30'),
  // Otras provincias
  D('d13', 'ABIERTO', '29001', 'Málaga', 'Málaga', 'Alameda Principal 14', 'Marzo 26', '2026-03-11'),
  D('d14', 'ABIERTO', '41001', 'Sevilla', 'Sevilla', 'Calle Sierpes 40', 'Enero 26', '2026-01-09'),
  D('d15', 'ABIERTO', '30001', 'Murcia', 'Murcia', 'Gran Vía Salzillo 6', 'Diciembre 25', '2025-12-02'),
  D('d16', 'ABIERTO', '07001', 'Palma', 'Illes Balears', "Carrer de Sant Miquel 50", 'Abril 26', '2026-04-25'),
  D('d17', 'ABIERTO', '35001', 'Las Palmas de Gran Canaria', 'Las Palmas', 'Calle Mayor de Triana 70', 'Mayo 26', '2026-05-06'),
  D('d18', 'ABIERTO', '50001', 'Zaragoza', 'Zaragoza', 'Calle del Coso 33', 'Octubre 25', '2025-10-21'),
  // Casos borde:
  D('d19', 'TERMINADO', '46001', 'Valencia', 'Valencia', 'Calle terminada 1', 'Mayo 25', '2025-05-01'), // debe filtrarse (no activo)
  D('d20', 'ABIERTO', '03002', 'Alicante', 'Alicante', 'Sin fecha de cierre 2', '', ''), // sin fecha → checkbox
  D('d21', 'ABIERTO', '00000', '', '', 'CP basura, sin ubicar', 'Marzo 26', '2026-03-15'), // CP inválido → no ubica
];

const TABLES = {
  tblwx73iceuKNaz68: {name: 'deal', records: DEALS},
};

export function useBase() {
  return {
    getTableByIdIfExists(id) {
      const t = TABLES[id];
      if (!t) return null;
      return {id, name: t.name, getFieldByNameIfExists: (name) => ({id: name, name})};
    },
  };
}

export function useRecords(table) {
  return (table && TABLES[table.id]?.records) || [];
}

export function expandRecord(record) {
  window.alert('Abriría el detalle nativo del registro: ' + (record && record.id));
}

export function useSearchParams() {
  const [params, setParams] = React.useState({});
  const setSearchParamsAsync = (updater) => {
    setParams((prev) => (typeof updater === 'function' ? updater(prev) : updater));
    return Promise.resolve();
  };
  return {searchParams: params, setSearchParamsAsync};
}

export function initializeBlock() {}
export function loadCSSFromURLAsync() {
  return Promise.resolve();
}
export function useSession() {
  return {};
}
export function useColorScheme() {
  return 'light';
}
