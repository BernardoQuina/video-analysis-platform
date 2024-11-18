import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Satoshi', 'sans-serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        'background-dark': 'hsl(var(--dark-background))',
        foreground: 'hsl(var(--foreground))',
        'foreground-dark': 'hsl(var(--dark-foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          dark: 'hsl(var(--dark-card))',
          foreground: 'hsl(var(--card-foreground))',
          'foreground-dark': 'hsl(var(--dark-card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          dark: 'hsl(var(--dark-popover))',
          foreground: 'hsl(var(--popover-foreground))',
          'foreground-dark': 'hsl(var(--dark-popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          dark: 'hsl(var(--dark-primary))',
          foreground: 'hsl(var(--primary-foreground))',
          'foreground-dark': 'hsl(var(--dark-primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          dark: 'hsl(var(--dark-secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          'foreground-dark': 'hsl(var(--dark-secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          dark: 'hsl(var(--dark-muted))',
          foreground: 'hsl(var(--muted-foreground))',
          'foreground-dark': 'hsl(var(--dark-muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          dark: 'hsl(var(--dark-accent))',
          foreground: 'hsl(var(--accent-foreground))',
          'foreground-dark': 'hsl(var(--dark-accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          dark: 'hsl(var(--dark-destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          'foreground-dark': 'hsl(var(--dark-destructive-foreground))',
        },
        border: {
          DEFAULT: 'hsl(var(--border))',
          dark: 'hsl(var(--dark-border))',
        },
        input: {
          DEFAULT: 'hsl(var(--input))',
          dark: 'hsl(var(--dark-input))',
        },
        ring: {
          DEFAULT: 'hsl(var(--ring))',
          dark: 'hsl(var(--dark-ring))',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '1-dark': 'hsl(var(--dark-chart-1))',
          '2': 'hsl(var(--chart-2))',
          '2-dark': 'hsl(var(--dark-chart-2))',
          '3': 'hsl(var(--chart-3))',
          '3-dark': 'hsl(var(--dark-chart-3))',
          '4': 'hsl(var(--chart-4))',
          '4-dark': 'hsl(var(--dark-chart-4))',
          '5': 'hsl(var(--chart-5))',
          '5-dark': 'hsl(var(--dark-chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        rainbow: {
          '0%': { 'background-position': '0%' },
          '100%': { 'background-position': '200%' },
        },
        'rainbow-pulsate': {
          '0%': { 'background-position': '0%', filter: 'blur(4px)' },
          '50%': { 'background-position': '100%', filter: 'blur(0px)' },
          '100%': { 'background-position': '200%', filter: 'blur(4px)' },
        },
        'spring-spin': {
          '0%, 100%': {
            transform: 'rotate(0deg)', // 1st Rotation start (and 2nd rotation end)
          },
          '15%': {
            transform: 'rotate(405deg) scale(1.1)', // 1st rotation peak (over rotation)
          },
          '20%': {
            transform: 'rotate(360deg)', // 1st rotation end (start hold)
          },
          '45%': {
            transform: 'scale(1)', // Continue holding rotation (pulsate start)
          },
          '50%': {
            transform: 'scale(1.2)', // Continue holding rotation (pulsate peak)
          },
          '55%': {
            transform: 'scale(1)', // Continue holding rotation (pulsate end)
          },
          '80%': {
            transform: 'rotate(360deg)', // 2nd rotation start
          },
          '95%': {
            transform: 'rotate(-90deg) scale(1.1)', // 2nd rotation peak (over rotation)
          },
        },
      },
    },
    animation: {
      rainbow: 'rainbow 2s infinite ease-in-out',
      'rainbow-pulsate': 'rainbow-pulsate 2s infinite ease-in-out',
      'spring-spin': 'spring-spin 5s ease-in-out infinite',
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
