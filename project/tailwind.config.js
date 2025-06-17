/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        jungle: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        earth: {
          50: '#fefdf8',
          100: '#fdfdeb',
          200: '#faf8d4',
          300: '#f4f0b3',
          400: '#ebe388',
          500: '#ddd060',
          600: '#c2b547',
          700: '#a0923a',
          800: '#847532',
          900: '#70612d',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        }
      },
      backgroundImage: {
        'jungle-gradient': 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
        'earth-gradient': 'linear-gradient(135deg, #a0923a 0%, #70612d 100%)',
        'natural-wood': 'url("https://images.pexels.com/photos/129731/pexels-photo-129731.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")',
        'jungle-leaves': 'url("https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")',
      }
    },
  },
  plugins: [],
};