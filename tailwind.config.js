/** @type {import('tailwindcss').Config} */
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