/*
* @Author: Alan
* @Date:   2017-05-04 21:31:52
* @Last Modified by:  Alan
* @Last Modified time: 2017-05-11 10:05:56
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
		list: urlPrefix + 'material/batchget_materia'			// 素材列表
	},
	tag: {													// 用户管理
		create: urlPrefix + 'tags/create',						// 创建标签
		get: urlPrefix + 'tags/get',							// 获取标签列表
		update: urlPrefix + 'tags/update',						// 编辑标签
		delete: urlPrefix + 'tags/delete',						// 删除标签
		getUsers: urlPrefix + 'user/tag/get', 					// 获取标签下用户列表
		batchTagging: urlPrefix + 'tags/members/batchtagging',	// 批量为用户打标签
		batchUntagging: urlPrefix + 'tags/members/batchuntagging', // 批量为用户取消标签
		getIdList: urlPrefix + 'tags/getidlist' 				// 获取用户的标签列表
	}
}