/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				'sans': ['Work Sans', 'Arial', 'sans-serif'],
			},
			container: {
				center: true,
			},
			screens: {
				'xl': '1024px', 
				'2xl': '1024px', 
			},
		}
	},
	plugins: [],
}
