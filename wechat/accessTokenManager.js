/*
* @Author: Alan
* @Date:   2017-05-05 11:37:37
* @Last Modified by:  Alan
* @Last Modified time: 2017-05-07 16:52:22
*/

'use strict';
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var accessTokenUpdate = require('../configs/api').AccessTokenUpdate;

function AccessToken(args){
	this.appID = args.appID;
	this.appSecret = args.appSecret;
	this.token = args.token;
	this.getAccessToken = args.getAccessToken;
	this.saveAccessToken = args.saveAccessToken;

	this.init();
}

AccessToken.prototype.init = function () {
	var that = this;
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
		})
}

AccessToken.prototype.isValidAccessToken = function (data) {
	if (!data || !data.access_token || !data.expires_in) return false;

	var access_token = data.access_token;
	var expires_in = data.expires_in;
	var now = (new Date().getTime());
	if(now <expires_in) return true;
	else return false;
}

AccessToken.prototype.updateAccessToken = function () {
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

// module.exports = {
// 	AccessToken: AccessToken
// }

module.exports.AccessToken = function (args) {
	return new AccessToken(args)
}
