/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", "[data-theme]"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Geist", "sans-serif"],
      },
      colors: {
        slate: {
          950: "#0a0a0f",
          900: "#111118",
          800: "#1a1a23",
          700: "#252530",
          600: "#333340",
          500: "#444455",
          100: "#f0f0f5",
        },
      },
    },
  },
  plugins: [],
}