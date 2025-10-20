import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'script': ['Dancing Script', 'cursive'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: "#dbeafe",
        foreground: "#374151",
        'text-light': "#6b7280",
        'text-medium': "#4b5563",
        'text-dark': "#1f2937",
        'accent-blue': "#3b82f6",
        'accent-light-blue': "#dbeafe",
        'border-light': "#e5e7eb",
        'border-medium': "#d1d5db",
      },
      transitionProperty: {
        'all': 'color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        'smooth': '150ms',
      },
    },
  },
  plugins: [],
};
export default config;
