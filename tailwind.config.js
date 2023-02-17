module.exports = {
  mode: 'jit',
  purge: [
    `~/components/**/*.{vue,js}`,
    `~/layouts/**/*.vue`,
    `~/pages/**/*.vue`,
    `~/assets/**/*.{less,css}`,
    `~/plugins/**/*.{js,ts}`,
    `~~/nuxt.config.{js,ts}`,
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    container: {
      center: true,
    },
    colors: {
      primary: 'var(--primary)',
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/aspect-ratio')],
}
