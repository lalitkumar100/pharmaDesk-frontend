/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'aqua-blue': {
   50: '#f3fdf4',
          100: '#e0f8e2',
          200: '#baf0c2',
          300: '#8be49e',
          400: '#5ed87d',
          500: '#34cc5f',
          600: '#2bb850',
          700: '#229e44',
          800: '#1a8438',
          900: '#0e5c25',
        }, // ✅ Don't forget this comma if you add more config items
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
