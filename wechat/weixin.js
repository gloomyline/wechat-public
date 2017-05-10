/*
* @Author: Alan
* @Date:   2017-05-10 02:43:11
* @Last Modified by:  Alan
* @Last Modified time: 2017-05-10 17:45:29
*/

'use strict';

var config = require('../configs/authentication')
var WeChat = require('./WeChat')
var wechatApi = new WeChat(config.WECHAT)

exports.reply = function* (next) {
	var message = this.weixin

	if (message.MsgType === 'event') {
		if (message.Event === 'subscribe') {
			if (message.EventKey) {
				console.log('subscribe by scaned the Two-dimensional code' 
					+ message.EventKey + ' ' + message.Ticket)
			}

			this.body = "Welcome to Alan's public service\r\n"
		}else if (message.Event === 'unsubscribe') {
			console.log('canceled attention success')
			this.body = ''
		}else if (message.Event === 'LOCATION') {
			this.body = 'your location is:' 
				+ message.Latitude + '/' + message.Longitude + '-' + message.Precision
		}else if (message.Event === 'CLICK') {
			this.body = 'you have clicked the menu' + message.EventKey
		}else if (message.Event === 'SCAN') {
			console.log('scan the Two-dimensional code after subscribe this service' 
				+ message.EventKey + ' ' + message.Ticket)
			this.body = 'You have scaned the Two-dimensional code'
		}else if (message.Event === 'VIEW') {
			this.body = 'You have clicked the link in the menu' + message.EventKey // EventKey link的Url
		}
	}else if (message.MsgType === 'text') {
		var content = message.Content
		var reply = 'What you have said ' + message.Content + ' is too complex, I cannot answer you'  

		if (content === '1') reply = 'Programming'
		else if (content === '2') reply = 'Reading'
		else if (content === '3') reply = 'Gaming'
		else if (content === '4') { // 回复图文
			reply = [
				{
					title: "Repositories of Alan on github",
					description: 'This is the link repositories of Alan',
					picUrl: 'https://avatars0.githubusercontent.com/u/19768601?v=3&u=06c6c351db8be3f754422c1c753d7e3a7e3b8b40&s=400',
					url: 'https://github.com/settings/profile'
				},
				{
					title: "Node",
					description: 'This is the official Node web',
					picUrl: 'https://nodejs.org/static/images/interactive/nodejs-interactive.png',
					url: 'https://nodejs.org/zh-cn/'
				}
			]
		}
		else if (content === '5') {	// 回复图片
			var data = yield wechatApi.uploadMaterial('image', __dirname + '/../assets/images/1.jpg')
			reply = {
				type: 'image',
				media_id: data.media_id
			}
		}
		else if (content === '6') { // 回复视频
			var data = yield wechatApi.uploadMaterial('video', __dirname + '/../assets/videos/1.mp4')
			reply = {
				type: 'video',
				title: 'street basketball prevue',
				description: 'short prevue of street basketball',
				media_id: data.media_id
			}
		}
		else if (content === '7') { // 回复永久图片素材
			var data = yield wechatApi.uploadMaterial('image', __dirname + '/../assets/images/1.jpg', {type: 'image'})
			reply = {
				type: 'image',
				media_id: data.media_id
			}
		}
		else if (content === '8') { // 回复永久视频素材
			var data = yield wechatApi.uploadMaterial('video', __dirname + '/../assets/videos/1.mp4', 
					{
						type: 'video', 
						description: '{"title": "prevue", "introduction": "street basketball prevue"}'
					})

			reply = {
				type: 'video',
				title: 'street basketball prevue',
				description: 'short prevue of street basketball',
				media_id: data.media_id
			}
		}
		else if (content === '9') { // 回复视频素材下载Url
			var picData = yield wechatApi.uploadMaterial('iamge', __dirname + '/../assets/images/2.jpg', {})
			var media = {
				articles: [
					{
						title: 'gloomyline',
						thumb_media_id: picData.media_id,
				       	author: 'Alan',
				       	digest: 'No digest',
				       	show_cover_pic: 1,
				       	content: 'No content',
				       	content_source_url: 'https://github.com'
					}
				]
			}

			var data = yield wechatApi.uploadMaterial('news', media, {})
			data = yield wechatApi.downloadMaterial('news', data.media_id, {})

			console.log(data)

			var items = data.news_item
			var news = []
			items.forEach(function (item) {
				news.push({
					title: item.title,
					description: item.digest,
					picUrl: picData.url,
					url: item.url
				})
			})

			reply = news
		}
		else if (content === '10') {
			var count = yield wechatApi.getMaterialCount()

			console.log(JSON.stringify(count))

			var list1 = yield wechatApi.getMaterialList({
				type: 'image',
				offset: 0,
				count: 10
			})

			var list2 = yield wechatApi.getMaterialList({
				type: 'video',
				offset: 0,
				count: 10
			})

			var list3 = yield wechatApi.getMaterialList({
				type: 'voice',
				offset: 0,
				count: 10
			})

			var list4 = yield wechatApi.getMaterialList({
				type: 'news',
				offset: 0,
				count: 10
			})

			reply = JSON.stringify({
				image: list1,
				video: list2,
				voice: list3,
				news: list4
			})
		}

		this.body = reply
	}	

	yield next
}
