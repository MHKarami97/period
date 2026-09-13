/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        vazir: ["Vazirmatn", "system-ui", "sans-serif"],
      },
      colors: {
        phase: {
          menstrual: "#e7828c",
          follicular: "#7fb3a3",
          ovulation: "#c9a6e0",
          luteal: "#8b9dc3",
        },
      },
    },
  },
  plugins: [],
};
