/*
* @Author: Alan
* @Date:   2017-05-10 02:43:11
* @Last Modified by:  Alan
* @Last Modified time: 2017-05-17 18:07:52
*/

'use strict';

var fs = require('fs')
var Promise = require('bluebird')
var readFile = Promise.promisify(fs.readFile)

var config = require('../configs/authentication')
var menuType = require('../configs/enum').MENU
var menu = require('../configs/menu')

var WeChat = require('./WeChat')
var wechatApi = new WeChat(config.WECHAT)



// 自定义菜单创建
// wechatApi.customerMenu(menuType.DELETE.id) 						// 初始化菜单设置
// 	.then(function () {
// 		return wechatApi.customerMenu(menuType.CREATE.id, menu) // 创建自定义菜单
// 	})
// 	.then(function (msg) {
// 		console.log(msg)
// 	})

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

		if (/help || 帮助/.test(content)) {
			var _data = yield (new Promise(function (resolve, reject) {
				readFile(__dirname + '/../configs/replyHelper.txt', {encoding: 'utf-8', flag: 'r'})
					.then(function (data) {
						if (data) {
							resolve(data.toString())
						}
					})
					.catch(function (err) {
						reject(err)
					}) 
			}))
			reply = _data
		}

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
		else if (content === '10') { // 查看永久素材列表
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
		else if (/^(11)\.*/.test(content) && content.match(/^(11)\.*/)[1] === '11') { // 创建标签
			if (tagName) {
				var tagName = content.match(/^(11)\.([\w\u4e00-\u9fa5]+)/)[2]
				var data = yield wechatApi.createTag(tagName)
				var replyTpl = 'You create the tag named %s successfully!'
				reply = replyTpl.replace('%s', data.tag.name)
			}else{
				reply = 'Please Give the Tag Name!'
			}
		}
		else if (content === '12') {
			var tagList = yield wechatApi.getTags()
			console.log(tagList.tags);
			reply = JSON.stringify(tagList.tags)
		}
		else if (content === '13') {
			var tag = yield wechatApi.createTag('Wechat')
			console.log('new tag wechat:', tag)

			var tagList = yield wechatApi.getTags()
			console.log('tag list: ', tagList)

			var selfId = [message.FromUserName]
			var tags = tagList.tags
			var batchTaggingSelf = yield wechatApi.batchTagging(selfId, tags[tags.length - 1].id)

			var tagsSelf = yield wechatApi.getIdList(message.FromUserName)
			console.log('self tag list: ', tagsSelf)

			reply = 'Tag End!'
 		}
 		else if (content === '14') {
 			var user = yield wechatApi.getUserInfo(message.FromUserName) 
 			console.log('user:', user)

 			var openIds = [{openid: message.FromUserName, lang: 'en'}]
 			var users = yield wechatApi.getUserInfo(openIds)
 			console.log('users:', users)

 			reply = JSON.stringify(user)
 		}
 		else if (content === '15') {
 			var userList = yield wechatApi.getUsersList()
 			console.log('user_list:', userList)

 			reply = JSON.stringify(userList)
 		}
 		else if (content === '16') {
 			// 自定义菜单创建
			wechatApi.customerMenu(menuType.DELETE.id) 						// 初始化菜单设置
				.then(function () {
					return wechatApi.customerMenu(menuType.CREATE.id, menu) // 创建自定义菜单
				})
				.then(function (msg) {
					console.log(msg)
				})
 		}

		this.body = reply
	}	

	yield next
}
