/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2563EB",   // Blue
          light: "#3B82F6",
          dark: "#1E40AF"
        },
        accent: {
          DEFAULT: "#F97316",   // Orange CTA
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        heading: ["Poppins", "ui-sans-serif"],
      }
    },
  },
  plugins: [],
}
