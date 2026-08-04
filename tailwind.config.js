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
    // The theme REPLACES Tailwind's palette, so only what is listed here
    // exists. Same tokens as the admin panel — the till, the back office and
    // the site are one product.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#232229',
      gray: {
        // Warm, to agree with `body`. Was #ebebeb, a cool grey that fought it.
        light: '#f3f2ee',
        dark: '#b3b6bb',
      },
      // The field behind the cards. Was #fefefe, which made every white
      // surface disappear into the page.
      body: '#e9e8e4',
      yellow: '#ffcf55',
      green: '#4d966d',
      main: '#f15d36',
      'main-hover': '#d94f2c',
      second: '#4d966d',
      third: '#ffcf55',
      // Destructive and errors. Replaces pure #ff0000 — same chroma as `main`.
      danger: '#c9382b',
      red: '#c9382b',
      border: '#ddd',
      notif: '#FFFBEB',
    },
    extend: {
      boxShadow: {
        // Three elevation levels, no more: page → card → overlay.
        sm: '0 1px 2px rgba(35,34,41,.05)',
        lg: '0 12px 40px rgba(35,34,41,.12)',
        '3xl': '0px 22px 58px 1px rgba(0,0,0,0.3)',
      },
      borderRadius: {
        lg: '8px',
        xl: '12px',
      },
      spacing: {
        // The till is touched, not clicked: this is the smallest target used.
        touch: '52px',
      },
    }
  },
  plugins: [],
}
