/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        greenPrimary: '#1d7948',
        yellowPrimary: '#ddea90',
      },
      fontFamily: {
        heading: 'Righteous, cursive',
        body: 'Inter, sans-serif',
      },
    },
  },
  plugins: [],
};
