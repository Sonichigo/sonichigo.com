/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        terminal: {
          blue: "#60a5fa",
          amber: "#fbbf24",
          green: "#04f75d",
          pink: "#f472b6",
        },
        surface: {
          DEFAULT: "#ffffff",
          dark: "#0a0a0a",
        },
        muted: {
          DEFAULT: "#f5f5f5",
          dark: "#141414",
        },
      },
      animation: {
        "blink": "blink 1.2s step-end infinite",
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
      },
      keyframes: {
        blink: {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
