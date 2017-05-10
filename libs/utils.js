/*
* @Author: Alan
* @Date:   2017-05-04 22:11:11
* @Last Modified by:  Alan
* @Last Modified time: 2017-05-10 02:34:19
*/

'use strict';

var fs = require('fs');

// var tpl = require('../tpls/passiveReply');

module.exports = {
	getNow: function () {
		return _getNow();	
	},
	readFileAsync: function (fpath, encoding) {
		return new Promise(function (resolve, reject) {
			fs.readFile(fpath, encoding, function (err, cont) {
				if (err) reject(err);
				else resolve(cont);
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
	}
}

/**
 * 获取当前时间
 * @Author   Alan
 * @DateTime 2017-05-08
 * @return   {[Number]}   当前时间戳
 */
function _getNow() {
	return (new Date().getTime());
}




