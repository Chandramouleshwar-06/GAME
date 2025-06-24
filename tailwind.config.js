/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Cinzel"', '"Playfair Display"', 'serif'],
        fantasy: ['"Uncial Antiqua"', '"Cinzel"', 'serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      colors: {
        fantasy: {
          primary: '#8B5A3C',
          secondary: '#D4AF37',
          accent: '#FF6B35',
          dark: '#2C1810',
          light: '#F5E6D3',
          magic: '#9D4EDD',
          fire: '#FF4500',
          ice: '#87CEEB',
          earth: '#8B4513',
          shadow: '#483D8B',
        },
        mystical: {
          purple: '#6A0DAD',
          gold: '#FFD700',
          silver: '#C0C0C0',
          emerald: '#50C878',
          ruby: '#E0115F',
          sapphire: '#0F52BA',
        }
      },
      backgroundImage: {
        'fantasy-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #7209b7 100%)',
        'magic-gradient': 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
        'fire-gradient': 'linear-gradient(45deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
        'combat-gradient': 'linear-gradient(135deg, #2d1b69 0%, #11998e 100%)',
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
        },
        'magical-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'sparkle': {
          '0%, 100%': { opacity: '0', transform: 'scale(0)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(157, 78, 221, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(157, 78, 221, 0.8), 0 0 30px rgba(157, 78, 221, 0.6)' },
        }
      },
      animation: {
        'pulse-light': 'pulse-light 2s infinite ease-in-out',
        'pop-in': 'pop-in 0.3s ease-out forwards',
        'magical-float': 'magical-float 3s ease-in-out infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}