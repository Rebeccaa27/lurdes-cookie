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
        // ── Paleta Terracota Confeitaria ──
        // Fundo principal — bege areia suave
        cream: {
          DEFAULT: '#F3EFE9',
          50:  '#FFFFFF',
          100: '#FAF8F5',
          200: '#F3EFE9',
          300: '#E8E0D5',
          400: '#D5C9BA',
          500: '#B8A99A',
        },
        // Sidebar / textos — azul noturno
        navy: {
          DEFAULT: '#0F2942',
          900: '#0A1E30',
          800: '#0F2942',
          700: '#163554',
          600: '#1E3A8A',
          500: '#2563EB',
          400: '#60A5FA',
          300: '#93C5FD',
          200: '#BFDBFE',
          100: '#DBEAFE',
          50:  '#EFF6FF',
        },
        // Destaque — terracota/tijolo vibrante
        cherry: {
          DEFAULT: '#C2410C',
          700: '#9A3412',
          600: '#C2410C',
          500: '#EA580C',
          400: '#FB923C',
          300: '#FDBA74',
          200: '#FED7AA',
          100: '#FFEDD5',
          50:  '#FFF7ED',
        },
        // Terra — alias principal
        terra: {
          DEFAULT: '#C2410C',
          600: '#9A3412',
          500: '#C2410C',
          400: '#EA580C',
          200: '#78350F',
          100: '#FFEDD5',
          50:  '#FFF7ED',
        },
        caramel: {
          DEFAULT: '#C2410C',
          600: '#9A3412',
          500: '#C2410C',
          400: '#EA580C',
          100: '#FFEDD5',
        },
        ink: {
          DEFAULT: '#2A1B14',
          700: '#2A1B14',
          600: '#3D2B1F',
          400: '#78350F',
          300: '#92400E',
          200: '#B45309',
          100: '#FEF3C7',
        },
        choco: {
          DEFAULT: '#0F2942',
          900: '#0A1E30',
          800: '#0F2942',
          700: '#163554',
          600: '#1E3A8A',
          500: '#2563EB',
          400: '#60A5FA',
          300: '#93C5FD',
          200: '#BFDBFE',
          100: '#DBEAFE',
          50:  '#EFF6FF',
        },
      },
      boxShadow: {
        'card':    '0 1px 6px rgba(42,27,20,0.07), 0 0 0 1px rgba(42,27,20,0.05)',
        'card-lg': '0 8px 28px rgba(42,27,20,0.10), 0 1px 4px rgba(42,27,20,0.06)',
        'modal':   '0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.07)',
        'inset':   'inset 0 1px 3px rgba(42,27,20,0.08)',
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
