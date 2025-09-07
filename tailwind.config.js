/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(210, 86%, 40%)',
        accent: 'hsl(160, 80%, 35%)',
        bg: 'hsl(210, 36%, 96%)',
        surface: 'hsl(0, 0%, 100%)',
        text: 'hsl(210, 15%, 12%)',
        muted: 'hsl(210, 15%, 40%)',
        // Dark theme colors
        dark: {
          bg: 'hsl(220, 20%, 8%)',
          surface: 'hsl(220, 20%, 12%)',
          border: 'hsl(220, 15%, 20%)',
          text: 'hsl(0, 0%, 95%)',
          muted: 'hsl(220, 10%, 60%)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 hsla(0,0%,0%,0.05)',
        'md': '0 4px 6px -1px hsla(0,0%,0%,0.1), 0 2px 4px -2px hsla(0,0%,0%,0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}