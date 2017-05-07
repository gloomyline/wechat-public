/*
 * @Author: Alan
 * @Date:   2017-04-27 23:45:05
 * @Last Modified by:   Alan
 * @Last Modified time: 2017-05-05 11:15:54
 */

'use strict';

var Koa = require('koa');
// var sha1 = require('koa');
var env = require('./configs/env');
var authen = require('./configs/authentication');
var wechat = authen.WECHAT;
var server = env.SERVER;
var generator = require('./wechat/generator');
var authenticate = generator.weChatAuthenticate

var app = new Koa()

app.use(authenticate(wechat))

app.listen(server.port)
console.log('listening' + server.hostname + ':' + server.port)