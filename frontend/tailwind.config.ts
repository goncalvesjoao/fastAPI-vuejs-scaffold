import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}', 'node_modules/@nuxt/ui/dist/**/*.{js,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Public Sans', 'sans-serif'],
      },
      animation: {
        saving: 'saving 1.1s ease-in-out infinite',
        deleting: 'deleting 650ms ease-in-out infinite',
      },
      keyframes: {
        saving: {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '0.65',
          },
          '50%': {
            transform: 'scale(1.08)',
            opacity: '1',
          },
        },
        deleting: {
          '0%, 100%': {
            transform: 'translateX(0) rotate(0)',
          },
          '25%': {
            transform: 'translateX(-1px) rotate(-4deg)',
          },
          '75%': {
            transform: 'translateX(1px) rotate(4deg)',
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
