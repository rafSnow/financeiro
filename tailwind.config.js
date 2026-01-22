/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode
        background: '#FFFFFF',
        surface: '#F9FAFB',
        text: {
          primary: '#111827',
          secondary: '#6B7280',
        },

        // Dark mode (automático com 'dark:')
        dark: {
          background: '#1F2937',
          surface: '#374151',
          surfaceHover: '#4B5563',
          text: {
            primary: '#F9FAFB',
            secondary: '#D1D5DB',
            tertiary: '#9CA3AF',
          },
          border: '#4B5563',
        },
      },
    },
  },
  plugins: [],
};
