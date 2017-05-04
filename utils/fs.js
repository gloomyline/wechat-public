/*
* @Author: Alan
* @Date:   2017-05-04 22:11:11
* @Last Modified by:  Alan
* @Last Modified time: 2017-05-04 22:26:23
*/

'use strict';

var fs = require('fs');
var Promise = require('bluebird');

module.exports = {
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
			fs.writeFile(fpath, cont, function (err) {
				if (err) reject(err);
				else resolve();
			})
		})
	}
}