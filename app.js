/*
 * @Author: Alan
 * @Date:   2017-04-27 23:45:05
 * @Last Modified by:   Alan
 * @Last Modified time: 2017-05-08 02:19:52
 */

'use strict';

var Koa = require('koa');
// var sha1 = require('koa');
var env = require('./configs/env');
var authen = require('./configs/authentication');
var wechat = authen.WECHAT;
var server = env.SERVER;
var generator = require('./wechat/generator');
var authenticate = generator.weChatAuthenticate;
var replyPassive = generator.weChatReplyPassive;

var app = new Koa();

app.use(authenticate(wechat));

app.use(replyPassive());

app.listen(server.port);
console.log('listening' + server.hostname + ':' + server.port);