const { override, addWebpackAlias } = require('customize-cra')
const path = require('path')

module.exports = override(
	addWebpackAlias({
		'@assets': path.resolve(__dirname, 'src/assets'),
		'@components': path.resolve(__dirname, 'src/components'),
		'@hooks': path.resolve(__dirname, 'src/hooks'),
		'@utils': path.resolve(__dirname, 'src/utils'),
		'@views': path.resolve(__dirname, 'src/views'),
		'@types': path.resolve(__dirname, 'src/types'),
	}),
)
