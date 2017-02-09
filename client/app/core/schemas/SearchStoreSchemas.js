import {compile, compileEnum} from '../../utils/schema';
import EnumSearchUserType from '../enums/EnumSearchUserType';

const commonSearchItemSource = {
    id: 'string',
    name: 'string'
};
const UserItemSearchSchema = compile({
    ...commonSearchItemSource,
    userType: compileEnum([EnumSearchUserType.User]),
    logo: 'string',
    firstname:"string",
    lastname:"string",
    mail: 'string',
    creatorname:'string',
    gmtcreate:'number',
    loginstatus: 'number | maybeSourceKey: "signature"' // EnumLoginStatus
});
const ChannelSearchSchema = compile({
    ...commonSearchItemSource,
    userType: compileEnum([EnumSearchUserType.Channel]),
    isdefault: 'boolean',
    ispublic: 'boolean',
    members: [{
        uid: 'string',
        name: 'string',
        logo: 'string'
    }]
});
const OtherSearchSchema = compile({
    ...commonSearchItemSource,
    userType: compileEnum([EnumSearchUserType.ContactGroup])
});

// 搜索用户/群组/会话/微邮 Schema
export const SearchUserSchema = compile({
    __compiled: true,
    title: 'SearchUserSchema',
    anyOf: [
        UserItemSearchSchema,
        ChannelSearchSchema,
        OtherSearchSchema
    ]
});

export const SearchUserListSchema = compile([SearchUserSchema]);

// 搜索消息 Schema
const commonMsgSchemaSource = {
    __options: {
        notRequired: ['sessionName', 'logo' ,'msgTime']
    },
    sessionName: 'string',
    logo: 'string | maybeSourceKey: "senderAvatar"',
    senderName: 'string',
    msgTime: 'number',
    msgId: 'string',
    sessionId: 'string',
    sessionType:  'number'
};
export const TextMsgSchema = compile({
    ...commonMsgSchemaSource,
    msgData: 'string',
    __options: {
        ...commonMsgSchemaSource.__options,
        title: 'TextMsgSchema'
    }
});
export const FileMsgSchema = compile({
    ...commonMsgSchemaSource,
    
    __options: {
        title: 'FileMsgSchema',
        notRequired: ['sessionName', 'logo', 'imgwidth', 'imgheight','msgTime','resourceid'] //当文件发送中和发送失败时, 没有"resourceid"和"gmtcreate(msgTime)"字段
    },
    senderUid: 'string | maybeSourceType: "number"',
    resourceid: 'string | maybeSourceKey: "resourceId" | maybeSourceType: "number"',
    filetype: 'string | maybeSourceKey: "fileType"',
    filesize:'number | maybeSourceKey: "fileSize"',
    fileName: 'string',
    fileUrl: 'string',
    imgwidth: 'number | maybeSourceKey: "imgWidth"',
    imgheight: 'number | maybeSourceKey: "imgHeight"'
});
export const TextMsgListSchema = compile([TextMsgSchema]);
export const FileMsgListSchema = compile([FileMsgSchema]);
export const SearchMessagesSchema = compile({
    texts: TextMsgListSchema,
    textsCount:'number',
    files: FileMsgListSchema,
    filesCount:'number'
});
export const FilterFilesSchema = compile({
    files: FileMsgListSchema
});

