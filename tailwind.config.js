/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2563EB",   // SmartFlowAI blue
          dark: "#1E3A8A",     // Navy
          light: "#60A5FA",    // Sky
        },
        accent: {
          DEFAULT: "#F97316",  // Orange CTA
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
