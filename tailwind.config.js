/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./src/**/*.{html,js}",
  ],
  theme: {
    colors: {
      ...colors
    },
    listStyleType: {
      none: 'none',
      disc: 'disc',
      decimal: 'decimal',
    },
    extend: {
      borderRadius: {
        'custom': '15px 50px 30px',
      },
    },
  },
  plugins: [],
}

