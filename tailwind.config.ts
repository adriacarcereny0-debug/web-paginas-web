import type { Config } from "tailwindcss";

/**
 * Sistema visual: papel cálido + tinta casi negra + un único azul de acento.
 * Se mantienen los nombres de color (brand / navy / mist) para no romper el
 * panel de administración: lo que cambia son los valores, no las clases.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Azul de acento: profundo y poco saturado. Se usa con cuentagotas.
        brand: {
          50: "#f0f3fe",
          100: "#dee5fc",
          200: "#c0ccf9",
          300: "#94a8f3",
          400: "#6480e9",
          500: "#3b5cdc",
          600: "#2442c4",
          700: "#1b32a0",
          800: "#172a80",
          900: "#131f58",
        },
        // Tinta: gris cálido casi negro, no el azul marino genérico.
        navy: {
          50: "#f7f6f3",
          100: "#edebe6",
          400: "#82817a",
          600: "#4a4a48",
          700: "#2e2e31",
          800: "#1c1c20",
          900: "#101014",
        },
        ink: "#101014",
        mist: "#f7f6f3",
        paper: "#fbfaf8",
        line: "#e4e1da",
        "line-strong": "#d3cfc6",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      // Radios contenidos: nada de esquinas de 28px por todas partes.
      borderRadius: { lg: "0.375rem", xl: "0.5rem", "2xl": "0.625rem", "3xl": "0.75rem" },
      boxShadow: {
        soft: "0 1px 2px rgba(16,16,20,.05)",
        card: "0 1px 2px rgba(16,16,20,.05), 0 12px 28px -22px rgba(16,16,20,.35)",
        lift: "0 1px 2px rgba(16,16,20,.06), 0 16px 36px -26px rgba(16,16,20,.45)",
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "none" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "scale-in": { from: { opacity: "0", transform: "scale(.98)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: {
        "fade-up": "fade-up .5s cubic-bezier(.22,1,.36,1) both",
        "fade-in": "fade-in .4s ease both",
        "scale-in": "scale-in .3s cubic-bezier(.22,1,.36,1) both",
      },
    },
  },
  plugins: [],
};
export default config;
