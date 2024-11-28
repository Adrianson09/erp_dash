/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Extensiones del tema
    },
  },
  variants: {
    extend: {
      display: ["print"],
      visibility: ["print"],
      border: ["print"],
      textColor: ["print"],
      backgroundColor: ["print"],
    },
  },
  plugins: [],
};
