/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tesla-inspired color palette
        primary: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        accent: {
          red: '#E82127',
          blue: '#3457DC',
        },
        gray: {
          100: '#F8F9FA',
          200: '#E9ECEF',
          300: '#DEE2E6',
          600: '#6C757D',
          800: '#343A40',
          900: '#212529',
        },
        status: {
          success: '#28A745',
          warning: '#FFC107',
          danger: '#DC3545',
          info: '#17A2B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'base': '16px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '250ms',
        'slow': '350ms',
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
