/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: '#0fbd83',
        'background-dark': '#09090b',
        'card-dark': '#18181b',
        'card-border': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      width: {
        '400px': '400px',
      },
      height: {
        '600px': '600px',
      }
    },
  },
  plugins: [],
}
