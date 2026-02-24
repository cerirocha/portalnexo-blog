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
        canvas: '#fbfaf6',
        ink: '#1b1f1c',
        muted: '#66706c',
        line: '#dddace',
        brand: '#2e6f67',
        brandSoft: '#dbeee9',
        accent: '#c6985a',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      boxShadow: {
        card: '0 18px 36px -24px rgba(28, 46, 40, 0.34)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
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
