/*
 * @Author: Alan
 * @Date:   2017-04-27 23:45:05
 * @Last Modified by:   Alan
 * @Last Modified time: 2017-05-10 09:48:55
 */

'use strict';

var Koa = require('koa');
// var sha1 = require('koa');
var env = require('./configs/env');
var authen = require('./configs/authentication');
var _wechat = authen.WECHAT;
var server = env.SERVER;
var weixin = require('./weChat/weixin')
var wechat = require('./wechat/generator')

var app = new Koa()

app.use(wechat(_wechat, weixin.reply))

app.listen(server.port);
console.log('listening' + server.hostname + ':' + server.port);