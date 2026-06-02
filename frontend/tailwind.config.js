/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        // Transport dark theme
        surface: {
          900: '#0a0f1a',
          800: '#0f1728',
          700: '#162035',
          600: '#1e2d47',
        },
        accent: {
          blue: '#3b82f6',
          cyan: '#06b6d4',
          green: '#22c55e',
          red: '#ef4444',
          amber: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
};
