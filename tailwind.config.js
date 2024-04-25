/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        default: "1rem",
        sm: "2rem",
        lg: "3rem",
        xl: "4rem",
      }
    },
    fontFamily: {
      'roboto': ['Roboto', 'sans-serif'],
      'bree-serif': ['Bree Serif', 'serif'],
    },
    colors: {
      transparent: 'transparent',
      white: '#ffffff',
      black: '#232229',
      gray: '#ebebeb',
      main: '#f15d36',
      second: '#4d966d',
      third: '#ffcf55',
      body: '#fefefe',
      border: '#ddd',
      notif: '#FFFBEB',
      red: '#ff0000',
    },
    extend: {
      boxShadow: {
        '3xl': '0px 22px 58px 1px rgba(0,0,0,0.3)',
      }
    }
  },
  plugins: [],
}

