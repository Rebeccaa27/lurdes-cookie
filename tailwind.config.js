/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        // Fundo principal — creme artesanal
        cream: {
          DEFAULT: '#F9F6F0',
          50: '#FEFCFA',
          100: '#FAF8F3',
          200: '#F3EDE3',
          300: '#E8DDD0',
          400: '#D5C8B8',
        },
        // Sidebar — azul marinho profundo
        navy: {
          DEFAULT: '#0B192C',
          600: '#132239',
          500: '#1A2F4A',
          400: '#243D5E',
          300: '#2E4E78',
          200: '#4A6E9A',
          100: '#C8D8EC',
        },
        // Destaque — terracota
        terra: {
          DEFAULT: '#BC544B',
          600: '#A84840',
          500: '#BC544B',
          400: '#C9635B',
          300: '#D4837C',
          200: '#E5B0AB',
          100: '#F7EDEC',
          50:  '#FDF4F3',
        },
        // Tons quentes
        warm: {
          900: '#3D2B1A',
          700: '#6B4226',
          500: '#A0622E',
          300: '#C89060',
          100: '#F5E8D8',
          50:  '#FAF3EB',
        },
        // Neutros
        ink: {
          DEFAULT: '#1C1917',
          700: '#292524',
          600: '#44403C',
          400: '#78716C',
          300: '#A8A29E',
          200: '#D6D3D1',
          100: '#F5F5F4',
        },
      },
      boxShadow: {
        'card':    '0 1px 6px rgba(60,40,20,0.06), 0 0 0 1px rgba(60,40,20,0.04)',
        'card-lg': '0 8px 28px rgba(60,40,20,0.09), 0 1px 4px rgba(60,40,20,0.05)',
        'modal':   '0 24px 64px rgba(0,0,0,0.20), 0 4px 16px rgba(0,0,0,0.08)',
        'inset':   'inset 0 1px 3px rgba(60,40,20,0.08)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
}