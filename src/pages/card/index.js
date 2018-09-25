import regeneratorRuntime from '../../lib/runtime'

const app = getApp()

Page({
	data: {
		result: null,
		flag: '',
		showCanvas: true,
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
	onReady() {
		wx.showLoading({
			title: '正在生成中...'
		})
	},
	onLoad (query) {
		let flag   = query.flag || 'owl'
		let result = app.testResult[flag]

		this.setData({
			result: result,
			flag: flag
		})
	},
	onShow() {
		this.paintCanvas()
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
			// {avatarUrl: data.avatarUrl}  //注意后台配置：https://wx.qlogo.cn downloadFile 合法域名
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

	drawCircleImg (ctx, img, x, y, r) {
		let d = 2 * r
		let cx = x + r
		let cy = y + r

		ctx.save()
		ctx.setGlobalAlpha(0)
		ctx.setFillStyle('white')
		ctx.beginPath()
		ctx.arc(cx, cy, r, 0, 2 * Math.PI)
		ctx.lineTo(cx/2 , cy/2)

		ctx.closePath()
		ctx.fill()

		ctx.clip()
		ctx.setGlobalAlpha(1)

		ctx.drawImage(img, x, y, d, d)
		ctx.restore()
	},
	drawText (ctx, fontsize, text, x, y, textAlign, color) {

		ctx.save()
		ctx.setFontSize(fontsize)
		ctx.setFillStyle(color || 'black')
		ctx.setTextAlign(textAlign || 'left')
		ctx.fillText(text, x, y)
		ctx.restore()

	},
	drawRect (ctx, bgColor, x, y, dx, dy) {
		ctx.save()
		ctx.setFillStyle(bgColor)
		ctx.rect(x, y, dx, dy)
		ctx.fill()
		ctx.restore()
	},
	drawLine(ctx, x,y,dx,dy, color) {
		ctx.save()
		ctx.beginPath()
		ctx.moveTo(x, y )
		ctx.lineTo(dx, dy )
		ctx.setStrokeStyle(color || '#e0e0e0')
		ctx.stroke()
		ctx.closePath()
		ctx.restore()
	},
	drawCard (data) {
		let { pdp, fingerprint, imgInfo, flagName, nickName, flagTextColor } = data
		let gap

		console.log('data', data)

		let ctx = wx.createCanvasContext('generateCard')
		let avatorWidth  = 60
		let avatorHeight = 60
		let avatorX = gap = 20
		let avatorY = 20
		let qrCodeWidthAndHeight = 200
		let fingerprintWidthAndHeight = 32

		let resultImgWidth = app.windowWidth - 40
		let resultImgHeight = ((app.windowWidth - 40) * imgInfo.height) / imgInfo.width

		// 设置背景
		this.drawRect(ctx,'#fff',0, 0 , app.screenWidth, app.screenHeight)

		//绘制图像
		// this.drawCircleImg(ctx, avatarUrl, avatorX, avatorY, 30)

		// 绘制昵称
		this.drawText(ctx, 14, nickName,  avatorWidth + avatorX * 1.5, avatorHeight / 2 + avatorY)

		// 绘制结果图片
		ctx.drawImage(imgInfo.path, gap, avatorHeight + avatorY + gap, resultImgWidth,  resultImgHeight)

		// 绘制结果文字
		this.drawText(ctx, 15, '动物性格测试结果', app.windowWidth / 2, gap + avatorHeight *2 + resultImgHeight, 'center', '#666')
		this.drawText(ctx, 18, flagName, app.windowWidth / 2, gap * 2.5 + avatorHeight * 2 + resultImgHeight, 'center', flagTextColor)

		// 绘制线条
		this.drawLine (ctx, gap, gap * 3.6 + avatorHeight * 2 + resultImgHeight, resultImgWidth, gap * 3.6 + avatorHeight * 2 + resultImgHeight)


		// 绘制二维码
		ctx.drawImage(pdp, app.windowWidth/2 - qrCodeWidthAndHeight/2,  gap * 4.2 + avatorHeight * 2 + resultImgHeight, qrCodeWidthAndHeight, qrCodeWidthAndHeight)

		// 绘制提示文字
		this.drawText(ctx, 14, '您也来试一下吧', app.windowWidth / 2 + fingerprintWidthAndHeight, gap * 6 + avatorHeight * 2 + resultImgHeight + qrCodeWidthAndHeight, 'center', '#666')

		// 绘制指纹
		ctx.drawImage(fingerprint, app.windowWidth/2 - fingerprintWidthAndHeight * 2, gap * 4.8 + avatorHeight * 2 + resultImgHeight + qrCodeWidthAndHeight, fingerprintWidthAndHeight, fingerprintWidthAndHeight)

		ctx.draw()

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
					// this.setData({
					// 	imgPath: res.tempFilePath
					// })

					let imgPath  = res.tempFilePath
					let arrList = new Array(imgPath)

					wx.previewImage({
						current: imgPath,
						urls: arrList,
						success: () => {
							wx.hideLoading()
						}
					})
				},
				fail: () => {
					console.error('save image error')
				}
			})

		}, 2000)

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
	}

})
