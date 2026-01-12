/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta Club Regatas Bella Vista
        navy: {
          DEFAULT: '#1A237E', // Azul club
          light: '#283593', // Azul más claro (dark mode secondary)
        },
        gold: {
          DEFAULT: '#FFD600', // Amarillo dorado
        },
        background: {
          DEFAULT: '#FFFFFF', // Fondo principal light
          secondary: '#F5F7FA', // Fondo secundario light
          dark: '#1A237E', // Fondo principal dark
          darkSecondary: '#283593', // Fondo secundario dark
        },
        text: {
          primary: '#1A237E', // Texto principal light
          secondary: '#333333', // Texto secundario light
          dark: '#FFFFFF', // Texto principal dark
          darkSecondary: '#FFD600', // Texto secundario dark
        },
        accent: {
          DEFAULT: '#FFD600', // Acentos
          dark: '#FFFFFF', // Acentos en dark
        },
      },
    },
  },
  plugins: [],
};
