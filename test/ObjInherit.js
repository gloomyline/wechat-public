/*
* @Author: Alan
* @Date:   2017-05-09 09:50:42
* @Last Modified by:  Alan
* @Last Modified time: 2017-05-09 10:23:17
*/

'use strict';
var util = require('util');
var inherit = util.inherits;

var Human = function (name) {
	this.name = name;
}

Human.prototype.getName = function () {
	return this.name;
}

var Man = function (name, gender) {
	this.name = name;
	this.gender = gender;
}

inherit(Man, Human);

var human = new Human('Chinese');
var man = new Man('Alan', 'Male');

util.log(human.getName(), '\n', man.getName());


