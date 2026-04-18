/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        re: {
          blue:    '#3878F5',   // azul eléctrico — color principal (igual al fondo del video del logo)
          ink:     '#1B3FAB',   // azul tinta — anotaciones manuscritas
          player:  '#1a1a2e',   // fondo del reproductor fijo
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      height: {
        nav:    '96px',
        player: '72px',
      },
    },
  },
  plugins: [],
}
