import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        panel: '#0f1419',
        surface: '#1a2332',
        accent: '#3b82f6',
      },
    },
  },
  plugins: [],
};
export default config;
