/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'creme': '#FFF7ED',
        'terracota': { '500': '#E15A31', '600': '#C94F2A' },
        'verde-floresta': '#2F4F4F',
        'cinza-ardosia': '#6c757d',
      },
    },
  },
  plugins: [],
}