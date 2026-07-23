import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cozy: {
          bg: "#1a1410",
          card: "#241c16",
          border: "#3d2f25",
          text: "#e8d5c4",
          muted: "#a08878",
          accent: "#c4853f",
          accentHover: "#d49950",
          green: "#7BA05B",
          white: "#C8C4B0",
          black: "#8B4513",
          oolong: "#D4852A",
          puerh: "#6B4226",
          yellow: "#E6C84E",
          tisane: "#C0856A",
          blend: "#B07D56",
        },
        warm: {
          bg: "#f5efe6",
          card: "#ffffff",
          border: "#e0d5c8",
          text: "#3d2f25",
          muted: "#8a7563",
          accent: "#c4853f",
          accentHover: "#b37434",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;