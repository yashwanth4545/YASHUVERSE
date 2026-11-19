/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        liquid: {
          dark: "#030712",
          deep: "#080d1a",
          card: "rgba(15, 23, 42, 0.75)",
          border: "rgba(255, 255, 255, 0.12)",
          glow: "rgba(0, 102, 255, 0.35)",
        },
        electric: {
          50: "#eef7ff",
          100: "#d9eeff",
          200: "#bce0ff",
          300: "#8eccff",
          400: "#59adff",
          500: "#2f89fc",
          600: "#0066FF",
          700: "#0052cc",
          800: "#0043a4",
          900: "#043985",
        },
        neon: {
          cyan: "#00F0FF",
          blue: "#0066FF",
          purple: "#A855F7",
          magenta: "#EC4899",
          emerald: "#10B981",
          amber: "#F59E0B",
        },
        silver: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
        },
      },
      fontFamily: {
        sans: ["'Inter'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        headings: ["'Manrope'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        body: ["'Inter'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        tech: ["'Space Grotesk'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["'JetBrains Mono'", "'SF Mono'", "Menlo", "Consolas", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-hover": "0 16px 48px -4px rgba(0, 102, 255, 0.25)",
        "liquid-card": "0 10px 40px -10px rgba(0, 102, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
        "liquid-glow": "0 0 35px rgba(0, 240, 255, 0.3)",
        "glow-cyan": "0 0 30px rgba(0, 240, 255, 0.35)",
        "glow-blue": "0 0 30px rgba(0, 102, 255, 0.4)",
        "glow-magenta": "0 0 30px rgba(236, 72, 153, 0.35)",
      },
      animation: {
        "spin-slow": "spin 25s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fluid-blob": "fluidBlob 12s ease-in-out infinite alternate",
        "scanline": "scanline 2s linear infinite",
        "shimmer": "shimmer 2.5s infinite",
      },
      keyframes: {
        fluidBlob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "50%": { transform: "translate(30px, -20px) scale(1.1)" },
          "100%": { transform: "translate(-20px, 20px) scale(0.95)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
