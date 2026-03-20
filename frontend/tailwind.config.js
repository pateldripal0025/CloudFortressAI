/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "0 0% 3.9%",
        foreground: "0 0% 98%",
        primary: {
          DEFAULT: "0 0% 98%",
          foreground: "0 0% 9%",
        },
        muted: {
          DEFAULT: "0 0% 14.9%",
          foreground: "0 0% 63.9%",
        },
        accent: {
          DEFAULT: "0 0% 14.9%",
          foreground: "0 0% 98%",
        },
        border: "0 0% 14.9%",
        input: "0 0% 14.9%",
        ring: "0 0% 83.1%",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
    },
  },
  plugins: ["tailwindcss-animate"],
}
