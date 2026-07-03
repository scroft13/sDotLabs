/* eslint-disable @typescript-eslint/no-var-requires */
const defaultTheme = require('tailwindcss/defaultTheme');
const withOpacityValue =
  (varName) =>
  ({ opacityValue }) =>
    opacityValue === undefined
      ? `hsl(var(--${varName}))`
      : `hsla(var(--${varName}) / ${opacityValue})`;

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      colors: {
        primary: withOpacityValue('primary-color'),
        secondary: withOpacityValue('secondary-color'),
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        button: '0px 8px 20px 0',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
