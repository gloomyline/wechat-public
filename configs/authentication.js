/*
 * @Author: Alan
 * @Date:   2017-04-27 23:39:13
 * @Last Modified by:   Alan
 * @Last Modified time: 2017-05-05 10:02:23
 */

'use strict';

var fs = require('../utils/fs');
var path = require('path'); 
var access_token = path.join(__dirname, '/access_token.txt');

module.exports = {
	WECHAT: {
		appID: 'wx43953b13f0544ef3',
		appSecret: '0f70bb75d7943e1229e412a3650bf6ad',
		token: 'wechatpublicproductalanwang',
		getAccessToken: function () {
			return fs.readFileAsync(access_token);
		},
		saveAccessToken: function (data) {
			return fs.writeFileAsync(access_token, data);
		}
	}
}