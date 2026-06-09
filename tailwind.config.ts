import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sf: {
          blue: '#0070D2',
          'blue-dark': '#005FB2',
          'blue-light': '#E3F0FC',
          'blue-mid': '#1589EE',
          navy: '#032D60',
          green: '#04844B',
          'green-light': '#E3F5E1',
          orange: '#FF8300',
          'orange-light': '#FFF0E0',
          red: '#C23934',
          'red-light': '#FDECEC',
          purple: '#7B5EA7',
          'purple-light': '#F3F0FA',
          teal: '#0B827C',
          gold: '#FFB75D',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.05)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.12)',
        modal: '0 20px 60px -10px rgba(0,0,0,0.25)',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}

export default config
