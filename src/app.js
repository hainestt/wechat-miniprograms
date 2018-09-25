import regeneratorRuntime from './lib/runtime'
const result = require('./data/results')

App({

	isIphonex: false,
	systemInfo: '',
	testResult: result,
	windowWidth: '',
	windowHeight: '',
	screenWidth: '',
	screenHeight: '',
	rurl: 'https://wechatapp.aoscdn.com',

	onLaunch () {

		wx.getSystemInfo({
			success: res => {
				let model = res.model
				if (model.search('iPhone X') !== -1) {
					this.isIphonex = true
				}
				this.systemInfo = `${res.brand}-${res.model}-${res.system}-${res.platform}-${res.SDKVersion}`
				this.windowWidth = res.windowWidth
				this.windowHeight = res.windowHeight
				this.screenWidth = res.screenWidth
				this.screenHeight = res.screenHeight
			}
		})
	},

	backUntil (path) {
		let comparePath = path[0] === '/' ? path.slice(1) : path
		let pages = getCurrentPages()

		for (let i = pages.length - 1; i >= 0; i--) {
			let page = pages[i]
			if (page.route.indexOf(comparePath) === 0) {
				let backCount = pages.length - i - 1
				if (backCount > 0) {
					wx.navigateBack({delta: backCount})
				}
				return
			}
		}

		wx.reLaunch({url: path})
	},

	showModel (data) {
		let {errcode, errmsg} = data

		wx.showModal({
			title: '请求失败',
			content: `${errcode}:${errmsg}`,
			showCancel: false
		})
	},

	post (url, data) {
		let session = wx.getStorageSync('session') || ''

		Object.assign(data, {session: session})

		return new Promise(resolve => {
			wx.request({
				url: `${this.rurl}/pdp/${url}`,
				method: 'POST',
				dataType: 'json',
				data: data,
				header: {
					'content-type': 'application/json'
				},
				success: res => {
					let data = res.data
					let errcode = data.errcode

					if (!errcode) {
						resolve(data)
					} else {
						this.showModel(data)
					}
				},
				fail: () => {
					let data = {errcode: '404', errmsg: 'Not Found'}
					this.showModal(data)
				}
			})
		})
	},

	getCode() {
		return new Promise(resolve => {
			wx.login({
				success: res => {
					let code = res.code
					if (code) {
						resolve(code)
					} else {
						wx.showModal({
							title: '登录失败',
							content: '登录失败，请稍后再试',
							showCancel: false
						})
					}
				},
				fail: () => {
					wx.showModal({
						title: '登录失败',
						content: '登录失败，请稍后再试',
						showCancel: false
					})
				}
			})
		})
	},
	checkSession () {
		return new Promise((resolve, reject) => {
			wx.checkSession({
				success: resolve,
				fail: reject
			})
		})
	},
	async login () {
		let code = await this.getCode()

		console.log('login_code:', code)

		let data = await this.post('login', {code: code})

		let { session, expired } = data.data

		wx.setStorageSync('session', session)

		/***
		 * TODO
		 */

		console.log('data', data)
	}

})
