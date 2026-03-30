import type { Config } from "tailwindcss";

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
        neon: {
          cyan: "#00f5d4",
          magenta: "#f72585",
          purple: "#7b2ff7",
          yellow: "#fee440",
          blue: "#00bbf9",
        },
        dark: {
          900: "#0a0a0f",
          800: "#0f0f1a",
          700: "#161625",
          600: "#1e1e30",
          500: "#2a2a40",
        },
      },
      boxShadow: {
        neon: "0 0 20px rgba(0, 245, 212, 0.3)",
        "neon-magenta": "0 0 20px rgba(247, 37, 133, 0.3)",
        "neon-purple": "0 0 20px rgba(123, 47, 247, 0.3)",
      },
      animation: {
        "pulse-neon": "pulse-neon 2s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
      },
      keyframes: {
        "pulse-neon": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
