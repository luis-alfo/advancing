// Constantes de la base (Gestor de Operaciones, appuV5kGKzKdXlhoR) y helpers de lectura.
// Trampas respetadas: los lookups multi-valor son ARRAYS → first(); las fechas ES no se
// parsean con new Date(string) salvo ISO de Airtable (fechaCierre ya viene 'YYYY-MM-DD').

export const DEAL_TABLE_ID = 'tblwx73iceuKNaz68'; // tabla `deal` (500 campos)

// Campos mínimos a suscribir (regla: declarar lista por los 500 campos de deal).
export const F = {
  status: 'deal status', // formula → ABIERTO / EN TRAMITE / TERMINADO / #ERROR
  cp: 'CP inmueble', // lookup (array)
  ciudad: 'ciudad inmueble', // lookup (array)
  provincia: 'provincia inmueble', // lookup (array, texto sucio — solo fallback/label)
  direccion: 'direccion inmueble', // lookup (array)
  mesCierre: 'mesCierre', // lookup (array) → 'Mayo 26'
  fechaCierre: 'fechaCierre', // date → 'YYYY-MM-DD'
};
export const DEAL_FIELDS = Object.values(F);

// "Deal activo" = vigente hoy o entrando (decisión de producto).
export const ACTIVE_STATUSES = new Set(['ABIERTO', 'EN TRAMITE']);

// Primer valor de un lookup (array) o el escalar tal cual.
export function first(v) {
  if (Array.isArray(v)) return v.length ? v[0] : null;
  return v == null ? null : v;
}

// Normaliza un nombre para agrupar (sin acentos, minúsculas, sin espacios extra).
export function normName(s) {
  const t = (s == null ? '' : String(s)).trim().toLowerCase().normalize('NFD');
  let out = '';
  for (let i = 0; i < t.length; i++) {
    const c = t.charCodeAt(i);
    if (c >= 0x300 && c <= 0x36f) continue; // marca diacrítica combinante
    out += t[i];
  }
  return out;
}

// Lectura segura de una celda (el SDK y el mock exponen getCellValue).
export function cell(record, name) {
  try {
    return record.getCellValue(name);
  } catch {
    return null;
  }
}

// Normaliza un CP español a 5 dígitos. Devuelve null si no hay 2 dígitos de provincia válidos.
export function normCP(v) {
  if (v == null) return null;
  const digits = String(v).replace(/\D/g, '');
  if (digits.length < 3) return null; // basura tipo 'Alica', '-0000'
  const cp = digits.padStart(5, '0').slice(0, 5);
  const prov = cp.slice(0, 2);
  if (prov === '00') return null; // CP inválido (00xxx no existe en España)
  return cp;
}

const MESES_ES = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
};
export const MESES_ABBR = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Índice ordinal de mes (year*12 + month-1) para ordenar/filtrar en el eje temporal.
export function ymIndex(year, month) {
  return year * 12 + (month - 1);
}
export function labelFromIndex(idx) {
  const year = Math.floor(idx / 12);
  const month = (idx % 12) + 1;
  return `${MESES_ABBR[month]} ${String(year).slice(2)}`;
}

// Deriva {year, month, idx} del cierre. Prioriza fechaCierre (ISO); cae a mesCierre ('Mayo 26').
export function closeYM(record) {
  const fc = cell(record, F.fechaCierre);
  if (typeof fc === 'string' && /^\d{4}-\d{2}-\d{2}/.test(fc)) {
    const year = +fc.slice(0, 4);
    const month = +fc.slice(5, 7);
    if (month >= 1 && month <= 12) return {year, month, idx: ymIndex(year, month)};
  }
  const mc = first(cell(record, F.mesCierre));
  if (typeof mc === 'string') {
    const m = mc.trim().match(/^([a-záéíóú]+)\s+(\d{2,4})$/i);
    if (m) {
      const month = MESES_ES[m[1].toLowerCase()];
      let year = +m[2];
      if (year < 100) year += 2000;
      if (month) return {year, month, idx: ymIndex(year, month)};
    }
  }
  return null;
}
