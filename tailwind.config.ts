import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#f8f7f3',
        ink: '#11120f',
        muted: '#6b6f64',
        line: '#d5d5ca',
        brand: '#0f4c81',
        brandSoft: '#d8e6f2',
        accent: '#9e7b45',
      },
      fontFamily: {
        display: ['"Bodoni Moda"', 'serif'],
        body: ['"Work Sans"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 12px 25px -14px rgba(11, 29, 45, 0.28)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        rise: 'rise 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
