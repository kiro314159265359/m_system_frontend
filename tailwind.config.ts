import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Warm gold palette — matches @theme in globals.css */
        gold: {
          50:  "#faeeda",
          100: "#fac775",
          200: "#ef9f27",
          300: "#c9a96e",
          400: "#ba7517",
          500: "#854f0b",
          600: "#633806",
          700: "#412402",
        },
        /* Warm stone palette — matches @theme in globals.css */
        stone: {
          50:  "#faf9f7",
          100: "#faf9f7",
          200: "#f7f5f2",
          300: "#f1efe8",
          400: "#d3d1c7",
          500: "#b4b2a9",
          600: "#888780",
          700: "#5f5e5a",
          800: "#444441",
          900: "#2c2c2a",
          950: "#1a1714",
        },
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
        xl: "16px",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-up": "slide-up 0.35s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;