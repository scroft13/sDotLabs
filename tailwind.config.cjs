const colors = require('tailwindcss/colors');
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
		colors: {
			primary: withOpacityValue('primary-color'),
			secondary: withOpacityValue('secondary-color'),
			tertiary: withOpacityValue('tertiary-color'),
			copy: {
				base: withOpacityValue('text-base'),
				muted: withOpacityValue('text-muted')
			},
			surface: {
				base: withOpacityValue('surface-base'),
				100: withOpacityValue('surface-100'),
				200: withOpacityValue('surface-200'),
				300: withOpacityValue('surface-300')
			},
			transparent: 'transparent',
			current: 'currentColor'
		},

		extend: {
			boxShadow: {
				button: `0px 8px 20px 0px`
			},
			screens: {
				'3xl': '2000px',
				short: { raw: '(min-width: 1280px) and (max-height: 960px)' },
				vk: {
					raw: '(max-width: 767px) and (min-aspect-ratio: 4/5)'
				}
			}
		}
	}
};
