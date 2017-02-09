export default {
    // 新消息推送, 同时作为消息类型
    TextMsg: 0,
    FileMsg: 1,
    RichTextMsg: 10,
    FileShareMsg: 15,

    // 消息相关事件
    MsgAck: 2,
    MsgDeleted: 3,
    TextMsgEdited: 8,
    FileNameChanged: 9,
    MsgStarredChange: 16,

    // 会话相关事件
    SessionClosed: 4,
    SessionOpened: 5,
    SessionStickyChanged: 6,
    SessionRead: 7,

    UserInfoChanged: 500,
    NotifyChanged: 501,

    // 群聊相关事件
    GroupCreated: 1000,
    GroupMemberEntered: 1001,
    GroupMemberLeaved: 1002,
    GroupNameChanged: 1003,
    GroupLeaderChanged: 1005
};
