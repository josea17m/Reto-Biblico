/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        noche: {
          900: "#050b23",
          800: "#0a1440",
          700: "#122060",
          600: "#1b2f86",
        },
        oro: {
          400: "#f7d774",
          500: "#e9b949",
          600: "#c9922a",
        },
        acierto: "#16a34a",
        fallo: "#dc2626",
      },
      fontFamily: {
        titulo: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      keyframes: {
        aparecer: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        latido: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
      },
      animation: {
        aparecer: "aparecer 0.35s ease-out both",
        latido: "latido 0.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
