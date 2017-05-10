/*
* @Author: Alan
* @Date:   2017-05-10 02:23:21
* @Last Modified by:  Alan
* @Last Modified time: 2017-05-10 03:31:42
*/

'use strict';
var xml2js = require('xml2js')
var Promise = require('bluebird')
var utils = require('../libs/utils')
var tpls = require('./tpls')

exports.parseXMLAsync = function (xml) {
	return new Promise(function (resolve, reject) {
		xml2js.parseString(xml, {trim: true}, function (err, cont) {
			if (err) reject(err);
			else resolve(cont);
		})
	})
}

exports.formatMessage = function (xml) {
	return _formatMessage(xml)
}

exports.tpl = function (content, message) {
	var info = {};
	var type = 'text';
	var fromUserName = message.FromUserName;
	var toUserName = message.ToUserName

	if (Array.isArray(content)) {
		type = 'news';
	}

	type = content.type || type;
	info.content = content;
	info.toUserName = toUserName;
	info.fromUserName = fromUserName;
	info.msgType = type;
	info.createTime = utils.getNow();

	return tpls.compiled(info)
}

/**
 * 格式化 XML 转换成 JSON 的数据，去除 value 中单成员数组
 * @Author   Alan
 * @DateTime 2017-05-07
 * @param    {[any]}   result  xml2js 转换后的伪 JSON 数据
 * @return   {[json]}          
 */
function _formatMessage(result) {
	var message = {}

	if (typeof result === 'object') {

		for (var key in result) {
			var item = result[key];
			if (!(item instanceof Array) || item.length === 0){
				continue;
			}

			if (item.length === 1) {
				var val = item[0];
				if(typeof val === 'object') {
					message[key] = _formatMessage(val);
				}
				else{
					message[key] = (val || '').trim();
				}
			}
			else {
				message[key] = [];
				for (var i = 0, k = item.length; i < k;i++) {
					message[key].push(_formatMessage(item[i]))
				}
			}
			
		}
	}

	return message
}