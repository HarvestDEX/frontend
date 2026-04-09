import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0f1a0f',
        surface: '#1a2e1a',
        card: '#243324',
        border: '#4a7c59',
        accent: '#7bc67a',
        gold: '#f0c060',
        red: '#e05050',
        blue: '#5090e0',
        white: '#e8f5e8',
        muted: '#6b8f6b',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        body: ['"VT323"', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
