import {compile} from '../../utils/schema';
import {TeamMemberSchema} from './TeamMembersSchema';

export const GroupMemberSchema = compile({
    guuid: 'string',
    uid: 'string',
    username: 'string',
    firstname:"string",
    lastname:"string",
    avatar: 'string',
    __options: {
        title: 'GroupMemberSchema'
    }
});

export const GroupMemberListSchema = compile([GroupMemberSchema]);

export const ContactGroupSchema = compile({
    guuid : 'string',
    name : 'string',
    desc : 'string',
    count : 'number',
    status: 'string',
    time: 'number',
    username: 'string',
    members: GroupMemberListSchema,
    channel: {
        channelId: 'string',
        ispublic: 'boolean',
        channelCreateTime: 'number',
        channelName: 'string',
        channelCreatorInfo: TeamMemberSchema
    },

    __options: {
        title: 'ContactGroupSchema',
        notRequired: ['channel']
    }
});

export const ContactGroupListSchema = compile([ContactGroupSchema]);
