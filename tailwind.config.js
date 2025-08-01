/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'theme': {
        50: '#f0fdfa',
        100: '#e0fcf4',
        200: '#c5f9e8',
        300: '#a3f3db',
        400: '#7beada',
        500: '#41dbc6',
        600: '#23bba1',
        700: '#1c9d87',
        800: '#17816e',
        900: '#116a5b',
        }, // ✅ Don't forget this comma if you add more config items
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
