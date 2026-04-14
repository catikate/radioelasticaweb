/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        re: {
          blue:    '#3B6FFF',   // azul eléctrico — color principal
          ink:     '#1B3FAB',   // azul tinta — anotaciones manuscritas
          player:  '#1a1a2e',   // fondo del reproductor fijo
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
      height: {
        nav:    '48px',
        player: '72px',
      },
    },
  },
  plugins: [],
}
