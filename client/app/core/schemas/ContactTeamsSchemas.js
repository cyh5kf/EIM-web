//import {compile} from '../../utils/schema';
//
//export const ContactSchema = compile({
//    uid: 'string',
//    avatar: 'string',
//    username: 'string',
//    realname: 'string',
//    email: 'string',
//    phone: 'string',
//    did: 'string',
//    cid: 'string',
//    order: 'number'
//});
//
//export const ContactListSchema = compile([ContactSchema]);
//
//export const ContactTeamSchema = compile({
//    __options: {
//        id: 'ContactTeam',
//        notRequired: ['children', 'contacts']
//    },
//    id: 'string',
//    pid: 'string',
//    name: 'string',
//    order: 'number',
//    count: 'number',
//    children: [{
//        __compiled: true,
//        $ref: 'ContactTeam'
//    }],
//    contacts: ContactListSchema
//});
//
//export const ContactTeamShortSchema = compile({
//    id: 'string',
//    name: 'string'
//});
//
//export const ContactTeamShortListSchema = compile([ContactTeamShortSchema]);
