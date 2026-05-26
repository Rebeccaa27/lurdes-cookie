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
        cream:  { DEFAULT:'#F9F6F0', 50:'#FDFCF9', 100:'#FAF8F3', 200:'#F3EDE3', 300:'#E8DDD0', 400:'#D5C8B8' },
        navy:   { DEFAULT:'#0B192C', 700:'#132239', 600:'#1A2F4A', 500:'#243D5E', 400:'#2E4E78' },
        terra:  { DEFAULT:'#BC544B', 400:'#C9635B', 300:'#D4837C', 200:'#E5B0AB', 100:'#F7EDEC' },
        warm:   { 900:'#3D2B1A', 700:'#6B4226', 500:'#A0622E', 300:'#C89060', 100:'#F5E8D8' },
        sage:   { DEFAULT:'#7A8C6E', 100:'#EBF0E8' },
        ink:    { DEFAULT:'#1C1917', 600:'#44403C', 400:'#78716C', 200:'#C4B9B0', 100:'#EDE9E5' },
      },
      boxShadow: {
        'card':    '0 1px 8px rgba(60,40,20,0.07), 0 0 0 1px rgba(60,40,20,0.04)',
        'card-lg': '0 8px 32px rgba(60,40,20,0.10), 0 1px 4px rgba(60,40,20,0.06)',
        'modal':   '0 24px 64px rgba(0,0,0,0.18)',
        'inner':   'inset 0 1px 3px rgba(60,40,20,0.08)',
      },
      borderRadius: { '2xl':'16px', '3xl':'24px', '4xl':'32px' },
    },
  },
  plugins: [],
}