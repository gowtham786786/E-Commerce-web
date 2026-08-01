/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5C6B4A', // Olive/sage green
          light: '#72825F',
          dark: '#48543A',
        },
        accent: {
          DEFAULT: '#F5F1E8', // Cream background
          light: '#FBF9F6',
          dark: '#E6E0D4',
        },
        neutral: {
          dark: '#1A1A1A',
          DEFAULT: '#4A4A4A',
          light: '#F3F4F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
