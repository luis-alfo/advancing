// Jerarquía territorial: código INE de provincia (2 díg del CP) → código INE de CCAA (es-atlas),
// y el nivel de agregación que toca según el zoom.

// provincia → CCAA (ids de es-atlas autonomous_regions).
export const PROV_TO_CCAA = {
  // Andalucía (01)
  '04': '01', '11': '01', '14': '01', '18': '01', '21': '01', '23': '01', '29': '01', '41': '01',
  // Aragón (02)
  '22': '02', '44': '02', '50': '02',
  // Asturias (03)
  '33': '03',
  // Illes Balears (04)
  '07': '04',
  // Canarias (05)
  '35': '05', '38': '05',
  // Cantabria (06)
  '39': '06',
  // Castilla y León (07)
  '05': '07', '09': '07', '24': '07', '34': '07', '37': '07', '40': '07', '42': '07', '47': '07', '49': '07',
  // Castilla-La Mancha (08)
  '02': '08', '13': '08', '16': '08', '19': '08', '45': '08',
  // Cataluña (09)
  '08': '09', '17': '09', '25': '09', '43': '09',
  // Comunitat Valenciana (10)
  '03': '10', '12': '10', '46': '10',
  // Extremadura (11)
  '06': '11', '10': '11',
  // Galicia (12)
  '15': '12', '27': '12', '32': '12', '36': '12',
  // Madrid (13)
  '28': '13',
  // Murcia (14)
  '30': '14',
  // Navarra (15)
  '31': '15',
  // País Vasco (16)
  '01': '16', '20': '16', '48': '16',
  // La Rioja (17)
  '26': '17',
  // Ceuta (18) / Melilla (19)
  '51': '18', '52': '19',
};

// Nivel de agregación según el factor de zoom (k). MAXK = 9.
export function levelForZoom(k) {
  if (k < 1.8) return 'ccaa';
  if (k < 3.6) return 'provincia';
  if (k < 6) return 'municipio';
  return 'cp';
}

export const LEVEL_LABEL = {
  ccaa: 'Comunidades',
  provincia: 'Provincias',
  municipio: 'Municipios',
  cp: 'Códigos postales',
};
