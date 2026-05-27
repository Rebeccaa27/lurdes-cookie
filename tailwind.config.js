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
        // ── Paleta Cappuccino & Chocolate ──
        // Fundo principal — branco creme texturizado
        cream: {
          DEFAULT: '#FDFBF7',
          50:  '#FFFFFF',
          100: '#FDFBF7',
          200: '#F5F0E8',
          300: '#EAE2D6',
          400: '#D8CEBC',
          500: '#C4B89E',
        },
        // Sidebar / textos — marrom café profundo
        choco: {
          DEFAULT: '#2B1B17',
          900: '#1A0F0C',
          800: '#2B1B17',
          700: '#3D2520',
          600: '#5C3828',
          500: '#7A4F38',
          400: '#A0714F',
          300: '#C49A7A',
          200: '#E2C9B0',
          100: '#F5EDE3',
          50:  '#FDF8F4',
        },
        // Destaque — laranja caramelo
        caramel: {
          DEFAULT: '#D97706',
          600: '#B45309',
          500: '#D97706',
          400: '#F59E0B',
          300: '#FCD34D',
          200: '#FDE68A',
          100: '#FEF3C7',
          50:  '#FFFBEB',
        },
        // Neutros de suporte
        ink: {
          DEFAULT: '#2B1B17',
          700: '#3D2520',
          600: '#5C3828',
          400: '#A0714F',
          300: '#C49A7A',
          200: '#E2C9B0',
          100: '#F5EDE3',
        },
      },
      boxShadow: {
        'card':    '0 1px 6px rgba(43,27,23,0.07), 0 0 0 1px rgba(43,27,23,0.04)',
        'card-lg': '0 8px 28px rgba(43,27,23,0.10), 0 1px 4px rgba(43,27,23,0.05)',
        'modal':   '0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.07)',
        'inset':   'inset 0 1px 3px rgba(43,27,23,0.08)',
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
