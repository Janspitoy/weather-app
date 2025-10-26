/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Говорим Tailwind следить за всеми файлами в src
  ],
  darkMode: 'class', // Включаем 'dark' режим на основе класса
  theme: {
    extend: {},
  },
  plugins: [],
}