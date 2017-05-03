/*
 * @Author: Alan
 * @Date:   2017-05-04 00:59:28
 * @Last Modified by:   Alan
 * @Last Modified time: 2017-05-04 01:45:40
 */

'use strict';

// var authen = require('../configs/authentication');
// var wechat = authen.WECHAT;
var sha1 = require('sha1');

module.exports = {
	weChatAuthenticate: function(opts) {
		return function*() {
			var token = opts.token;
			var signature = this.query.signature;
			var timestamp = this.query.timestamp;
			var nonce = this.query.nonce;
			var echostr = this.query.echostr;

			var _str = Array(token, timestamp, nonce).sort().join('');
			var shaStr = sha1(_str);

			if (shaStr === signature) {
				this.body = echostr + '';
				console.log('echostr:', echostr)
			} else {
				this.body = 'wrong';
			}
		}
	}
}