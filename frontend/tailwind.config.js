/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--color-primary)',
          'primary-hover': 'var(--color-primary-hover)',
          accent: 'var(--color-accent)',
          bg: 'var(--color-bg)',
          surface: 'var(--color-surface)',
          text: 'var(--color-text)',
          muted: 'var(--color-muted)',
          border: 'var(--color-border)',
          sidebar: 'var(--sidebar-bg)',
          'sidebar-border': 'var(--sidebar-border)',
          'sidebar-active': 'var(--sidebar-active-bg)',
          'sidebar-text': 'var(--sidebar-text)',
        },
        whatsapp: {
          light: '#25D366',
          teal: 'var(--color-primary)',
          dark: 'var(--color-primary-hover)',
          chatbg: '#ECE5DD',
          bubble: '#DCF8C6',
          blue: '#34B7F1'
        }
      },
      fontFamily: {
        sans: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'brand': 'var(--radius)',
      },
      boxShadow: {
        'brand': 'var(--shadow-custom)',
      }
    },
  },
  plugins: [],
}
