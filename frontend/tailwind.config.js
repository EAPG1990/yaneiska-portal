/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3d000c",
        "primary-container": "#5d101d",
        secondary: "#775a19",
        "secondary-container": "#fed488",
        background: "#fcf9f3",
        surface: "#fcf9f3",
        "surface-container": "#f0eee8",
        "on-surface": "#1c1c18",
        "on-surface-variant": "#554243",
        gold: "#C5A059",
        burgundy: "#5D101D",
        cream: "#F9F6F0",
      },
      fontFamily: {
        serif: ["Noto Serif", "serif"],
        sans: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem",
      },
      boxShadow: {
        silk: "0 10px 30px -10px rgba(93, 16, 29, 0.08)",
      }
    },
  },
  plugins: [],
}
