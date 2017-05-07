/*
 * @Author: Alan
 * @Date:   2017-05-04 00:59:28
 * @Last Modified by:   Alan
 * @Last Modified time: 2017-05-07 17:37:06
 */

'use strict';

// var authen = require('../configs/authentication');
// var wechat = authen.WECHAT;
var sha1 = require('sha1');
var getRawBody = require('raw-body');
var AccessToken = require('./accessTokenManager').AccessToken;
var utils = require('../libs/utils');

module.exports = {
	weChatAuthenticate: function(opts) {
		var accessToken = new AccessToken(opts);

		return function*() {
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

				var content = yield utils.parseXMLAsync(data);

				var message = utils.formatMessage(content.xml);

				console.log('formated wechat user\'s message', message);

				if (message.MsgType === 'event') {
					if (message.Event === 'subscribe') {
						// var now = (new Date().getTIme());
						var reply = '<xml>'
							'<ToUserName><![CDATA[' + message.FromUserName + ']]></ToUserName>' +
							'<FromUserName><![CDATA[' + message.ToUserName + ']]></FromUserName>' +
							'<CreateTime>' + utils.getNow() + '</CreateTime>' +
							'<MsgType><![CDATA[text]]></MsgType>' +
							'<Content><![CDATA[' + 'This is automatic reply2!' + ']]></Content>' +
							'</xml>'
						console.log('public services response:', reply);

						that.status = 200;
						that.type = 'application/xml';
						that.body = reply;

						return;
					}

				}
				else if(message.MsgType === 'text') {
					var reply = '<xml>' +
						'<ToUserName><![CDATA[' + message.FromUserName + ']]></ToUserName>' +
						'<FromUserName><![CDATA[' + message.ToUserName + ']]></FromUserName>' +
						'<CreateTime>' + utils.getNow() + '</CreateTime>' +
						'<MsgType><![CDATA[text]]></MsgType>' +
						'<Content><![CDATA[' + 'This is automatic reply2!' + ']]></Content>' +
						'</xml>'
					console.log('public services response:', reply);

					that.status = 200;
					that.type = 'application/xml';
					that.body = reply;

					return;
				}
			}

		}
	}
}