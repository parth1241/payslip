import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
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
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        error: "hsl(var(--error))",
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
        base: '#0a0a1a',
        surface: '#0f0f2e',
        surfaceUp: '#1a1a3e',
        surfaceHigh: '#252550',
        
        indigo: { DEFAULT: '#6366f1', light: '#818cf8', dark: '#4f46e5', glow: 'rgba(99,102,241,0.25)' },
        violet: { DEFAULT: '#8b5cf6', light: '#a78bfa', dark: '#7c3aed', glow: 'rgba(139,92,246,0.25)' },
        fuchsia: { DEFAULT: '#d946ef', light: '#e879f9', dark: '#c026d3', glow: 'rgba(217,70,239,0.25)' },
        amber: { DEFAULT: '#f59e0b', light: '#fbbf24', dark: '#d97706', glow: 'rgba(245,158,11,0.25)' },
        emerald: { DEFAULT: '#10b981', light: '#34d399', dark: '#059669', glow: 'rgba(16,185,129,0.25)' },
        cyan: { DEFAULT: '#06b6d4', light: '#22d3ee', dark: '#0891b2', glow: 'rgba(6,182,212,0.25)' },
        rose: { DEFAULT: '#f43f5e', light: '#fb7185', dark: '#e11d48', glow: 'rgba(244,63,94,0.25)' },
        sky: { DEFAULT: '#0ea5e9', light: '#38bdf8', dark: '#0284c7', glow: 'rgba(14,165,233,0.25)' },
        
        textPrimary: '#f8fafc',
        textMuted: '#94a3b8',
        textHint: '#475569',
        borderDefault: 'rgba(255,255,255,0.08)',
        borderGlow: 'rgba(99,102,241,0.3)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
