import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: "#C99A3D",
          goldLight: "#E7C879",
          goldDark: "#8C6425",
          midnight: "#101116",
          charcoal: "#1C1D24",
          ivory: "#FAF8F3",
          surface: "#FFFFFF",
          slate: "#667085",
          techBlue: "#3B82F6",
        },
        status: {
          success: "#16A34A",
          warning: "#D97706",
          danger: "#DC2626",
        },
      },
      fontFamily: {
        arabic: ["Cairo", "IBM Plex Sans Arabic", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
