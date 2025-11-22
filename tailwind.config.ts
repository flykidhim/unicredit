import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "uc-red": "#e2001a",
        "uc-blue": "#0099cc",
        "uc-dark": "#262626",
        "uc-cta": "#007a91",
        "uc-grey": "#f5f5f5",
        "uc-footer-dark": "#000000",
        "uc-footer-mid": "#333333"
      },
      fontFamily: {
        unicredit: ['"unicredit-regular"', '"Helvetica Neue"', "Helvetica", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
