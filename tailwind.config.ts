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
        "tinta-archivo": "#161817",
        "papel-algodon": "#F5F0E6",
        "verde-organico": "#1F362D",
        "lacre-borgona": "#6E2C28",
        "bronce-antiguo": "#B89352",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      backgroundImage: {
        "radial-luxury":
          "radial-gradient(circle at 50% 0%, rgba(184, 147, 82, 0.12) 0%, rgba(22, 24, 23, 0) 70%)",
      },
    },
  },
  plugins: [],
};

export default config;

