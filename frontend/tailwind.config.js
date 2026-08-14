/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Outfit"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        'creme': {
          DEFAULT: '#FFF7ED',
          50: '#FFFAF3',
          100: '#FFF7ED',
          200: '#FEEDDC',
          300: '#FDE0CA',
        },
        'terracota': {
          50: '#FEF3F0',
          100: '#FDE6E0',
          200: '#FBC8BC',
          300: '#F7A38F',
          400: '#F07559',
          500: '#E15A31',
          600: '#C94F2A',
          700: '#A83E20',
          800: '#8A341D',
          900: '#732F1D',
        },
        'verde-floresta': {
          DEFAULT: '#2F4F4F',
          50: '#F2F6F6',
          100: '#E1EBEB',
          200: '#C6D8D8',
          300: '#9EBEBE',
          400: '#6E9C9C',
          500: '#4F7C7C',
          600: '#3D6363',
          700: '#2F4F4F',
          800: '#2A4444',
          900: '#253B3B',
        },
        'cinza-ardosia': {
          DEFAULT: '#6c757d',
          50: '#F8F9FA',
          100: '#F1F3F5',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#CED4DA',
          500: '#ADB5BD',
          600: '#6C757D',
          700: '#495057',
          800: '#343A40',
          900: '#212529',
        },
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(47, 79, 79, 0.08)',
        'card': '0 10px 30px -4px rgba(47, 79, 79, 0.08), 0 4px 10px -2px rgba(47, 79, 79, 0.04)',
        'elevated': '0 20px 40px -8px rgba(47, 79, 79, 0.12), 0 8px 16px -4px rgba(47, 79, 79, 0.06)',
        'glow-terracota': '0 0 25px -4px rgba(225, 90, 49, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'pulse-subtle': 'pulseSubtle 2.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
        },
      },
    },
  },
  plugins: [],
}