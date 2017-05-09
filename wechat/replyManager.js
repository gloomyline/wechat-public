/*
* @Author: Alan
* @Date:   2017-05-08 01:08:08
* @Last Modified by:  Alan
* @Last Modified time: 2017-05-09 17:42:25
*/

'use strict';

var wechatApi = require('./WeChat').WeChat()

var Reply = function (args) {
	this.reqType = args.Content;
	this.replyData = '';

	this.init()
}

Reply.prototype.init = function () {
	this.reply()
}

Reply.prototype.reply = function () {
	var that = this
	if (Number(this.reqType) === 1) {
		this.replyData = 'basketball';
	}
	else if(Number(this.reqType) === 2) {
		this.replyData = 'volleyball';
	}
	else if(Number(this.reqType) === 3) {
		this.replyData = 'badmitton';
	}
	else if(Number(this.reqType) === 4) {
		this.replyData = [
			{
				title: 'Movie',
				description: 'This is a test news!',
				picUrl: 'http://img1.gtimg.com/news/pics/hv1/164/208/2207/143563379.jpg',
				url: 'https://github.com/gloomyline'
			}
		];
	}
	else if(Number(this.reqType) === 5) {
		wechatApi.uploadMaterial('image', __dirname + '/assets/images/1.jpg')
			.then(function (data) {

				that.replyData = {
					type: 'image',
					media_id: data.media_id
				}
			})
	}
}

Reply.prototype.doReply = function () {
	return this.replyData
}

module.exports = Reply