import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      colors: {
        brand: {
          DEFAULT: "#FF4D1C",
          soft: "#FFEDE6",
          dark: "#D93A0E",
        },
        ink: {
          DEFAULT: "#0B0F14",
          2: "#121821",
          3: "#1B2431",
        },
        surface: "#F7F8FA",
        line: "#E7EAF0",
      },
      fontFamily: {
        sans: ["var(--font-be-vietnam)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.5rem",
      },
      boxShadow: {
        card: "0 4px 24px rgba(11,15,20,.06)",
        lift: "0 12px 32px rgba(11,15,20,.12)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseSoft: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: ".55" },
        },
      },
      animation: {
        "fade-up": "fade-up .5s ease-out both",
        "scale-in": "scale-in .35s ease-out both",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
