/*
* @Author: Alan
* @Date:   2017-05-04 22:11:11
* @Last Modified by:  Alan
* @Last Modified time: 2017-05-07 17:31:10
*/

'use strict';

var fs = require('fs');
var xml2js = require('xml2js');
var Promise = require('bluebird');

module.exports = {
	getNow: function () {
		return (new Date().getTime());	
	},
	readFileAsync: function (fpath, encoding) {
		return new Promise(function (resolve, reject) {
			fs.readFile(fpath, encoding, function (err, cont) {
				if (err) reject(err);
				else {
					// cont = JSON.parse(cont);
					resolve(cont);
				}
			})
		})
	},
	writeFileAsync: function (fpath, cont) {
		return new Promise(function (resolve, reject) {
			cont = JSON.stringify(cont);

			fs.writeFile(fpath, cont, function (err) {
				if (err) reject(err);
				else resolve();
			})
		})
	},
	parseXMLAsync:function (xml) {
		return new Promise(function (resolve, reject) {
			xml2js.parseString(xml, {trim: true}, function (err, cont) {
				if (err) reject(err);
				else resolve(cont);
			})
		})
	},
	formatMessage:function (xml) {
		return _formatMessage(xml)
	}
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

