/*
* @Author: Alan
* @Date:   2017-05-05 11:37:37
* @Last Modified by:  Alan
* @Last Modified time: 2017-05-12 16:56:39
*/

'use strict';
var fs = require('fs')
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var _ = require('lodash')

var util = require('./util')
var utils = require('../libs/utils')

var weChatApi = require('../configs/api')
var accessTokenUpdate = weChatApi.AccessTokenUpdate;	// 更新 access_token 接口
var temporaryUrls = weChatApi.temporary 				// 临时素材接口
var permanentUrls = weChatApi.permanent 				// 永久素材
var tagUrls = weChatApi.tag 							// 标签

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

/**
 * 请求微信服务器指定的接口
 * @Author   Alan
 * @DateTime 2017-05-12
 * @param    Object   options 
 * 包含url(接口地址)、method(请求方式)、
 * body(若是'POST'请求,所需传输数据)、
 * json 表示传输数据的格式是否是JSON
 * @param    String   err     接口请求返回的数据不存在抛出的错误描述
 * @return   null           
 */
WeChat.prototype.request = function (resolve, reject, options, err) {

	request(options)
		.then(function (res) {
			var data = res.body
			if(data) {
				resolve(data)
			}
			else{
				var err = err || ''
				throw new Error(err)
			}
		})
		.catch(function (_err) {
			reject(_err)
		})
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

WeChat.prototype.createTag = function (name) {
	var that = this
	var formData = {tag: {name: name}}
	var createUrl = tagUrls.create

	return new Promise(function (resolve, reject) {
		that.fetchAccessToken()
			.then(function (data) {
				var url = createUrl + '?access_token=' + data.access_token

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
							throw new Error('Create Tag Fails')
						}
					})
					.catch(function (err) {
						reject(err)
					})
			})
	})
}

WeChat.prototype.getTags = function () {
	var that = this
	var getUrl = tagUrls.get

	return new Promise(function (resolve, reject) {
		that.fetchAccessToken()
			.then(function (data) {
				var url = getUrl + '?access_token=' + data.access_token

				var options = {
					method: 'GET',
					url: url,
					json:true
				}

				request(options)
					.then(function (res) {
						var _data = res.body

						if (_data) {
							resolve(_data)
						}
						else{
							throw new Error('Create Tag Fails')
						}
					})
					.catch(function (err) {
						reject(err)
					})
			})
	})
}

WeChat.prototype.updateTag = function (id, name) {
	var that = this
	var formData = {tag: {id: id, name: name}}
	var updateUrl = tagUrls.update

	return new Promise(function (resolve, reject) {
		that.fetchAccessToken()
			.then(function (data) {
				var url = updateUrl + '?access_token=' + data.access_token

				var options = {
					method: 'POST',
					url: url,
					body: formData,
					json:true
				}

				request(options)
					.then(function (res) {
						var _data = res.body

						/////////////////////
						// _data return    //
						// {         	   //
						//   "errcode":0,  //
						//   "errmsg":"ok" //
						// }               //
						/////////////////////

						if (_data) {
							resolve(_data)
						}
						else{
							throw new Error('Update Tag Fails')
						}
					})
					.catch(function (err) {
						reject(err)
					})
			})
	})
}

WeChat.prototype.deleteTag = function (id) {
	var that = this
	var formData = {tag: {id: id}}
	var deleteUrl = tagUrls.delete

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

						/////////////////////
						// _data return    //
						// {         	   //
						//   "errcode":0,  //
						//   "errmsg":"ok" //
						// }               //
						/////////////////////

						if (_data) {
							resolve(_data)
						}
						else{
							throw new Error('DEL Tag Fails')
						}
					})
					.catch(function (err) {
						reject(err)
					})
			})
	})
}

WeChat.prototype.getTagUsers = function (tagid, next_openid) {
	var that = this

	next_openid = next_openid || ''
	var formData = {tagid: tagid, next_openid: next_openid}
	var getUsersUrl = tagUrls.getUsers

	return new Promise(function (resolve, reject) {
		that.fetchAccessToken()
			.then(function (data) {
				var url = getUsersUrl + '?access_token=' + data.access_token

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
							throw new Error('GetTagUsers Fails')
						}
					})
					.catch(function (err) {
						reject(err)
					})
			})
	})
}

WeChat.prototype.batchTagging = function (openid_list, tagid) {
	var that = this

	openid_list = openid_list || []
	var formData = {openid_list: openid_list, tagid}
	var batchTaggingUrl = tagUrls.batchTagging

	return new Promise(function (resolve, reject) {
		that.fetchAccessToken()
			.then(function (data) {
				var url = batchTaggingUrl + '?access_token=' + data.access_token

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
							throw new Error('BatchTagging Fails')
						}
					})
					.catch(function (err) {
						reject(err)
					})
			})
	})
}

