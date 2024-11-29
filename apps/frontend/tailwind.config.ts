/* eslint-disable @typescript-eslint/no-var-requires */
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
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
          '1-dark': 'hsl(var(--dark-chart-1))',
          '2-dark': 'hsl(var(--dark-chart-2))',
          '3-dark': 'hsl(var(--dark-chart-3))',
          '4-dark': 'hsl(var(--dark-chart-4))',
          '5-dark': 'hsl(var(--dark-chart-5))',
        },
        'media-brand': 'rgb(var(--media-brand) / <alpha-value>)',
        'media-focus': 'rgb(var(--media-focus) / <alpha-value>)',
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
        pulse: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.5',
          },
        },
        rainbow: {
          '0%': {
            'background-position': '0%',
          },
          '100%': {
            'background-position': '200%',
          },
        },
        'rainbow-pulsate': {
          '0%': {
            'background-position': '0%',
            filter: 'blur(4px)',
          },
          '50%': {
            'background-position': '100%',
            filter: 'blur(0px)',
          },
          '100%': {
            'background-position': '200%',
            filter: 'blur(4px)',
          },
        },
        'spring-spin': {
          '0%, 100%': {
            transform: 'rotate(0deg)',
          },
          '15%': {
            transform: 'rotate(405deg) scale(1.1)',
            opacity: '0.5',
          },
          '20%': {
            transform: 'rotate(360deg)',
            opacity: '1',
          },
          '80%': {
            transform: 'rotate(360deg)',
            opacity: '1',
          },
          '95%': {
            transform: 'rotate(-90deg) scale(1.1)',
            opacity: '0.5',
          },
        },
        rotate: {
          '0%': {
            transform: 'rotate(0deg) scale(10)',
            opacity: '0',
          },
          '20%': {
            opacity: '0',
          },
          '30%': {
            opacity: '1',
          },
          '40%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0',
          },
          '60%': {
            opacity: '0',
          },
          '70%': {
            opacity: '0',
          },
          '80%': {
            opacity: '1',
          },
          '100%': {
            transform: 'rotate(-360deg) scale(10)',
            opacity: '0',
          },
        },
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
    animation: {
      pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      rainbow: 'rainbow 2s infinite ease-in-out',
      'rainbow-pulsate': 'rainbow-pulsate 2s infinite ease-in-out',
      'spring-spin': 'spring-spin 4s ease-in-out infinite',
      rotate: 'rotate 5s linear infinite',
      spin: 'spin 1s linear infinite',
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@vidstack/react/tailwind.cjs')({ prefix: 'media' }),
    require('@tailwindcss/typography'),
  ],
};
export default config;
