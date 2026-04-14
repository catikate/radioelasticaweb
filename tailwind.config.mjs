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
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      height: {
        nav:    '64px',
        player: '72px',
      },
    },
  },
  plugins: [],
}
