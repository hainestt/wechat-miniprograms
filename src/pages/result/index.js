import regeneratorRuntime from '../../lib/runtime'

const app = getApp()

Page({
	data: {
		result: null,
		flag: '',
		showCanvas: false,
		imgsUrl:  {
			tiger: 'https://cdn.aoscdn.com/img/pdp/header-tiger.png',
			chameleon: 'https://cdn.aoscdn.com/img/pdp/header-chameleon.png',
			koala: 'https://cdn.aoscdn.com/img/pdp/header-koala.png',
			owl: 'https://cdn.aoscdn.com/img/pdp/header-owl.png',
			peacock: 'https://cdn.aoscdn.com/img/pdp/header-peacock.png',
			pdp: 'https://cdn.aoscdn.com/img/pdp/pdp.jpg',
			fingerprint: 'https://cdn.aoscdn.com/img/pdp/fingerprint.png'
		},
		flagTextColor: {
			tiger: '#e35525',
			chameleon: '#678e0c',
			koala: '#3a5ddc',
			owl: '#1e8e25',
			peacock: '#7059ff'
		},
		imgPath: '',
		cWidth: '',
		cHeight: '',
		tempData: '',
		userInfo: wx.getStorageSync('userInfo') || undefined
	},
	onReady (){

	},

	onLoad (query) {
		let flag       = query.flag || 'owl'
		let { result } = this.data

		result = app.testResult[flag]

		this.setData({
			result: result,
			flag: flag
		})
	},
	onShow () {
		wx.showShareMenu({
			withShareTicket: true
		})
	},

	async paintCanvas () {
		let { flag, result, flagTextColor, userInfo, imgsUrl } = this.data

		let imgInfo = await this.getImageInfo()

		this.setData({
			cWidth: app.screenWidth,
			cHeight: app.screenHeight
		})


		let data = Object.create(null)
		Object.assign(data,
			{imgInfo: imgInfo},
			{flag: flag, flagName: result.name, flagTextColor: flagTextColor[flag]},
			{avatarUrl: userInfo.avatarUrl || '', nickName: userInfo.nickName || ''},
			{pdp: imgsUrl.pdp, fingerprint: imgsUrl.fingerprint})

		this.cacheImgInfo(data, res => {
			let drawData = {}

			res.forEach(item => {
				let key = Object.keys(item)[0]
				data[key] = item[key]
				Object.assign(drawData, data)
			})

			this.drawCard(drawData)
		})


	},
	cacheImgInfo (data, cb) {

		let temp = [
			{pdp: data.pdp},
			{fingerprint: data.fingerprint},
			// {avatarUrl: data.avatarUrl}
		]

		!(async () => {
			for (let item of temp) {
				let key = Object.keys(item)
				let url = item[key]
				let imgUrl = await new Promise(resolve => setTimeout(() => {
					wx.getImageInfo({
						src: url,
						success: res => {
							resolve(res.path)
						},
						fail: err => {
							console.error('err', err)
						}
					})
				}, 100))

				item[key] = imgUrl
			}

			cb(temp)
		})()
	},

	drawCard (data) {
		let { pdp, fingerprint } = data
		let gap

		console.log('data', data)

		// return new Promise(resolve => {
			let ctx = wx.createCanvasContext('generateCard')
			let avatorWidth  = 60
			let avatorHeight = 60
			let avatorX = gap = 20
			let avatorY = 20
			let qrCodeWidthAndHeight = 200
			let fingerprintWidthAndHeight = 32

			let resultImgWidth = app.windowWidth - 40
			let resultImgHeight = ((app.windowWidth - 40) * data.imgInfo.height) / data.imgInfo.width


			//绘制图像
			ctx.save()
			ctx.beginPath()
			ctx.arc(avatorWidth / 2 + avatorX, avatorHeight / 2 + avatorY, avatorWidth / 2, Math.PI * 2, false)
			ctx.clip()
			ctx.drawImage(data.avatarUrl, avatorX, avatorY, avatorWidth, avatorHeight)
			ctx.restore()

			// 绘制昵称
			ctx.setFontSize(14)
			ctx.fillText(data.nickName, avatorWidth + avatorX * 1.5, avatorHeight / 2 + avatorY, app.windowWidth / 2)


			// 绘制结果图片
			ctx.drawImage(data.imgInfo.path, gap, avatorHeight + avatorY + gap, resultImgWidth,  resultImgHeight)

			// 绘制结果文字
			ctx.setFontSize(15)
			ctx.setTextAlign('center')
			ctx.setFillStyle('#666666')
			ctx.fillText('动物性格测试结果', app.windowWidth / 2, gap + avatorHeight *2 + resultImgHeight )

			ctx.setFontSize(18)
			ctx.setTextAlign('center')
			ctx.setFillStyle(data.flagTextColor)
			ctx.fillText(data.flagName, app.windowWidth / 2, gap * 2.5 + avatorHeight * 2 + resultImgHeight )

			ctx.moveTo(gap, gap * 3.6 + avatorHeight * 2 + resultImgHeight )
			ctx.lineTo(resultImgWidth, gap * 3.6 + avatorHeight * 2 + resultImgHeight )
			ctx.setStrokeStyle('#e0e0e0')
			ctx.stroke()

			// 绘制二维码
			ctx.drawImage(pdp, app.windowWidth/2 - qrCodeWidthAndHeight/2,  gap * 4.2 + avatorHeight * 2 + resultImgHeight, qrCodeWidthAndHeight, qrCodeWidthAndHeight)

			// 绘制提示文字
			ctx.setFontSize(14)
			ctx.setTextAlign('center')
			ctx.setFillStyle('#666666')
			ctx.fillText('您也来试一下吧', app.windowWidth / 2 + fingerprintWidthAndHeight, gap * 6 + avatorHeight * 2 + resultImgHeight + qrCodeWidthAndHeight )

			// 绘制指纹
			ctx.drawImage(fingerprint, app.windowWidth/2 - fingerprintWidthAndHeight * 2, gap * 4.8 + avatorHeight * 2 + resultImgHeight + qrCodeWidthAndHeight, fingerprintWidthAndHeight, fingerprintWidthAndHeight)

			ctx.draw(true)

			// 保存临时路径
			setTimeout(() => {
				wx.canvasToTempFilePath({
					x: 0,
					y: 0,
					width: app.screenWidth,
					height: app.screenHeight,
					destWidth: app.screenWidth,
					destHeight: app.screenHeight,
					canvasId: 'generateCard',
					fileType: 'jpg',
					quality: 1,
					success: res => {
						this.setData({
							imgPath: res.tempFilePath
						})
					},
					fail: () => {
						console.error('save image error')
					}
				})
			}, 2000)

		// })


	},
	getImageInfo () {
		let { imgsUrl, flag } = this.data

		return new Promise(resolve => {
			wx.getImageInfo({
				src: imgsUrl[flag],
				success: res => {
					resolve(res)
				},
				fail: () => {
					wx.showModal({
						title: '请求失败',
						content: '获取图片信息失败',
						showCancel: false
					})
				}
			})
		})
	},

	handleCreateCard () {

		let { flag }  = this.data

		wx.redirectTo({url: `/pages/card/index?flag=${flag}`})

		// wx.showLoading()
		// this.setData({
		// 	showCanvas: true
		// })

		// setTimeout(()=> {
		// 	let { imgPath } = this.data
		// 	let arrList = new Array(imgPath)
		// 	wx.previewImage({
		// 		current: imgPath,
		// 		urls: arrList,
		// 		success: () => {
		// 			wx.hideLoading()
		// 		}
		// 	})
		// }, 2000)

	},
	onShareAppMessage () {
		return {
			title: '你是老虎、孔雀、考拉，还是猫头鹰、变色龙？',
			path: `/pages/result/index?flag=${this.data.flag}`,
			imageUrl: '',
			success: (res) => {
				wx.showToast({
					title: '转发成功',
					icon: 'success',
					duration: 2000,
				})
			},
			fail: (err) => {
				if (res.errMsg !== "shareAppMessage:fail cancel") {
					wx.showToast({
						title: '转发失败',
						icon: 'warn',
						duration: 2000,
					})
				}
			}
		}
	}
})
