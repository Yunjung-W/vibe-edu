/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hyundai-blue': '#002C5F',
        'hyundai-dark': '#000000',
        'hyundai-gray-dark': '#60605B',
        'hyundai-gray-mid': '#999999',
        'hyundai-gray-light': '#F4F4F4',
        'hyundai-sand': '#BFBAAF',
        'hyundai-white': '#FFFFFF',
        'hyundai-active-blue': '#0073E6',
        'hyundai-positive': '#00825A',
        'hyundai-negative': '#D32F2F',
      },
      fontFamily: {
        outfit: ['Outfit', 'Pretendard Variable', 'Pretendard', 'sans-serif'],
        pretendard: ['Pretendard Variable', 'Pretendard', 'Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
