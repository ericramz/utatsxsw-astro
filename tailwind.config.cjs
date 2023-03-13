/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      margin: {
        22: "5.5rem"
      },
      backgroundImage: {
        c1: "url('/images/utsxsw-pattern-C1.png')"
      }
    },
    container: {
      center: true
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#ffffff",
      burntorange: "#bf5700",
      "burntorange-dark": "#9d4700",
      utorange: "#ae4f00",
      tangerineorange: "#f8971f",
      charcoal: "#333f48",
      "charcoal-dark": "#1f262b",
      "ut-charcoal--s40": "#1E262B",
      limestone: "#d6d2c4",
      "limestone-light": "#f2f1ed",
      gray: "#F4F6F7",
      "ut-limestone--t60": "#E6E4DC",
      "ut-shade--s40": "#5E686E"
    },
    fontFamily: {
      display: ['"Libre Franklin"', "sans-serif"],
      eighteeneightythree: ['"1883 Sans Medium"', "sans-serif"],
      eighteeneightythreeitalics: ['"1883 Sans Italics"', "sans-serif"],
      eighteeneightythreeblack: ['"1883 Sans Black"', "sans-serif"],
      eighteeneightythreebold: ['"1883 Sans Bold"', "sans-serif"],
      enzo: ["ff-enzo-web", "sans-serif"]
    }
  },
  plugins: [require("daisyui", "prettier-plugin-tailwindcss")]
}
