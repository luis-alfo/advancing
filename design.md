# Design System — Advancing

Sistema de diseño extraído de [advancing.es](https://advancing.es/) (CSS de producción: Tailwind compilado + Swiper + Font Awesome 6.1.1).

---

## 1. Marca

- **Nombre**: Advancing
- **Claim principal**: «Garantiza y cobra el alquiler como tú elijas»
- **Claim alternativo**: «Propietario, adelanta tus rentas y alquila con tranquilidad»
- **Propuesta de valor**: adelanto de rentas (2–12 meses), garantía de cobro con 0% riesgo de impago, gestión de cobro y reclamación, contratación online simplificada. Posicionado como superior a un seguro de impago tradicional.
- **Público objetivo**: propietarios particulares, agencias inmobiliarias, propietarios con varios inmuebles.
- **Tono de voz**: profesional pero cercano. Ejes: seguridad, simplicidad, tranquilidad, rapidez.

---

## 2. Paleta de color

Tailwind con escalas custom. La marca combina un **azul marino/royal** (confianza, institucional) con un **verde menta brillante** (acento, CTA, éxito).

### Azul (primario — marca)

| Token | Hex | RGB | Uso |
|---|---|---|---|
| blue-900 | `#02005c` | 2 0 92 | Fondos oscuros, footer |
| blue-800 / 700 | `#050f8d` | 5 15 141 | **Color de marca**, botones, headings, focus ring |
| blue-600 | `#0713a0` | 7 19 160 | Hover, énfasis |
| blue-500 | `#0916ae` | 9 22 174 | Variante |
| blue-300 | `#d3ddff` | 211 221 255 | Fondos claros, bordes suaves |

### Verde menta (acento / éxito / CTA)

| Token | Hex | RGB | Uso |
|---|---|---|---|
| green-200 | `#43feae` | 67 254 173 | Acento principal, highlights |
| — | `#2dfd9d` | 45 253 157 | Variante |
| — | `#28f393` | 40 243 147 | Variante |
| — | `#24df86` | 36 223 134 | Variante |
| — | `#a3ffd9` | 163 255 217 | Fondo menta claro |
| — | `#e4fcf2` | 228 252 242 | Fondo menta muy claro (secciones) |

### Neutros

| Token | Hex | RGB | Uso |
|---|---|---|---|
| white | `#ffffff` | 255 255 255 | Fondo base |
| off-white | `#fdfcff` · `#f9f9f9` · `#f5f5fe` · `#f0f0f0` | — | Fondos de sección alternos |
| gray-400 | `#9ca3af` | 156 163 175 | Texto secundario / placeholder |
| gray-500 | `#6b7280` | 107 114 128 | Texto de apoyo |
| dark-navy | `#162040` | 22 32 64 | Texto sobre claro |
| black-900 | `#181d26` | 24 29 38 | Texto principal |

### Sombras / overlays

`rgba(0,0,0,.05)` · `.10` · `.15` · `.25` — elevación progresiva de tarjetas y modales.
Focus ring: `rgba(7,19,160,.5)`.

---

## 3. Tipografía

- **Familia**: `Mulish, sans-serif` (Google Fonts).
- **Pesos**: 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold).

### Escala (custom Tailwind, `font-size / line-height`)

| Clase | Tamaño | Interlineado | Uso |
|---|---|---|---|
| `text-h1` | 42px | 48px | Título hero |
| `text-h2` | 34px | 42px | Títulos de sección |
| `text-h3` | 26px | 32px | Subtítulos |
| `text-h4` | 20px | 30px | Títulos de tarjeta |
| `text-p2` | 28px | 36px | Destacados grandes (cifras) |
| `text-p3` | 22px | 32px | Párrafo destacado |
| `text-p1` | 20px | 28px | Párrafo intro |
| `text-md` | 18px | 28px | Cuerpo grande |
| `text-base` | 16px | — | Cuerpo |
| `text-sm` | 15px | — | Apoyo |
| `text-xs` | 12px | — | Notas legales |

*(Existe también un display de 62px para cifras hero puntuales.)*

---

## 4. Geometría y elevación

- **Border radius**: `0.25rem` · `0.375rem` · `0.5rem` · `0.75rem` (tarjetas) · `1rem` · `9999px` (píldoras/botones) · `100%` (avatares/iconos circulares).
- **Botones**: redondeados (píldora), fondo azul de marca `#050f8d` o verde menta para acción positiva; texto blanco.
- **Tarjetas**: radio `0.75rem`, fondo blanco, sombra suave `rgba(0,0,0,.1)`.

---

## 5. Estructura de página (orden real)

1. **Header / Nav** — logo + enlaces (Propietario · Agencia · Nosotros · Contacto) + CTA.
2. **Hero** — claim + selector interactivo de meses de renta a adelantar.
3. **Estadísticas** — +800 propietarios · +2M€ adelantados · +1000 agencias · 0% riesgo de impago.
4. **Diferenciación** — 4 tarjetas (adelanto, garantía, gestión de cobro, solicitud simple).
5. **Soluciones** — 2 tarjetas de producto: **Mes a Mes** (cobro puntual día 10) y **12 Meses** (un año por adelantado).
6. **Proceso en 3 pasos** — Solicitud → Validación → Desembolso (24h o mensual).
7. **Tabla comparativa** — «Mucho más que un seguro»: seguro tradicional vs. Advancing.
8. **Agencias** — CTA dirigido a inmobiliarias.
9. **Testimonios** — 4 reseñas de propietarios (carrusel Swiper).
10. **Prensa** — La Vanguardia · El País · CincoDías · Ara.
11. **CTA final** — «Garantiza tu alquiler».
12. **Footer** — logo, descripción, navegación, redes (Facebook · LinkedIn · Instagram), legales.

---

## 6. Componentes clave

- **Selector de meses** — control interactivo en el hero para elegir 2–12 meses de adelanto.
- **Tarjetas de producto** — Mes a Mes / 12 Meses, con icono, título `text-h4`, descripción y CTA.
- **Tabla comparativa** — dos columnas con checks (verde menta) vs. cruces.
- **Carrusel de testimonios** — Swiper 8.
- **Iconografía** — Font Awesome 6.1.1 + iconos geométricos de marca.
- **CTAs** — «Hablar con un asesor», «Contratar», «Garantiza tu alquiler», «Quiero saber más».

---

## 7. Stack front-end

- **Tailwind CSS** (config custom: escalas `blue`, `green`, `black`, `indigo`).
- **Swiper 8** — carruseles.
- **Font Awesome 6.1.1** — iconos.
- **Mulish** — tipografía vía Google Fonts.

---

## 8. Principios de estilo

- Estética **moderna, limpia y minimalista**; mucho blanco y aire.
- Contraste **azul marino (confianza institucional) + verde menta (acción/positividad)**.
- Jerarquía tipográfica clara con Mulish en varios pesos.
- Componentes redondeados, sombras suaves, foco en legibilidad y conversión.
