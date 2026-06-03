// Design system de Advancing (ver design.md): azul marino #050f8d + verde menta #43feae, Mulish.
module.exports = {
  content: ['./frontend/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Mulish', 'ui-sans-serif', 'system-ui', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji'],
        display: ['Mulish', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Azul de marca (confianza / institucional / interactivo)
        brand: {
          50: '#f2f4ff',
          100: '#e6ebff',
          200: '#c7d3ff',
          300: '#d3ddff',
          400: '#6f80e8',
          500: '#0916ae',
          600: '#0713a0',
          700: '#050f8d',
          900: '#02005c',
          DEFAULT: '#050f8d',
        },
        // Verde menta (acento / éxito / CTA positivo)
        mint: {
          100: '#e4fcf2',
          200: '#a3ffd9',
          400: '#43feae',
          500: '#24df86',
          700: '#0f8a4f',
          DEFAULT: '#43feae',
        },
        // Ámbar — semántico para "faltan datos" (no es de marca, pero necesario para estado)
        amber: {
          100: '#fdf3d7',
          500: '#d99a14',
          700: '#8a5a00',
        },
        // Neutros
        ink: '#181d26', // texto principal
        navy: '#162040', // texto sobre claro / headings alt
        slate: {
          200: '#e5e7eb',
          300: '#cbd0d8',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
        },
        line: '#e8e9ee', // hairline de bordes
        canvas: '#f7f8fc', // fondo de la app (off-white)
        paper: '#ffffff',
      },
      borderRadius: {
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem', // tarjetas de marca
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,.04), 0 2px 8px rgba(0,0,0,.06)',
        // Más suave y "flotante" — cajas menos sólidas.
        soft: '0 1px 2px rgba(2,0,92,.03), 0 12px 32px -14px rgba(2,0,92,.16)',
      },
    },
  },
  plugins: [],
};
