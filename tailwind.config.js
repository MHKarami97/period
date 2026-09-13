/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
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
