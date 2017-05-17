/*
* @Author: Alan
* @Date:   2017-05-17 15:24:31
* @Last Modified by:  Alan
* @Last Modified time: 2017-05-17 16:41:58
*/

'use strict';

module.exports = {
	button: [
		{
			name: '点击事件',
			type: 'click',
			key: 'click_event'
		},
		{
			name: '额外功能',
			sub_button: [
				{
					name: '我的代码仓库', 
					type: 'view',
					url: 'https://github.com/gloomyline'
				},
				{
					name: '扫码提示',
					type: 'scancode_waitmsg',
					key: 'scancode_waitmsg'
				},
				{
					name: '扫码推送',
					type: 'scancode_push',
					key: 'scancode_push'
				},
				{
					name: '系统拍照发图',
					type: 'pic_sysphoto',
					key: 'pic_sysphoto'
				},
				{
					name: '微信相册发图',
					type: 'pic_weixin',
					key: 'pic_weixin'
				}
			]
		},
		{
			name: '地理位置',
			type: 'location_select',
			key: 'location_select'
		}
	]
}