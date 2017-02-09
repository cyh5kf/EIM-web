import {compile} from '../../utils/schema';

export const InvitationResultSchema = compile([{
    'email' : 'string',
	'status' : 'number',
	'avatar' : 'string',
	'username' : 'string | maybeSourceKey: "userName"',
	'byuid' : 'string | maybeSourceKey: "byUid"',
	'gmtcreate' : 'number | maybeSourceKey: "createTime"',
	__options: {
		notRequired: ['avatar']
	}
}]);

export const InvitationSchema = compile({
    total: 'number',
    items: InvitationResultSchema,
	__options: {
		title: 'InvitationSchema',
        notRequired: ['items','total']
	}
})
