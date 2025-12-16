import type { Config } from "tailwindcss"

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 30px rgba(88, 28, 135, 0.18)",
      },
      backgroundImage: {
        "xvk-radial":
          "radial-gradient(1200px 600px at 10% 0%, rgba(168, 85, 247, 0.25), transparent 60%), radial-gradient(900px 500px at 95% 10%, rgba(99, 102, 241, 0.18), transparent 55%)",
      },
    },
  },
  plugins: [],
} satisfies Config
