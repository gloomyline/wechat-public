/*
* @Author: Alan
* @Date:   2017-05-04 21:31:52
* @Last Modified by:  Alan
* @Last Modified time: 2017-05-04 21:44:05
*/

'use strict';

var urlPrefix = 'https://api.weixin.qq.com/cgi-bin/';

module.exports = {
	AccessTokenUpdate: urlPrefix + 'token?grant_type=client_credential';
}