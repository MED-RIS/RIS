/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./RisWorklist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        overlay: 'rgba(0, 0, 0, 0.8)',
        transparent: 'transparent',
        black: '#000',
        white: '#fff',
        initial: 'initial',
        inherit: 'inherit',
        primary: {
          light: '#a7f3d4', 
          main: '#066952', 
          dark: '#064e3e', 
          active: '#d1fae7', 
        },
        plom: {
          light: '#3e4744', 
          main: '#252928', 
          dark: '#181b1a', 
          active: '#5f6d68', 
        },
        inputfield: {
          main: '#296e2c', 
          disabled: '#5c9c5e', 
          focus: '#6cab6e', 
          placeholder: '#a3d1a5', 
        },
        secondary: {
          light: '#6de8bd', 
          main: '#03795d', 
          dark: '#066952', 
          active: '#d1fae7', 
        },
        common: {
          bright: '#c5fffa', 
          light: '#15ece2', 
          main: '#4afef0', 
          dark: '#0a5757', 
          active: '#8bfff5', 
        },
        customgreen: {
          100: '#66bb6a',
          200: '#43a047',
        },
        customblue: {
          10: '#d0f0e0',
          20: '#a7e9af',
          30: '#7fd98b',
          40: '#4caf50',
          50: '#388e3c',
          80: '#2e7d32',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#66bb6a',
          400: '#388e3c',
        },
      }
    },
  },
  plugins: [],
}
