import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf6ef",
          100: "#faebd9",
          200: "#f2d1a8",
          500: "#c77b3a",
          600: "#a96126",
          700: "#864d1f"
        }
      }
    }
  },
  plugins: []
};

export default config;
