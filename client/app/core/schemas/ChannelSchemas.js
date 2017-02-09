import {compile, compileEnum} from '../../utils/schema';
import {TeamMemberListSchema, TeamMemberSchema} from './TeamMembersSchema';
import EnumEventType from '../enums/EnumEventType';
import EnumSessionType from '../enums/EnumSessionType';

const LastMsgInfoCommonSrc = {
    msgsrvtime: 'number',
    sendername: 'string'
};
const LastMsgInfoSchema = compile({
    __compiled: true,
    title: 'LastMsgInfoSchema',
    anyOf: [compile({
        ...LastMsgInfoCommonSrc,
        eventtype: compileEnum([EnumEventType.TextMsg]),
        text: 'string'
    }), compile({
        ...LastMsgInfoCommonSrc,
        eventtype: compileEnum([EnumEventType.FileMsg])
    })]
});


const commonSessionSrc = {
        sessionid: 'string',
        sessiontype: 'number',
        displayname: 'string',

        issticky: 'boolean | default: false',
        open: 'boolean | default: true',
        hasMoreBackwardMsgs: 'boolean | default: true',
        hasMoreForwardMsgs: 'boolean | default: false',
        newMsgCount: 'number | default: 0',
        lastMessage: LastMsgInfoSchema,
        unreadMsgFromUUID: 'string',

        __options: {
            notRequired: [
                'lastMessage',
                'unreadMsgFromUUID'
            ]
        }
    },
    commonGroupChatSrc = {
        sessiontype: compileEnum([EnumSessionType.Channel]),
        isdefault: 'boolean',
        ispublic: 'boolean'
    },

    P2PSessionSchema = compile({
        ...commonSessionSrc,
        sessiontype: compileEnum([EnumSessionType.P2P])
    }),
    GroupChatSimpleSchema = compile({
        ...commonSessionSrc,
        ...commonGroupChatSrc,
        isDetailPulled: compileEnum([false])
    }),
    GroupChatDetailSchema = compile({
        ...commonSessionSrc,
        ...commonGroupChatSrc,
        isDetailPulled: compileEnum([true]),
        members: TeamMemberListSchema,
        owner: TeamMemberSchema,
        topic: 'string',
        purpose: 'string',
        createtime: 'number'
    });

export const ChannelSchema = compile({
    __compiled: true,
    title: 'ChannelSchema',
    anyOf: [
        P2PSessionSchema,
        GroupChatSimpleSchema,
        GroupChatDetailSchema
    ]
});

export const ChannelListSchema = compile([ChannelSchema]);
