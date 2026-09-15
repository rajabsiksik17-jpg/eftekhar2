import type { Config } from "tailwindcss";

const rgb = (v: string) => `rgb(var(--${v}) / <alpha-value>)`;

const scale = (prefix: string, max: number) => {
  const out: Record<string, string> = {};
  for (let i = 0; i <= max; i++) {
    const key = i === 0 ? "50" : String(i * 100);
    if (Number(key) > max * 100) break;
    out[key] = rgb(`${prefix}-${key}`);
  }
  return out;
};

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
          50: rgb("brand-50"),
          100: rgb("brand-100"),
          200: rgb("brand-200"),
          300: rgb("brand-300"),
          400: rgb("brand-400"),
          500: rgb("brand-500"),
          600: rgb("brand-600"),
          700: rgb("brand-700"),
          800: rgb("brand-800"),
          900: rgb("brand-900"),
          950: rgb("brand-950"),
        },
        gold: {
          50: rgb("accent-50"),
          100: rgb("accent-100"),
          200: rgb("accent-200"),
          300: rgb("accent-300"),
          400: rgb("accent-400"),
          500: rgb("accent-500"),
          600: rgb("accent-600"),
          700: rgb("accent-700"),
          800: rgb("accent-800"),
          900: rgb("accent-900"),
        },
        accent: {
          50: rgb("accent-50"),
          100: rgb("accent-100"),
          200: rgb("accent-200"),
          300: rgb("accent-300"),
          400: rgb("accent-400"),
          500: rgb("accent-500"),
          600: rgb("accent-600"),
          700: rgb("accent-700"),
          800: rgb("accent-800"),
          900: rgb("accent-900"),
        },
        secondary: {
          50: rgb("secondary-50"),
          100: rgb("secondary-100"),
          200: rgb("secondary-200"),
          300: rgb("secondary-300"),
          400: rgb("secondary-400"),
          500: rgb("secondary-500"),
          600: rgb("secondary-600"),
          700: rgb("secondary-700"),
          800: rgb("secondary-800"),
          900: rgb("secondary-900"),
        },
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          secondary: "rgb(var(--ink-secondary) / <alpha-value>)",
          muted: "rgb(var(--ink-muted) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgb(23 37 84 / 0.15)",
        card: "0 2px 12px rgb(23 37 84 / 0.08)",
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgb(var(--accent-500) / 0.45)" },
          "50%": { boxShadow: "0 0 0 12px rgb(var(--accent-500) / 0)" },
        },
      },
      animation: {
        "pulse-soft": "pulseSoft 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
