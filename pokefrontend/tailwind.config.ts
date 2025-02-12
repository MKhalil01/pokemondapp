import type { Config } from "tailwindcss";
import aspectRatio from '@tailwindcss/aspect-ratio';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        pokemon: {
          yellow: '#FFCB05',
          blue: '#3B4CCA',
          red: '#FF0000',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        display: ['var(--font-display)'],
      },
    },
  },
  plugins: [
    aspectRatio,
  ],
};

export default config;