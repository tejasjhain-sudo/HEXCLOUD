/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#030712',
        cardBg: 'rgba(15, 23, 42, 0.45)',
        borderBg: 'rgba(255, 255, 255, 0.08)',
        neonCyan: '#00f2fe',
        neonPurple: '#4facfe',
        cyberPurple: '#a855f7',
        cyberPink: '#ec4899',
        darkGray: '#1f2937',
        mediumGray: '#9ca3af',
        lightGray: '#f3f4f6',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
        'purple-gradient': 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 242, 254, 0.25)',
        'neon-purple': '0 0 15px rgba(168, 85, 247, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        'glass': '12px',
      }
    },
  },
  plugins: [],
}
