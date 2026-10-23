import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        aura: {
          darkest: "#030708",
          dark: "#081014",
          surface: "#0d1a20",
          card: "rgba(13, 26, 32, 0.75)",
          border: "rgba(20, 184, 166, 0.2)",
          emerald: "#10b981",
          cyan: "#06b6d4",
          teal: "#14b8a6",
          amber: "#f59e0b",
          crimson: "#ef4444",
          purple: "#a855f7",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 25px rgba(6, 182, 212, 0.35)",
        hazard: "0 0 30px rgba(239, 68, 68, 0.4)",
        safe: "0 0 25px rgba(16, 185, 129, 0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
