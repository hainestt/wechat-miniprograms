const postcss = require('postcss')

module.exports = postcss.plugin('px2rpx', opt => {
	var reg = /\b(\d+(\.\d+)?)px\b/g

	return (root) => {
		root.replaceValues(reg, {fast: 'px'}, string => {
			return `${parseInt(string)}rpx`
		})
	}
})
