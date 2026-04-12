import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
        primary: "#6C63FF",
        accent: "#C8F135",
        dark: "#1A1A2E",
        light: "#F5F5FF",
        "text-on-dark": "#FFFFFF",
        "text-on-light": "#1A1A2E",
        surface: "#22223F",
        "surface-elevated": "#2A2A4A",
        border: "rgb(255 255 255 / 0.1)",
        muted: "rgb(255 255 255 / 0.65)",
      },
    },
  },
} satisfies Config;
