/** @type {import('tailwindcss').Config} */
<<<<<<< HEAD
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Set Inter as default sans-serif font
        serif: ['"Playfair Display"', 'serif'], // Example serif font
        mono: ['"Space Mono"', 'monospace'], // Example mono font
      },
      keyframes: {
        'pulse-light': {
          '0%, 100%': { opacity: '1', textShadow: '0 0 5px rgba(255,215,0,0.5)' },
          '50%': { opacity: '0.8', textShadow: '0 0 15px rgba(255,215,0,1)' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '70%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        }
      },
      animation: {
        'pulse-light': 'pulse-light 2s infinite ease-in-out',
        'pop-in': 'pop-in 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
}
=======
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scan all JS/JSX/TS/TSX files in src
    "./public/index.html",         // And your main HTML file
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
>>>>>>> 427e00c43f05f175a55dde03cd6b245728f60d31
