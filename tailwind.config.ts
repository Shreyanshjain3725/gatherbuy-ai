import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          950: "#070B14",
          900: "#0C1222",
          850: "#10182E",
          800: "#172340",
          700: "#213259",
          600: "#324A80",
        },
        emerald: {
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
        },
        lime: {
          400: "#A3E635",
          500: "#84CC16",
        },
        paypal: {
          blue: "#0070BA",
          darkBlue: "#003087",
          gold: "#FFC439",
          goldHover: "#F2B827",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-manrope)", "var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(16, 185, 129, 0.25)",
        "glow-lg": "0 0 40px -10px rgba(16, 185, 129, 0.35)",
        "paypal-glow": "0 0 30px -8px rgba(0, 112, 186, 0.3)",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
