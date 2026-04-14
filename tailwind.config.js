/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}", // Adjust path if necessary
      "./node_modules/@mui/**/*.{js,ts,jsx,tsx}", // Include MUI components
      "./node_modules/react-tailwindcss-datepicker/dist/index.esm.{js,ts}"
    ],
    // darkMode: ['class'],
    theme: {
      extend: {},
    },
    plugins: [],
  }
  
  