import {compile, compileEnum} from '../../utils/schema';
import EnumEventType from '../enums/EnumEventType';
import {EnumSendingStatus} from '../enums/MessageEnums';

const commonMsgSrc = {
    sessiontype: 'number',
    sessionid: 'string',
    senderavatar: 'string',
    sendername: 'string',
    senderuid: 'string | maybeSourceType: "number"',
    eventtype: 'number',
    msguuid: 'string',
    isstarred: 'boolean'
};
// 正在发送中的消息
const commonSendingMsgSrc = {
    ...commonMsgSrc,
    clientSendingStatus: compileEnum([EnumSendingStatus.ClientSending, EnumSendingStatus.ClientSendFailed, EnumSendingStatus.ClientEditing, EnumSendingStatus.ClientEditFailed]), // 自己发送消息的状态
    clientSendTime: 'number' // 消息客户端发送时间, 仅用于显示, 请求或排序使用 msgsrvtime
};
// 发送成功的消息
const commonSentMsgSrc = {
    ...commonMsgSrc,
    msgsrvtime: 'number',
    receivestatus: 'number', // 针对别人发的消息, 自己的已读状态
    unreadnum: 'number', // 针对自己发的消息, 其他人的已读状态, -1 为特殊值,代表全未读
    clientSendingStatus: compileEnum([null, undefined]) // 发送成功的消息中, 强制移除 clientSendingStatus 字段
};

const TextMsgExtraSrc = {
    eventtype: compileEnum([EnumEventType.TextMsg]),
    text: 'string'
};
const TextSendingMsgSrc = {
    ...commonSendingMsgSrc,
    ...TextMsgExtraSrc
};
const TextSentMsgSrc = {
    ...commonSentMsgSrc,
    ...TextMsgExtraSrc
}
const TextMessageSchemas = [
    compile(TextSendingMsgSrc),
    compile(TextSentMsgSrc)
];

const FileMsgExtraSrc = {
    eventtype: compileEnum([EnumEventType.FileMsg, EnumEventType.FileShareMsg]),
    fileurl: 'string',
    filetype: 'string',
    filename: 'string',
    filesize: 'number',
    imgwidth: 'number',
    imgheight: 'number',
    __options: {
        notRequired: ['imgwidth', 'imgheight']
    }
};
// 当文件发送中和发送失败时, 没有"resourceid"和"gmtcreate"字段
const FileMessageSchemas = [
    compile({
        ...commonSendingMsgSrc,
        ...FileMsgExtraSrc
    }),
    compile({
        ...commonSentMsgSrc,
        ...FileMsgExtraSrc,
        resourceid: 'string | maybeSourceType: "number"',
        gmtcreate: 'number | maybeSourceKey: "createtime"'
    })
]

const RichTextMsgExtraSrc = {
    eventtype: compileEnum([EnumEventType.RichTextMsg]),
    resourceid: 'string',
    title: 'string',
    content: 'string',
    gmtcreate: 'number | maybeSourceKey: "createtime"'
};
const RichTextMessageSchemas = [
    compile({
        ...commonSendingMsgSrc,
        ...RichTextMsgExtraSrc
    }),
    compile({
        ...commonSentMsgSrc,
        ...RichTextMsgExtraSrc
    })
]

export const MessageSchema = compile({
    __compiled: true,
    title: 'MessageSchema',
    anyOf: [
        ...TextMessageSchemas,
        ...FileMessageSchemas,
        ...RichTextMessageSchemas
    ]
});

export const MessageListSchema = compile([MessageSchema]);

// @ 列表消息
export const MentionMsgSchema = compile({
    ...TextSentMsgSrc,
    displayname: 'string',
    mentionType: 'number',
    __options: {
        title: 'MentionMsgSchema',
        notRequired: ['unreadnum',"isstarred"] //@列表的消息没有这个字段
    }
});
export const MentionMsgListSchema = compile([MentionMsgSchema]);
