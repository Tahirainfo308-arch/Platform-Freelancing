import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F9F9F9",
        deep: {
          DEFAULT: "#00501F",
          50: "#E7F1EA",
          100: "#CBE3D2",
          200: "#9CC8AA",
          300: "#69AA80",
          400: "#3C8C5E",
          500: "#00501F",
          600: "#00441A",
          700: "#003616",
          800: "#002A11",
          900: "#001F0C",
        },
        mint: {
          DEFAULT: "#00CB75",
          dark: "#00A862",
          50: "#E6FBF1",
          100: "#CCF7E2",
          200: "#A8EECB",
          300: "#74E3AE",
          400: "#3DD68F",
          500: "#00CB75",
          600: "#00B269",
          700: "#00915A",
        },
        brand: {
          DEFAULT: "#00CB75",
          dark: "#00915A",
          light: "#3DD68F",
          50: "#E6FBF1",
          100: "#CCF7E2",
          200: "#A8EECB",
          300: "#74E3AE",
          400: "#3DD68F",
          500: "#00CB75",
          600: "#00B269",
          700: "#00915A",
        },
        ink: {
          DEFAULT: "#1E293B",
          50: "#F8FAFC",
          100: "#E5E7EB",
          200: "#D1D5DB",
          300: "#9CA3AF",
          400: "#64748B",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#3B82F6",
        sun: "#F6B94A",
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "Segoe UI", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 12px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 12px 28px -8px rgba(0, 0, 0, 0.14)",
        elevated: "0 16px 40px -20px rgba(0, 0, 0, 0.18)",
        glow: "0 8px 24px -6px rgba(0, 203, 117, 0.45)",
        soft: "0 2px 6px rgba(0, 0, 0, 0.05)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
