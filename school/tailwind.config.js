/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gitb-green': '#3d7a4a',
        'gitb-green-light': '#4d9a5a',
        'gitb-green-dark': '#2d5a3a',
        'gitb-orange': '#ff9d00',
        'gitb-orange-light': '#ffb333',
        'gitb-text': '#1a1a2e',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
