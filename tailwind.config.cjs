module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				tc: '#23dcc8'
			}
		}
	},
	plugins: [require('tw-elements/dist/plugin')]
};
