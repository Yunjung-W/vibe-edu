/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        hyundai: {
          blue: '#002C5F',
          dark: '#000000',
          'gray-dark': '#60605B',
          'gray-mid': '#999999',
          'gray-light': '#F4F4F4',
          sand: '#BFBAAF',
          white: '#FFFFFF',
          'active-blue': '#0073E6',
          positive: '#00825A',
          negative: '#D32F2F',
        },
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        pretendard: ['Pretendard', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
