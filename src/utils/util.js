module.exports = {
	deepClone (obj) {
		let type = toString.call(obj).slice(8, -1)
		let result

		switch(type) {
			case 'Object':
				result = {}
				for (let i in obj) {
					if (obj.hasOwnProperty(i)) {
						result[i] = this.deepClone(obj[i])
					}
				}
				break
			case 'Array':
				result = []
				for (let i = 0, l = obj.length; i < l; i++) {
					result[i] = this.deepClone(obj[i])
				}
				break
			default:
				result = obj
				break
		}
	},
	duplicate (objs) {
		let obj = {}
		let result = []

		objs.forEach(item => {
			if (!obj[Object.keys(item)]) {
				result.unshift(item)
				obj[Object.keys(item)] = true
			}
		})

		return result
	}
}
