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
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'SF Pro Display'",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "'SF Mono'",
          "Menlo",
          "Monaco",
          "Consolas",
          "'Liberation Mono'",
          "monospace",
        ],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.04)",
        glow: "0 0 25px rgba(0, 102, 255, 0.2)",
        "glow-subtle": "0 0 15px rgba(0, 102, 255, 0.1)",
      },
    },
  },
  plugins: [],
};
