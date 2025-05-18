/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          'dm-sans': ['var(--font-dm-sans)', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }