/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'primary-green': '#2D5A2D',
        'primary-green-dark': '#1E3D1E',
        'primary-green-light': '#3D7A3D',
        'accent-green': '#34A853',
        'text-dark': '#1a1a1a',
        'text-light': '#666666',
        'bg-light': '#f8f9fa',
      },
      fontFamily: {
        'display': ['Playfair Display', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
