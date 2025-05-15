/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e6f1fe",
          100: "#cce3fd",
          200: "#99c7fb",
          300: "#66abf9",
          400: "#338ff7",
          500: "#0073f5",
          600: "#005cc4",
          700: "#004593",
          800: "#002e62",
          900: "#001731",
        },
      },
    },
  },
  plugins: [],
};
