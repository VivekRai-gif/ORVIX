/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orvix: {
          bg: '#0B0F19',
          surface: '#111827',
          card: '#171E2E',
          cardHover: '#1E293B',
          input: '#0F172A',
          border: '#1E293B',
          borderHover: '#334155',
          primary: '#2563EB',
          primaryHover: '#3B82F6',
          accentBlue: '#60A5FA',
          text: '#F8FAFC',
          textSecondary: '#94A3B8',
          textMuted: '#64748B',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
        }
      }
    },
  },
  plugins: [],
}

