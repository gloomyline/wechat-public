/*
* @Author: Alan
* @Date:   2017-05-05 11:37:37
* @Last Modified by:  Alan
* @Last Modified time: 2017-05-10 17:17:24
*/

'use strict';
var fs = require('fs')
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var _ = require('lodash')

var util = require('./util')
var utils = require('../libs/utils')

var weChatApi = require('../configs/api')
var accessTokenUpdate = weChatApi.AccessTokenUpdate;
var temporaryUrls = weChatApi.temporary
var permanentUrls = weChatApi.permanent

function WeChat(args){
	this.appID = args.appID;
	this.appSecret = args.appSecret;
	this.token = args.token;
	this.getAccessToken = args.getAccessToken;
	this.saveAccessToken = args.saveAccessToken;

	this.init();
}

WeChat.prototype.init = function () {
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
				var now = utils.getNow();
				var expires_in = now + (data.expires_in - 20) * 1000; //凭证有效时间 expires_in, 单位: 秒, 考虑网络延迟、服务器计算时间等，延迟20秒更新

				data.expires_in = expires_in;

				resolve(data)
			})	
	})
}

WeChat.prototype.reply = function (type, filepath) {
	var content = this.body
	var message = this.weixin
	
	var xml = util.tpl(content, message)

	this.status = 200
	this.type = 'application/xml'
	this.body = xml
}

WeChat.prototype.getMaterialCount = function () {
	var that = this
	var getCountUrl = permanentUrls.count

	return new Promise(function (resolve, reject) {
		that.fetchAccessToken()
			.then(function (data) {
				var url = getCountUrl + '?access_token=' + data.access_token

				request({url: url, method: 'GET', json:true})
					.then(function (res) {
						var _data = res.body

						if (_data) {
							resolve(_data)
						}
						else{
							throw new Error('Get Material Count Fails')
						}
					})
					.catch(function (err) {
						reject(err)
					})
			})	
	})
}

WeChat.prototype.getMaterialList = function (options) {
	var that = this

	options.type = options.type || 'image'
	options.offset = options.offset || 0
	options.count = options.count || 1

	var getMaterialListUrl = permanentUrls.list

	return new Promise(function (resolve, reject) {
		that.fetchAccessToken()
			.then(function (data) {
				var url = getMaterialListUrl + '?access_token=' + data.access_token

				request({url: url, method: 'POST', body: options, json:true})
					.then(function (res) {
						var _data = res.body
						if (_data) {
							resolve(_data)
						}
						else{
							throw new Error('Get Material List Fails')
						}
					})
					.catch(function (err) {
						reject(err)
					})
			})
	})
}

WeChat.prototype.uploadMaterial = function (type, material, permanent) {
	var that = this
	var formData = {}
	var uploadUrl = temporaryUrls.upload

	if (permanent) {
		uploadUrl = permanentUrls.upload

		_.extend(formData, permanent)
	}

	if (type === 'pic') {
		uploadUrl = permanentUrls.uploadNewsPic
	}

	if (type === 'news') {
		uploadUrl = permanentUrls.uploadNews
		formData = material
	}else {
		formData.media = fs.createReadStream(material)
	}

	return new Promise(function (resolve, reject) {
		that.fetchAccessToken()
			.then(function (data) {
				var url = uploadUrl + '?access_token=' + data.access_token
				
				if (!permanent) {
					url += '&type=' + type
				}else{
					formData.access_token = data.access_token
				}

				var options = {
					method: 'POST',
					url: url,
					json: true
				}

				if (type === 'news') {
					options.body = formData
				}else{
					options.formData = formData
				}

				// request({url: url, method: 'POST', formData: formData, json: true})
				request(options)
					.then(function (res) {
						var _data = res.body; 	//获取微信返回的 JSON 数据包中包含 access_token 和 expires_in 的jSON数据

						if (_data) {
							console.log('permanent res data:', _data)
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

WeChat.prototype.downloadMaterial = function (type, mediaId, permanent) {
	var that = this
	var formData = {}
	var downloadUrl = temporaryUrls.download

	if (permanent) {
		downloadUrl = permanentUrls.download
	}

	return new Promise(function (resolve, reject) {
		that.fetchAccessToken()
			.then(function (data) {
				var url = downloadUrl + '?access_token=' + data.access_token
					
				var options = {method: 'POST', url: url, json: true}

				if (permanent) {
					formData.media_id = mediaId
					formData.access_token =  data.access_token
					options.body = formData
				}
				else{
					if (type === 'video') {
						url = url.replace('https://', 'http://')
					}
					url += '&media_id=' + mediaId
				}


				if (type === 'news' || type === 'video') {
					request(options)
						.then(function (res) {
							var _data = res.body

							if (_data) {
								resolve(_data)
							}
							else{
								throw new Error('Download Material Fails')
							}
						})
						.catch(function (err) {
							reject(err)
						})	
				}
				else{
					resolve(url)
				}
			})
	})
}

WeChat.prototype.updateMaterial = function (mediaId, news) {
	var that = this
	var formData = {media_id: mediaId}
	var updateUrl = permanentUrls.update

	_.extend(formData, news)

	return new Promise(function (resolve, reject) {
		that.fetchAccessToken()
			.then(function (data) {
				var url = updateUrl + '?access_token=' + data.access_token

				var options = {
					method: 'POST',
					url: url,
					body: formData,
					json: true
				}

				// request({url: url, method: 'POST', formData: formData, json: true})
				request(options)
					.then(function (res) {
						var _data = res.body; 	//获取微信返回的 JSON 数据包中包含 access_token 和 expires_in 的jSON数据

						if (_data) {
							resolve(_data)
						}else{
							throw new Error('Update Material Fails!')
						}

					})
					.catch(function (err) {
						reject(err)
					})
			})
			
	})
}

WeChat.prototype.deleteMaterial = function (mediaId) {
	var that = this
	var formData = {media_id: mediaId}
	var deleteUrl = permanentUrls.delete

	return new Promise(function (resolve, reject) {
		that.fetchAccessToken()
			.then(function (data) {
				var url = deleteUrl + '?access_token=' + data.access_token

				var options = {
					method: 'POST',
					url: url,
					body: formData,
					json:true
				}

				request(options)
					.then(function (res) {
						var _data = res.body

						if (_data) {
							resolve(_data)
						}
						else{
							throw new Error('delete material fails')
						}
					})
					.catch(function (err) {
						reject(err)
					})
			})
	})
}

module.exports = WeChat
