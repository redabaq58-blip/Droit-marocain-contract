import type { Config } from 'tailwindcss'

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
        arabic: ['Noto Naskh Arabic', 'Amiri', 'serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#1B4332',
          light: '#2D6A4F',
          gold: '#B8860B',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
