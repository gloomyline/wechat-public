/*
 * @Author: Alan
 * @Date:   2017-05-04 00:59:28
 * @Last Modified by:   Alan
 * @Last Modified time: 2017-05-10 03:55:21
 */

'use strict';

var sha1 = require('sha1');
var getRawBody = require('raw-body');
var _util = require('util')
var WeChat = require('./WeChat')
var util = require('./util');

module.exports = function (opts, handler) {
	var weChat = new WeChat(opts)

	return function* (next) {
		var that = this;
		var token = opts.token;
		var signature = this.query.signature;
		var timestamp = this.query.timestamp;
		var nonce = this.query.nonce;
		var echostr = this.query.echostr;

		var _str = Array(token, timestamp, nonce).sort().join('');
		var shaStr = sha1(_str);

		if (this.method === 'GET') {
			if (shaStr === signature) {
				this.body = echostr + '';
			} else {
				this.body = 'wrong';
			}
		}
		else if (this.method === 'POST') {
			if (shaStr !== signature) {
				this.body = 'wrong';

				return false
			} 

			var data = yield getRawBody(this.req, { // wechat server POST 的数据设置
				length: this.length,
				limit: '1mb',
				encoding: this.charset
			})

			var content = yield util.parseXMLAsync(data);

			var message = util.formatMessage(content.xml);

			_util.log(message);

			this.weixin = message;
			 
			yield handler.call(this, next)

			weChat.reply.call(this) 
		}

	}
}