WeChat.prototype.batchUntagging = function (openid_list, tagid) {
	var that = this
	var formData = {tagid: tagid, next_openid: next_openid}
	var batchUntaggingUrl = tagUrls.batchUntagging

	return new Promise(function (resolve, reject) {
		that.fetchAccessToken()
			.then(function (data) {
				var url = batchUntaggingUrl + '?access_token=' + data.access_token

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
							throw new Error('GetTagUsers Fails')
						}
					})
					.catch(function (err) {
						reject(err)
					})
			})
	})
}

WeChat.prototype.getIdList = function (openid) {
	var that = this
	var formData = {openid: openid}
	var getIdListUrl = tagUrls.getIdList

	return new Promise(function (resolve, reject) {
		that.fetchAccessToken()
			.then(function (data) {
				var url = getIdListUrl + '?access_token=' + data.access_token

				var options = {
					method: 'POST',
					url: url,
					body: formData,
					json:true
				}

				request(options)
					.then(function (res) {
						var _data = res.body

						////////////////////////////////////////
						// {                                  //
						//   "tagid_list":[134, 2] //被置上的标签列表 //
						// }                                  //
						////////////////////////////////////////

						if (_data) {
							resolve(_data)
						}
						else{
							throw new Error('GetIdList Fails')
						}
					})
					.catch(function (err) {
						reject(err)
					})
			})
	})
}

/**
 * 设置用户备注名
 * @Author   Alan
 * @DateTime 2017-05-12
 * @param    String   openid    用户Id
 * @param    String   newRemark 用户备注名
 * @return   JSON		微信服务器返回           
 */
WeChat.prototype.setUserRemark = function (openid, newRemark) {
	var that = this
	var formData = {openid: openid, remark: newRemark}

	return new Promise(function (resolve, reject) {
		that.fetchAccessToken()
			.then(function (data) {
				var url = weChatApi.user.remark + '?access_token=' + data.access_token

				var options = {
					method: 'POST',
					url: url,
					body: formData,
					json:true
				}

				that.request(resolve, reject, options, 'Set User Remark Fails')
			})
	})
}

/**
 * 获取用户基本信息
 * @Author   Alan
 * @DateTime 2017-05-12
 * @param    any   userId Array || String Array则是用户列表，String则是单个用户ID
 * @param    String   lang   国家地区语言版本: zh_CN简体, zh_TW繁体, en英语
 * @return   JSON			返回用户基本信息JSON数据包        
 */
WeChat.prototype.getUserInfo = function (userId, lang) {
	var that = this
	var lang = lang || 'zh_CN'

	return new Promise(function (resolve, reject) {
		that.fetchAccessToken()
			.then(function (data) {

				var options = {
					method: 'POST',
					url: '',
					body: '',
					json:true
				}

				if (_.isArray(userId)) { // lodash中判断数组的方法
					options.body = {user_list: userId}
					options.url = weChatApi.user.getUsersInfo + '?access_token=' + data.access_token
				}
				else{
					options.url = weChatApi.user.getUserInfo + '?access_token=' + data.access_token
						+ '&openid=' + userId + '&lang=' + lang
					options.method = 'GET'
					options.body = null
				}

				that.request(resolve, reject, options, 'Get User Infos Fails')
			})
	})
}

/**
 * 获取用户列表
 * @Author   Alan
 * @DateTime 2017-05-12
 * @param    String   next_openid 第一个拉取的OPENID，不填默认从头开始拉取
 * @return   JSON       返回用户基本信息JSON数据包  
 * @example         	{"total":2,"count":2,"data":{"openid":["","OPENID1","OPENID2"]},"next_openid":"NEXT_OPENID"}
 * @Notice 	一次拉取调用最多拉取10000个关注者的OpenID，可通过填写next_openid的值, 通过多次拉取的方式来满足需求
 */
WeChat.prototype.getUsersList = function (next_openid) {
	var that = this
	var next_openid = next_openid || ''
	
	return new Promise(function (resolve, reject) {
		that.fetchAccessToken()
			.then(function (data) {
				var url = wechatApi.user.getUsersList + '&next_openid=' + next_openid
				var options = {
					method: 'GET',
					url: url,
					json:true
				}

				// that.request(resolve, reject, options, 'GET Users List Fails')
				request(options)
					.then(function (res) {
						var data = res.body
						if(data) {
							resolve(data)
						}
						else{
							var err = err || ''
							throw new Error(err)
						}
					})
					.catch(function (_err) {
						reject(_err)
					})
			})
	})
}


// WeChat.prototype.getUsersList = function (next_openid) {
// 	var that = this
// 	var next_openid = next_openid || ''
	
// 	return new Promise(function (resolve, reject) {
// 		that.fetchAccessToken()
// 			.then(function (data) {
// 				var url = wechatApi.user.getUsersList + '&next_openid=' + next_openid
// 				var options = {
// 					method: 'GET',
// 					url: url,
// 					json:true
// 				}

// 				that.request(options, 'GET Users List Fails')
// 			})
// 	})
// }


module.exports = WeChat
