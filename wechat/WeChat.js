/*
* @Author: Alan
* @Date:   2017-05-05 11:37:37
* @Last Modified by:  Alan
* @Last Modified time: 2017-05-09 17:37:25
*/

'use strict';
var fs = require('fs')
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var weChatApi = require('../configs/api')
var accessTokenUpdate = weChatApi.AccessTokenUpdate;
var uploadTemFiles = weChatApi.UploadTemFiles

function WeChat(args){
	this.appID = args.appID;
	this.appSecret = args.appSecret;
	this.token = args.token;
	this.getAccessToken = args.getAccessToken;
	this.saveAccessToken = args.saveAccessToken;

	this.init();
}

WeChat.prototype.init = function () {
	var that = this;
	// this.getAccessToken()
	// 	.then(function(data) {
	// 		try{
	// 			data = JSON.parse(data);
	// 		}catch(e) {
	// 			return that.updateAccessToken();
	// 		}

	// 		if (that.isValidAccessToken(data)){
	// 			return Promise.resolve(data);
	// 		}else{
	// 			return that.updateAccessToken();
	// 		}
	// 	})
	// 	.then(function(data) {
	// 		that.access_token = data.access_token;
	// 		that.expires_in = data.expires_in;

	// 		that.saveAccessToken(data)
	// 	})

	this.fetchAccessToken()
}

WeChat.prototype.fetchAccessToken = function () {
	var that = this
	if (this.access_token && this.expires_in) {
		if (this.isValidAccessToken(this)) {
			return Promise.resolve(this)
		}
	}

	this.getAccessToken()
		.then(function(data) {
			try{
				data = JSON.parse(data);
			}catch(e) {
				return that.updateAccessToken();
			}

			if (that.isValidAccessToken(data)){
				return Promise.resolve(data);
			}else{
				return that.updateAccessToken();
			}
		})
		.then(function(data) {
			that.access_token = data.access_token;
			that.expires_in = data.expires_in;

			that.saveAccessToken(data)

			return Promise.resolve(data)
		})

}

WeChat.prototype.isValidAccessToken = function (data) {
	if (!data || !data.access_token || !data.expires_in) return false;

	var access_token = data.access_token;
	var expires_in = data.expires_in;
	var now = (new Date().getTime());
	if(now < expires_in) return true;
	else return false;
}

WeChat.prototype.updateAccessToken = function () {
	var appID = this.appID;
	var appSecret = this.appSecret;
	var url = accessTokenUpdate + '&appid='+ appID +'&secret=' + appSecret;

	return new Promise(function (resolve, reject) {
		request({url: url, json: true})
			.then(function (res) {
				// console.log('res from server:', res)
				var data = res.body; 	//获取微信返回的 JSON 数据包中包含 access_token 和 expires_in 的jSON数据
				var now = (new Date().getTime());
				var expires_in = now + (data.expires_in - 20) * 1000; //凭证有效时间 expires_in, 单位: 秒, 考虑网络延迟、服务器计算时间等，延迟20秒更新

				data.expires_in = expires_in;

				resolve(data)
			})	
	})
}

WeChat.prototype.uploadMaterial = function (type, filepath) {
	var that = this
	var formData = {
		media: fs.createReadStream(filepath)
	}

	return new Promise(function (resolve, reject) {
		that.fetchAccessToken()
			.then(function (data) {
				var url = uploadTemFiles + '?access_token=' + data.access_token + '&type=' + type
				request({url: url, method: 'POST', formData: formData, json: true})
					.then(function (res) {
						var _data = res.body; 	//获取微信返回的 JSON 数据包中包含 access_token 和 expires_in 的jSON数据

						if (_data) {
							resolve(_data)
						}else{
							throw new Error('Upload Material Fails!')
						}

					})
					.catch(function (err) {
						reject(err)
					})
			})
			
	})
}

var weChat // 保存 WeChat 实例

module.exports.WeChat = function (args) {
	if (!!weChat) {
		return weChat
	}else{
		if (args) {
			weChat = new WeChat(args)
			console.log(weChat)
			return weChat
		}else{
			return function () {
				
			}
		}
	}
}