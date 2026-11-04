// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#c084fc",   // morado
        secondary: "#ff4ecd", // rosa
        dark: {
          900: "#0d0a1a",
          800: "#151028",
        }
      },
      fontFamily: {
        display: ["Cinzel", "serif"],
        body: ["Raleway", "sans-serif"],
      }
    },
  },
  plugins: [],
}