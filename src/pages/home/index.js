const app = getApp()
const questions = require('../../data/questions')
const util = require('../../utils/util')

Page({
	data: {
		cardHeight: 0,

		questions: questions,

		currentIndex: 0,

		result: [],

		qa: null,

		isSubmitShow: false
	},
	onLoad () {

		let { questions, currentIndex } = this.data

		questions.forEach(item => {
			if (!item.hasOwnProperty('checked')) {
				item.checked = false
			}
		})

		this.setData({
			questions: questions,
			qa: questions[currentIndex]
		})

		app.login()
	},
	timeout: 0,
	handleNext () {
		let { currentIndex, questions,qa } = this.data
		let len                         = questions.length

		console.log('currentIndex', currentIndex)
		console.log('result', this.data.result)

		if (qa.checked) {
			if (currentIndex < len-1) {
				if (!this.timeout) {
					currentIndex += 1

					this.setData({
						currentIndex: currentIndex,
						qa: questions[currentIndex]
					})

					this.timeout = setTimeout(() => {
						this.timeout = 0
					}, 200)
				}

				if (currentIndex === len -1) {
					this.setData({
						isSubmitShow: true
					})
				}
			}
		} else {
			wx.showModal({
				title: '未选择',
				content: '请选择一项',
				showCancel: false
			})
		}
	},
	handleGetUserInfo (e) {
		let { qa }       = this.data
		let { userInfo } = e.detail
		let session      = wx.getStorageSync('session') || ''
		let data         = Object.create(null)

		Object.assign(data, e.detail, {session: session})

		app.post('update_user', data)
			.then(res => {
				console.log('update_user', res)
				if (qa.checked) {
					this.handleSubmit()
				} else {
					wx.showModal({
						title: '未选择',
						content: '请选择一项',
						showCancel: false
					})
				}

			})


		if (!!userInfo) {
			wx.setStorageSync('userInfo', userInfo)
		}
	},

	handleChange (e) {
		let { questions, currentIndex } = this.data

		if (e.detail.source.includes('touch')) {

			if (!questions[currentIndex].checked) {
				this.setData ({
					currentIndex: currentIndex
				})
			}

		}
	},
	hadnleAnimationEnd (e) {
		this.setData({
			currentIndex: e.detail.current
		})
	},
	handleRadioChange (e) {
		let { qa, questions, currentIndex, result } = this.data
		let { value }                               = e.detail

		if (value) {

			qa.checked = questions[currentIndex].checked = true

			result.unshift({ [currentIndex] : value})

			// if (currentIndex === questions.length - 1) {
			// 	this.handleSubmit()
			// }

			this.setData({
				result: result
			})

		}

	},
	handleToggle (e) {
		let { currentIndex } = this.data

		if (!currentIndex) {
			currentIndex += 1
		} else {
			currentIndex = --currentIndex !== 0 ? currentIndex : 0
		}

		this.setData({
			currentIndex: currentIndex
		})

	},
	arrayToObj(arr) {
		let temp = {}

		arr.forEach(item => {
			let key = Object.keys(item)
			let value = item[key]
			temp[parseInt(key) + 1] = parseInt(value)
		})

		return temp
	},
	handleSubmit () {
		let { result }     = this.data

		let tigerArr       = [4, 9, 13, 17, 23, 29]
		let peacockArr     = [2, 5, 12, 19, 21, 28]
		let koalaArr       = [1, 7, 14, 16, 24, 27]
		let owlArr         = [0, 6, 10, 15, 20, 25]
		let chameleonArr   = [3, 8, 11, 18, 22, 26]

		let tigerScore     = 0
		let peacockScore   = 0
		let koalaScore     = 0
		let owlScore       = 0
		let chameleonScore = 0

		result =  util.duplicate(result)

		result.forEach(item => {
			let iKey = parseInt(Object.keys(item))

			if (tigerArr.includes(iKey)) {
				tigerScore += parseInt(item[Object.keys(item)[0]])
			} else if (peacockArr.includes(iKey)) {
				peacockScore += parseInt(item[Object.keys(item)[0]])
			} else if (koalaArr.includes(iKey)) {
				koalaScore += parseInt(item[Object.keys(item)[0]])
			} else if (owlArr.includes(iKey)) {
				owlScore += parseInt(item[Object.keys(item)[0]])
			} else if (chameleonArr.includes(iKey)) {
				chameleonScore += parseInt(item[Object.keys(item)[0]])
			}
		})

		let scores = [tigerScore, peacockScore, koalaScore, owlScore, chameleonScore]
		let flags  = ['tiger', 'peacock', 'koala', 'owl', 'chameleon']
		let max    = Math.max(tigerScore, peacockScore, koalaScore, owlScore, chameleonScore)
		let resultFlag

		scores.forEach((item, index) => {
			if (max === item) {
				resultFlag = flags[index]
			}
		})

		let data = {}

		Object.assign(data, {answer: this.arrayToObj(result)})

		app.post('finish', data)
			.then(res => {
				console.log('submit-res', res)
			})

		wx.redirectTo({url: `/pages/result/index?flag=${resultFlag}`})
	}
})
