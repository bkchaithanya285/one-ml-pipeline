import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#030712",
        surface: "#090d16",
        "surface-card": "rgba(15, 23, 42, 0.75)",
        "neon-cyan": "#00f3ff",
        "neon-blue": "#3b82f6",
        "neon-purple": "#a855f7",
        "neon-pink": "#ec4899",
        "neon-red": "#ef4444",
        "neon-green": "#10b981",
        "neon-amber": "#f59e0b",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        orbitron: ["var(--font-orbitron)", "monospace"],
      },
      boxShadow: {
        "cyan-glow": "0 0 30px rgba(0, 243, 255, 0.45)",
        "blue-glow": "0 0 30px rgba(59, 130, 246, 0.45)",
        "purple-glow": "0 0 30px rgba(168, 85, 247, 0.45)",
        "red-glow": "0 0 30px rgba(239, 68, 68, 0.5)",
        "holo-card": "0 8px 32px 0 rgba(0, 243, 255, 0.2)",
      },
      backgroundImage: {
        "cyber-grid":
          "linear-gradient(to right, rgba(0, 243, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 243, 255, 0.05) 1px, transparent 1px)",
        "radial-gradient":
          "radial-gradient(circle at 50% 50%, rgba(0, 243, 255, 0.15), transparent 70%)",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.9", filter: "drop-shadow(0 0 20px #00f3ff)" },
          "50%": { opacity: "0.4", filter: "drop-shadow(0 0 6px #00f3ff)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        rotateHolo: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 3s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        rotateHolo: "rotateHolo 20s linear infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
