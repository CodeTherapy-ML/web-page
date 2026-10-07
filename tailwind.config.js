/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-manrope)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-newsreader)", "ui-serif", "Georgia", "serif"],
        // Admin (CMS) faces — cms-* frames
        admin: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        geist: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        "geist-mono": ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        // CodeTherapy brand palette — sampled from public/logo.jpeg:
        // black field #000000 · "Code" in white · "Therapy" in #00AEEF.
        // Everything below is that cyan, that black and their tints.
        cream: "#f4f8fb", // cool paper (an 8% wash of the brand cyan)
        line: "#dbe6ef",
        ink: {
          DEFAULT: "#0d1117", // the logo's black, lifted just enough for body text
          deep: "#05080c", // darkest surfaces — footer, admin sidebar
          soft: "#45586a",
        },
        azure: {
          DEFAULT: "#00719d", // interactive shade — 5.5:1 with white text
          soft: "#e2f4fd",
          bright: "#00aeef", // the logo cyan itself, for dark grounds + accents
          deep: "#005273", // hover / pressed
        },
        navy: {
          DEFAULT: "#0b3c5d", // the second tone — same hue, deeper and calmer
          soft: "#e7ecf1",
        },
        // Admin (CMS) palette — cms-* frames. Neutrals are Tailwind grays.
        "admin-azure": "#00719d",
        "admin-navy": "#0b3c5d",
        "admin-danger": "#dc2626",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}
