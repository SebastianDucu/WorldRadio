import type { Config } from "tailwindcss";

// Los colores leen variables CSS en formato "R G B" para poder usar opacidad (bg-accent/20).
const rgb = (name: string) => `rgb(var(--color-${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: rgb("bg"),
        surface: rgb("surface"),
        accent: rgb("accent"),
        accent2: rgb("accent-2"),
        fg: rgb("fg"),
        muted: rgb("muted"),
        success: rgb("success"),
        danger: rgb("danger"),
        xmas: {
          red: rgb("xmas-red"),
          pine: rgb("xmas-pine"),
          gold: rgb("xmas-gold"),
          snow: rgb("xmas-snow"),
          night: rgb("xmas-night"),
        },
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "Inter", "system-ui", "sans-serif"],
        sans: ["'Plus Jakarta Sans'", "Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
        xmas: ["'Mountains of Christmas'", "'Plus Jakarta Sans'", "cursive"],
      },
      // Escala de espaciado: Tailwind ya usa múltiplos de 4 px (1 = 4 px).
      borderRadius: { xl: "1rem", "2xl": "1.5rem" },
      boxShadow: {
        glass: "0 8px 32px rgb(0 0 0 / 0.28)",
        glow: "0 0 24px rgb(var(--color-accent) / 0.35)",
      },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
        spin360: { to: { transform: "rotate(360deg)" } },
      },
      animation: { shimmer: "shimmer 1.6s infinite", spin360: "spin360 0.9s linear infinite" },
    },
  },
  plugins: [],
} satisfies Config;
