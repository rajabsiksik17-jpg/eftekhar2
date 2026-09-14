import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7f7",
          100: "#d5ecec",
          200: "#aed9da",
          300: "#7ebfc1",
          400: "#4ba0a3",
          500: "#2f8588",
          600: "#276d71",
          700: "#225a5e",
          800: "#1f4a4d",
          900: "#1c3d40",
          950: "#0d2325",
        },
        gold: {
          50: "#fbf8ef",
          100: "#f5efd8",
          200: "#e9dcae",
          300: "#dcc67c",
          400: "#d0b15a",
          500: "#c39a40",
          600: "#a87d35",
          700: "#87602d",
          800: "#714f2c",
          900: "#614229",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(13, 35, 37, 0.15)",
        card: "0 2px 12px rgba(13, 35, 37, 0.08)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(196, 154, 64, 0.45)" },
          "50%": { boxShadow: "0 0 0 12px rgba(196, 154, 64, 0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
