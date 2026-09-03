/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14171A",
        paper: "#FAF8F4",
        moss: {
          50: "#EEF6F2",
          100: "#D8ECE1",
          400: "#3F9C77",
          500: "#1F7A57",
          600: "#15633F",
        },
        amber: {
          50: "#FBF3E4",
          400: "#C98A2C",
          500: "#A8721F",
        },
        sand: "#EFE9DD",
      },
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,23,26,0.04), 0 8px 24px -12px rgba(20,23,26,0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
