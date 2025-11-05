import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import tailwindScrollbar from "tailwind-scrollbar";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
    variants: {
      scrollbar: ['rounded'],
    },
  },
  // plugins: [require('tailwind-scrollbar')],
   plugins: [
    tailwindScrollbar,
    plugin(function () {
      // Your custom plugin code here
    }),
  ],
};

export default config;
