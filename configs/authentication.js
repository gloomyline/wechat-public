/*
 * @Author: Alan
 * @Date:   2017-04-27 23:39:13
 * @Last Modified by:   Alan
 * @Last Modified time: 2017-05-04 22:26:51
 */

'use strict';

var fs = require('../utils/fs');
var path = require('path');
var access_token = path.join(__dirname, './config/access_token.txt');

module.exports = {
	WECHAT: {
		appID: 'wx43953b13f0544ef3',
		appscret: '0f70bb75d7943e1229e412a3650bf6ad',
		token: 'wechatpublicproductalanwang',
		getAccessToken: function () {
			return fs.readFileAsync(access_token);
		},
		saveAccessToken: function () {
			return fs.writeFileAsync(access_token);
		}
	}
}