import AppDataHandler from '../core/datarequest/AppDataHandlerMixin';
import LocaleConfig from '../core/locale-config/LocaleConfig';
import url from '../core/constants/ApiConfig';

export default {
	logoutAccountApi: function(args) {
		return AppDataHandler.doRequest({
			'body': {
				'smd': 'account.userLogout',
				'uid': args.uid,
				'token': args.rt
			},
			'url': url.rpc
		});
	},
	inviteUserApi: function(args) {
		return AppDataHandler.doRequest({
			'body': {
				'smd': 'account.inviteUser',
				'uid': args.uid,
				'user': args.users,
				'cid': args.cid,
				'msg': args.message,
				'gid': args.gids,
				'langType': LocaleConfig.getLocale() === 'en-US' ? 0 : 1
			},
			'url': url.rpc
		});
	},
	getInviteUserApi: function(args) {
		return AppDataHandler.doRequest({
			'body': {
				'smd': 'account.getInviteUser',
				'uid': args.uid,
				'status': args.status,
				'cid': args.cid,
				'pageNum': args.pagenum,
				'pageSize': args.pagesize,
				'sort': args.sort,
				'key': args.key
			},
			'url': url.rpc
		});
	},
	undoInvitationApi: function(args) {
		return AppDataHandler.doRequest({
			'body': {
				'smd': 'account.undoInviteUser',
				'email': args.email,
				'uid': args.uid,
				'cid': args.cid
			},
			'url': url.rpc
		});
	},
	// getInvitationForUndo: function(args) {
	// 	var dataRequest = new DataRequest({
	// 		ensureRetAsTrue: true,
	// 		'body': {
	// 			'smd': 'account.getInviteUser',
	// 			'uid': args.uid,
	// 			'status': args.status,
	// 			'cid': args.cid,
	// 			'pagenum': args.pagenum,
	// 			'pagesize': args.pagesize
	// 		},
	// 		'url': url.rpc,
	// 		'dataType': 'json'
	// 	});

	// 	return AppDataHandler.doRequest(dataRequest).then(function(response) {
	// 		if (response['ret'] === true) {
	// 			return Promise.resolve(response);
	// 		} else {
	// 			return Promise.reject(response.message);
	// 		}
	// 	});
	// },
	updateProfileApi: function(args) {
		return AppDataHandler.doRequest({
			'body': args,
			'url': url.rpc
		});
	},
	checkUsername: function(args) {
		return AppDataHandler.doRequest({
				'body': {
					'smd': 'userService.checkUsername',
					'username': args.username,
					'cid': args.cid
				},
				'url': url.checkUsername
			})
			.then(() => true);
	},
	checkEmail: function(email) {
		return AppDataHandler.doRequest({
				'body': {
					'smd': 'userService.checkEmail',
					'email': email
				},
				'url': url.checkEmail
			})
			.then(() => true);
	},
	SettingAccountApi: function(args) {
		args['smd'] = 'account.settingAccount';
		return AppDataHandler.doRequest({
				'body': args,
				'url': url.rpc
			})
			.then(() => true);
	},
	// stopAccountApi: function(args, callbacks) {
	// 	AppDataHandler.doRequest({
	// 			'body': args,
	// 			'url': url.rpc
	// 		})
	// 		.then(callbacks.successHandler).catch(callbacks.errorHandler);
	// },
	queryAtMsgApi: function(obj) {
		return AppDataHandler.doRequest({
			'body': {
				'smd': 'msgsync.queryAtMsgList',
				'uid': obj.uid,
				'asc': obj.asc,
				'endTime': obj.endTime,
				'limit': obj.limit
			},
			'url': url.rpc
		});
	}
};