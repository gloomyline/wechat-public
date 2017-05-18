/*
* @Author: Alan
* @Date:   2017-05-04 21:31:52
* @Last Modified by:  Alan
* @Last Modified time: 2017-05-18 11:51:42
*/

'use strict';

var urlPrefix = 'https://api.weixin.qq.com/cgi-bin/';

module.exports = {
	AccessTokenUpdate: urlPrefix + 'token?grant_type=client_credential',
	temporary: { // 临时素材
		upload: urlPrefix + 'media/upload',
		download: urlPrefix + 'media/get'
	},
	permanent: { // 永久素材
		upload: urlPrefix + 'material/add_material', 			// 上传其他类型
		download: urlPrefix + 'material/get_material',			// 获取下载链接
		uploadNews: urlPrefix + 'material/add_news', 			// 上传图文素材
		uploadNewsPic: urlPrefix + 'media/uploadimg', 			// 上传图文消息内的图片获取URL 
		delete: urlPrefix + 'material/del_material',			// 删除永久素材
		update: urlPrefix + 'material/update_news',				// 更新永久图文素材
		count: urlPrefix + 'material/get_materialcount',		// 素材总数
		list: urlPrefix + 'material/batchget_material'			// 素材列表
	},
	tag: {														// 标签管理
		create: urlPrefix + 'tags/create',						// 创建标签
		get: urlPrefix + 'tags/get',							// 获取标签列表
		update: urlPrefix + 'tags/update',						// 编辑标签
		delete: urlPrefix + 'tags/delete',						// 删除标签
		getUsers: urlPrefix + 'user/tag/get', 					// 获取标签下用户列表
		batchTagging: urlPrefix + 'tags/members/batchtagging',	// 批量为用户打标签
		batchUntagging: urlPrefix + 'tags/members/batchuntagging', // 批量为用户取消标签
		getIdList: urlPrefix + 'tags/getidlist' 				// 获取用户的标签列表
	},
	user: {														// 用户管理
		remark: urlPrefix + 'user/info/updateremark',			// 设置用户备注 
		getUserInfo: urlPrefix + 'user/info',					// 获取用户基本信息
		getUsersInfo: urlPrefix + 'user/info/batchget',			// 批量获取用户信息
		getUsersList: urlPrefix + 'user/get',					// 获取用户列表	
	},
	mass: {
		tag: urlPrefix + 'message/mass/sendall',				// 根据标签进行群发
		openids: urlPrefix + 'message/mass/send',				// 根据 openid list
		delete: urlPrefix + 'message/mass/delete',				// 删除群发
		preview: urlPrefix + 'message/mass/preview',			// 预览
		getStatus: urlPrefix + 'message/mass/get'				// 查询发送状态
	},
	menu: {
		create: urlPrefix + 'menu/create',						// 创建自定义菜单
		get: urlPrefix + 'menu/get',							// 查询
		delete: urlPrefix + 'menu/delete'						// 删除
	}
}