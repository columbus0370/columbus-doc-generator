/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0d1530',
          800: '#111d3c',
          700: '#162248',
          600: '#1e2f5e',
        },
        accent: {
          DEFAULT: '#4a9eff',
          hover: '#2d85f0',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
