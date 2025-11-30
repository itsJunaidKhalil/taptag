import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: {
          DEFAULT: "#4A3AFF",
          50: "#F0EFFF",
          100: "#E0DFFF",
          200: "#C1BFFF",
          300: "#A29FFF",
          400: "#837FFF",
          500: "#4A3AFF",
          600: "#3B2ECC",
          700: "#2D2299",
          800: "#1E1766",
          900: "#0F0B33",
        },
        secondary: {
          DEFAULT: "#00C4B4",
          50: "#E6F9F7",
          100: "#CCF3EF",
          200: "#99E7DF",
          300: "#66DBCF",
          400: "#33CFBF",
          500: "#00C4B4",
          600: "#009D90",
          700: "#00766C",
          800: "#004E48",
          900: "#002724",
        },
        accent: {
          DEFAULT: "#FFB800",
          50: "#FFF9E6",
          100: "#FFF3CC",
          200: "#FFE799",
          300: "#FFDB66",
          400: "#FFCF33",
          500: "#FFB800",
          600: "#CC9300",
          700: "#996E00",
          800: "#664A00",
          900: "#332500",
        },
        neutral: {
          DEFAULT: "#F5F7FA",
          bg: "#F5F7FA",
          text: "#0A0A0A",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        heading: ['Poppins', 'Satoshi', 'system-ui', 'sans-serif'],
        body: ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(74, 58, 255, 0.3)',
        'glow-secondary': '0 0 20px rgba(0, 196, 180, 0.3)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4A3AFF 0%, #00C4B4 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #00C4B4 0%, #FFB800 100%)',
        'gradient-accent': 'linear-gradient(135deg, #FFB800 0%, #4A3AFF 100%)',
        'gradient-soft': 'linear-gradient(135deg, rgba(74, 58, 255, 0.1) 0%, rgba(0, 196, 180, 0.1) 100%)',
      },
    },
  },
  plugins: [],
};
export default config;

