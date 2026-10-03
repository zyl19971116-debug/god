import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#050505",
        abyss: "#0a0908",
        panel: "#100e0b",
        panel2: "#171410",
        charcoal: "#1d1a15",
        line: "#2a251d",
        gold: {
          50: "#fbf6e6",
          100: "#f4ead0",
          200: "#e8d6a6",
          300: "#dcc07d",
          400: "#cfa64f",
          500: "#c19a3f",
          600: "#a67c2c",
          700: "#7d5a1e",
          800: "#543c14",
          900: "#2e210b",
        },
        ivory: {
          DEFAULT: "#f2ece1",
          dim: "#c9c2b4",
          faint: "#8f887b",
        },
        chaos: {
          DEFAULT: "#a3282a",
          deep: "#5c1416",
          glow: "#d94b3f",
        },
      },
      fontFamily: {
        serif: ["Cinzel", "Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
        display: ["Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "Manrope", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        script: ["Cormorant Garamond", "Playfair Display", "Georgia", "cursive"],
      },
      letterSpacing: {
        divine: "0.32em",
        wide2: "0.18em",
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(193,154,63,0.35), 0 0 34px -8px rgba(193,154,63,0.35)",
        "gold-lg": "0 0 0 1px rgba(193,154,63,0.45), 0 0 70px -12px rgba(193,154,63,0.45)",
        halo: "0 0 90px -20px rgba(207,166,79,0.55)",
      },
      backgroundImage: {
        "gold-sheen": "linear-gradient(100deg,#a67c2c 0%,#e8d6a6 22%,#fbf6e6 38%,#cfa64f 60%,#a67c2c 100%)",
        "temple-grid":
          "radial-gradient(circle at 50% 0%, rgba(193,154,63,0.10), transparent 55%)",
      },
      keyframes: {
        "spin-slow": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
        "spin-rev": { from: { transform: "rotate(360deg)" }, to: { transform: "rotate(0deg)" } },
        "pulse-glow": {
          "0%,100%": { opacity: "0.45" },
          "50%": { opacity: "1" },
        },
        "rise-in": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "spin-slow": "spin-slow 40s linear infinite",
        "spin-rev": "spin-rev 60s linear infinite",
        "pulse-glow": "pulse-glow 3.4s ease-in-out infinite",
        "rise-in": "rise-in 0.7s ease-out both",
        shimmer: "shimmer 2.6s linear infinite",
        float: "float 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
