/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
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
        silver: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
        },
        chrome: {
          light: "#ffffff",
          surface: "#f8fafc",
          border: "rgba(226, 232, 240, 0.85)",
          edge: "rgba(255, 255, 255, 0.9)",
          dark: "#0f172a",
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
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.04)",
        "glass-hover": "0 16px 40px -4px rgba(0, 102, 255, 0.08)",
        "glass-elevated": "0 20px 48px -8px rgba(15, 23, 42, 0.08)",
        glow: "0 0 25px rgba(0, 102, 255, 0.2)",
        "glow-cyan": "0 0 25px rgba(0, 216, 255, 0.2)",
        "glow-subtle": "0 0 15px rgba(0, 102, 255, 0.1)",
        metallic: "0 2px 10px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
      },
      animation: {
        "spin-slow": "spin 20s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.4s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
