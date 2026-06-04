// Constantes de la base (Gestor de Operaciones, appuV5kGKzKdXlhoR) y helpers de lectura.
// CLAVE: en el SDK real, getCellValue de un lookup (multipleLookupValues) devuelve un array de
// objetos { value } — no de strings. Por eso para TEXTO usamos getCellValueAsString (robusto:
// devuelve lo que se ve en la celda). Para la FECHA usamos getCellValue (ISO), porque
// getCellValueAsString daría formato local D/M/YYYY (trampa de fechas ES).

export const DEAL_TABLE_ID = 'tblwx73iceuKNaz68'; // tabla `deal` (500 campos)

// Campos mínimos a suscribir (regla: declarar lista por los 500 campos de deal).
export const F = {
  status: 'deal status', // formula → ABIERTO / EN TRAMITE / TERMINADO / #ERROR
  cp: 'CP inmueble', // lookup (array de {value})
  ciudad: 'ciudad inmueble', // lookup
  provincia: 'provincia inmueble', // lookup (texto sucio — solo fallback/label)
  direccion: 'direccion inmueble', // lookup
  mesCierre: 'mesCierre', // lookup → 'Mayo 26'
  fechaCierre: 'fechaCierre', // date → 'YYYY-MM-DD'
  // Análisis (panel de deals):
  canal: 'canal de entrada', // singleSelect → B2B2C / B2C
  tipoContrato: 'tipo contrato', // singleSelect → NUEVO / RENOVACION / EXTENSION / FLEXIBLE
  producto: 'producto', // singleSelect → mes a mes / 12 meses / ...
  fechaInicio: 'fecha inicio', // date
  fechaFin: 'fecha fin', // formula → ISO o #ERROR
  alquiler: 'alquiler mensual', // currency → número (renta mensual)
  agencia: 'nombre agencia', // lookup → nombre de la agencia
};
export const DEAL_FIELDS = Object.values(F);

// "Deal activo" = vigente hoy o entrando (decisión de producto).
export const ACTIVE_STATUSES = new Set(['ABIERTO', 'EN TRAMITE']);

// Texto renderizado de una celda. getCellValueAsString es robusto para lookups/selects/formulas:
// devuelve lo que se ve en la celda, sin el envoltorio {value} interno del SDK.
export function cellStr(record, name) {
  try {
    const s = record.getCellValueAsString(name);
    return s == null || s === '' ? null : s;
  } catch {
    return null;
  }
}

// Primer valor de un lookup multi-valor (getCellValueAsString une varios con ", ").
export function firstStr(record, name) {
  const s = cellStr(record, name);
  return s == null ? null : s.split(',')[0].trim();
}

// Fecha en ISO 'YYYY-MM-DD' vía getCellValue (no AsString, que daría formato local).
export function dateISO(record, name) {
  try {
    const v = record.getCellValue(name);
    if (typeof v === 'string') return v;
    if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
    return null;
  } catch {
    return null;
  }
}

// Número (currency, number) vía getCellValue.
export function cellNum(record, name) {
  try {
    const v = record.getCellValue(name);
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

// Formatea importe en euros (sin decimales si es entero grande).
export function euro(n) {
  if (n == null || !Number.isFinite(n)) return '—';
  return `${Math.round(n).toLocaleString('es-ES')} €`;
}

// Fecha ISO 'YYYY-MM-DD' → 'DD/MM/YY' (corto, para tarjetas).
export function fmtDate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return '—';
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(2, 4)}`;
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
  const fc = dateISO(record, F.fechaCierre);
  if (fc && /^\d{4}-\d{2}-\d{2}/.test(fc)) {
    const year = +fc.slice(0, 4);
    const month = +fc.slice(5, 7);
    if (month >= 1 && month <= 12) return {year, month, idx: ymIndex(year, month)};
  }
  const mc = firstStr(record, F.mesCierre);
  if (mc) {
    const m = mc.match(/^([a-záéíóú]+)\s+(\d{2,4})$/i);
    if (m) {
      const month = MESES_ES[m[1].toLowerCase()];
      let year = +m[2];
      if (year < 100) year += 2000;
      if (month) return {year, month, idx: ymIndex(year, month)};
    }
  }
  return null;
}
