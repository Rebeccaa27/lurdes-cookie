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
        // ── Paleta Massa de Baunilha ──
        // Fundo principal — cinza azulado ultra claro
        cream: {
          DEFAULT: '#F8FAFC',
          50:  '#FFFFFF',
          100: '#F8FAFC',
          200: '#F1F5F9',
          300: '#E2E8F0',
          400: '#CBD5E1',
          500: '#94A3B8',
        },
        // Sidebar / textos — azul ardósia escuro
        navy: {
          DEFAULT: '#1E293B',
          900: '#0F172A',
          800: '#1E293B',
          700: '#273549',
          600: '#334155',
          500: '#475569',
          400: '#64748B',
          300: '#94A3B8',
          200: '#CBD5E1',
          100: '#E2E8F0',
          50:  '#F8FAFC',
        },
        // Destaque — vermelho cereja/geleia
        cherry: {
          DEFAULT: '#BE123C',
          700: '#9F1239',
          600: '#BE123C',
          500: '#E11D48',
          400: '#FB7185',
          300: '#FDA4AF',
          200: '#FECDD3',
          100: '#FFF1F2',
          50:  '#FFF5F6',
        },
        // Alias para compatibilidade
        terra:   { DEFAULT: '#BE123C', 600: '#9F1239', 500: '#BE123C', 400: '#E11D48', 100: '#FFF1F2', 50: '#FFF5F6' },
        caramel: { DEFAULT: '#BE123C', 600: '#9F1239', 500: '#BE123C', 400: '#E11D48', 100: '#FFF1F2' },
        ink: {
          DEFAULT: '#1E293B',
          700: '#273549',
          600: '#334155',
          400: '#64748B',
          300: '#94A3B8',
          200: '#CBD5E1',
          100: '#F1F5F9',
        },
        choco: {
          DEFAULT: '#1E293B',
          900: '#0F172A',
          800: '#1E293B',
          700: '#273549',
          600: '#334155',
          500: '#475569',
          400: '#64748B',
          300: '#94A3B8',
          200: '#CBD5E1',
          100: '#E2E8F0',
          50:  '#F8FAFC',
        },
      },
      boxShadow: {
        'card':    '0 1px 6px rgba(15,23,42,0.06), 0 0 0 1px rgba(15,23,42,0.04)',
        'card-lg': '0 8px 28px rgba(15,23,42,0.09), 0 1px 4px rgba(15,23,42,0.05)',
        'modal':   '0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.07)',
        'inset':   'inset 0 1px 3px rgba(15,23,42,0.08)',
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
