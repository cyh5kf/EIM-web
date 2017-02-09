import LoginStore from './LoginStore';
import _ from 'underscore';
import immutable from 'immutable';
import {createImmutableSchemaData, mergeImmutableSchemaData} from '../../utils/schema';
import {ChannelSchema} from '../schemas/ChannelSchemas';
import {MessageListSchema, MessageSchema} from '../schemas/MessageSchemas';
import {FileMsgListSchema} from '../schemas/SearchStoreSchemas';
import {EnsureTeamMembersExistCmd} from '../commands/TeamMembersCommands';
import TeamMembersStore from './TeamMembersStore';
import EnumEventType from '../enums/EnumEventType';
import EnumSessionType from '../enums/EnumSessionType';
import {EnumReceiveStatus} from '../enums/MessageEnums';
import gUiMessageQueue from './UiMessageQueue';
import EventBus from '../../utils/EventBus';
import warning from '../../utils/warning';

// 单个会话的事件也会由 ChannelsStore 触发, 并且事件会统一加上 {sessionid} 数据
export const SINGLE_CHANNEL_EVENTS = {
    CHANNEL_DATA_CHANGE: 'channelInfochange',
    MESSAGES_CHANGE: 'messagesChange',
    FILES_CHANGE: 'filesChange',
    ON_NEW_MESSAGE_COME: 'onNewMessageCome',
    ON_MESSAGES_HISTORY_LOADED: 'onMessagesHistoryLoaded'
};

export default class Channel extends EventBus {
    constructor(mgr, channelDataOptions) {
        super(...arguments);
        this.channelData = createImmutableSchemaData(ChannelSchema, {
            isDetailPulled: false,
            lastMessage: null,
            unreadMsgFromUUID: null,
            ...channelDataOptions
        });

        this.messages = createImmutableSchemaData(MessageListSchema, null);
        this._rebuildMessageIdxMap();

        this.fileFullLoaded = true;
        this.files= createImmutableSchemaData(FileMsgListSchema, null);
        this.mgr = mgr;
    }

    _rebuildMessageIdxMap() {
        const msgIdxMap = this._messagesIdxMap = {};
        if (this.messages) {
            this.messages.forEach((msg, idx) => {
                msgIdxMap[msg.msguuid] = idx;
            });
        }
    }

    getMsgIdx(msguuid) {
        const idx = this._messagesIdxMap[msguuid];
        return idx == null ? -1 : idx;
    }


    /////////////////
    // 各类数据更新操作
    // 更新并验证&转换schema
    setChannelData(changes, {notifyEvent = true} = {}) {
        const oldChannelData = this.channelData;
        this.channelData = mergeImmutableSchemaData(ChannelSchema, oldChannelData, changes);
        // 当前会话隐藏时, 重置默认选择
        if (oldChannelData.open && !this.channelData.open && this.mgr.getCurrent() === this) {
            this.mgr.resetDefaultSelectedChannel();
        }
        if (notifyEvent) {
            this.emit(SINGLE_CHANNEL_EVENTS.CHANNEL_DATA_CHANGE);
            this.mgr.emit(SINGLE_CHANNEL_EVENTS.CHANNEL_DATA_CHANGE, {sessionid: this.channelData.sessionid});
            this.mgr.onHasChannelChange(this);
        }
    }
    _setMessages(messages, {notifyEvent = true, rebuildIdxMap = true} = {}) {
        this.messages = messages;
        rebuildIdxMap && this._rebuildMessageIdxMap();
        if (notifyEvent) {
            this.emit(SINGLE_CHANNEL_EVENTS.MESSAGES_CHANGE);
            this.mgr.emit(SINGLE_CHANNEL_EVENTS.MESSAGES_CHANGE, {sessionid: this.channelData.sessionid});
        }
    }
    deleteMessage({msguuid}) {
        let containIdx = this.getMsgIdx(msguuid);
        if (containIdx !== -1) {
            this._setMessages(this.messages.delete(containIdx));
        }
    }
    onPushMessages(immutableMessages, {isLoadingHistory = false, loadingHistoryConfig/**{msguuid, direction}*/ = null} = {}) {
        if (isLoadingHistory) {
            if (__DEV__) {
                if (!loadingHistoryConfig ||
                    (['backward', 'around', 'forward'].indexOf(loadingHistoryConfig.direction) === -1) ||
                    (loadingHistoryConfig.direction === 'around' && !loadingHistoryConfig.msguuid)) {
                    warning(`Channel.onPushMessages: loadingHistoryConfig 参数不对: ${JSON.stringify(loadingHistoryConfig)}`);
                }
            }
            if (!this.messages) {
                this._setMessages(immutableMessages);
            } else if (immutableMessages.size) {
                let messages = this.messages;
                switch (loadingHistoryConfig.direction) {
                    case 'backward': {
                        const lastNewMsgIdx = this.getMsgIdx(immutableMessages.last().msguuid);
                        messages = immutableMessages.concat(
                            lastNewMsgIdx === -1 ? messages : messages.slice(lastNewMsgIdx + 1)
                        );
                        break;
                    }
                    case 'around': {
                        const firstNewMsgIdx = this.getMsgIdx(immutableMessages.first().msguuid);
                        messages = (firstNewMsgIdx === -1 ? messages : messages.slice(0, firstNewMsgIdx)).concat(immutableMessages);
                        break;
                    }
                    case 'forward':
                        messages = immutableMessages;
                }
                this._setMessages(messages);
            }

            this.emit(SINGLE_CHANNEL_EVENTS.ON_MESSAGES_HISTORY_LOADED, loadingHistoryConfig);
            this.mgr.emit(SINGLE_CHANNEL_EVENTS.ON_MESSAGES_HISTORY_LOADED, {
                ...loadingHistoryConfig,
                sessionid: this.channelData.sessionid
            });
        } else {
            const getMsgSize = () => this.messages ? this.messages.size : 0,
                oldMsgSize = getMsgSize();
            if (!this.messages) {
                this._setMessages(immutableMessages);
            } else {
                immutableMessages.forEach(msg => {
                    const idx = this.getMsgIdx(msg.msguuid);
                    if (idx === -1) {
                        this._setMessages(this.messages.push(msg), {notifyEvent: false});
                    } else {
                        this._setMessages(this.messages.set(idx, msg), {notifyEvent: false, rebuildIdxMap: false});
                    }
                });

                this.emit(SINGLE_CHANNEL_EVENTS.MESSAGES_CHANGE);
                this.mgr.emit(SINGLE_CHANNEL_EVENTS.MESSAGES_CHANGE, {sessionid: this.channelData.sessionid});
            }

            if (getMsgSize() > oldMsgSize) {
                this.emit(SINGLE_CHANNEL_EVENTS.ON_NEW_MESSAGE_COME);
                this.mgr.emit(SINGLE_CHANNEL_EVENTS.ON_NEW_MESSAGE_COME, {sessionid: this.channelData.sessionid});
            }
        }

        // 更新会话最后一条消息
        const lastMsg = this.messages.last();
        if (lastMsg && lastMsg.clientSendingStatus == null && (!this.channelData.lastMessage || lastMsg.msguuid !== this.channelData.lastMessage.msguuid)) {
            this.setChannelData({
                lastMessage: lastMsg.toJS()
            });
        }

        const successFiles = createImmutableSchemaData(FileMsgListSchema, immutableMessages.reduce((result, msg) => {
            if (msg.eventtype === EnumEventType.FileMsg && msg.clientSendingStatus == null) {
                result.push({
                    sessionName: this.channelData.displayname,
                    senderName: msg.sendername,
                    msgTime: msg.gmtcreate,
                    msgId: msg.msguuid,
                    sessionId: msg.sessionid,
                    sessionType:  msg.sessiontype,
                    senderUid: msg.senderuid,
                    resourceid: msg.resourceid,
                    filetype: msg.filetype,
                    filesize: msg.filesize,
                    fileName: msg.filename,
                    fileUrl: msg.fileurl,
                    imgwidth: msg.imgwidth,
                    imgheight: msg.imgheight
                });
            }
            return result;
        }, []));
        this.onPushShareFiles(successFiles);
    }
    onEditMessages(messagesChanges) {
        const editedMsgs = messagesChanges.reduce((result, chg) => {
            if (__DEV__ && !chg.msguuid) { warning(`Channel.onEditMessage: 未指定msguuid: ${JSON.stringify(chg)}`); }
            const msgIdx = this.getMsgIdx(chg.msguuid);
            if (msgIdx !== -1) {
                result.push(
                    mergeImmutableSchemaData(MessageSchema, this.messages.get(msgIdx), chg)
                );
            }
            return result;
        }, []);
        if (editedMsgs.length) {
            this.onPushMessages(immutable.List(editedMsgs));
        }
    }


    getMemberListUID(){
        if(this.channelData.members){
            return this.channelData.members.map(member => member.uid);
        }
        return null;
    }

    getMemberList(){
        return this.channelData.members;
    }


    onPushShareFiles(files, {isMsgPush = true, isLast = true} = {}) {        
        if (this.files) {                        
            const fileMap = this.files.concat(files).reduce((result, file) => {
                result[file.sessionId + file.resourceid] = file;
                return result;
            }, {});
            this.files = immutable.List(_.values(fileMap)).sortBy(file => (-file.msgTime));            
        }
        else if(!isMsgPush){
            this.files = files;
        }

        if(!isMsgPush){
            //非消息推送时，需要根据返回标记文件加载状态
            this.fileFullLoaded = isLast;
        }

        this.emit(SINGLE_CHANNEL_EVENTS.FILES_CHANGE);
        this.mgr.emit(SINGLE_CHANNEL_EVENTS.FILES_CHANGE, {sessionid: this.channelData.sessionid});
    }

    onChannelMembersJoin(members) {
        if (!this.channelData.members) {
            return;
        }

        if(!this.channelData.displayname){
            var names = members.map(member => member.firstname + member.lastname);
            this.setChannelData({
                displayname: names.join(',')
            });
        }

        let contains = {};
        this.channelData.members.forEach(function(member){
            contains[member.uid]=true;
        });

        let newMembers = members.filter(member => {
            return !contains[member.uid];
        });
        this.setChannelData({
            members: this.channelData.members.concat(newMembers).toJS()
        });
    }

    onChannelMemberLeave(leavedUid) {
        if (!this.channelData.members) {
            return;
        }

        this.setChannelData({
            members: this.channelData.members.filter(member => member.uid !== leavedUid).toJS()
        });
    }

    _onReceiveSocketEvent(event) {
        let shouldNotify = false;
        switch (event.eventtype) {
            case EnumEventType.TextMsgEdited:
                this.onEditMessages([{
                    msguuid: event.msguuid,
                    clientSendingStatus: null,
                    text: event.newmsgcontent
                }]);
                break;
            case EnumEventType.GroupMemberEntered: { //成员加入群聊
                const uids = event.useradd.map(user => user.uid.toString());
                EnsureTeamMembersExistCmd(uids)
                    .then(() => this.onChannelMembersJoin(TeamMembersStore.getTeamMembers().filter(member => {
                        return uids.indexOf(member.uid) !== -1;
                    })));
                break;
            }
            case EnumEventType.GroupMemberLeaved: { //成员退出群聊
                const leaveUid = event._raw.eventData.groupMemberLeave.msg.userLeave.uid.toString();
                this.onChannelMemberLeave(leaveUid);
                if (leaveUid === LoginStore.getUID()) {
                    this.setChannelData({open: false});
                    this._setMessages(null);
                }
                break;
            }
            case EnumEventType.GroupNameChanged: //群名称修改
                this.setChannelData({
                    displayname: event.newgroupname
                });
                break;
            case EnumEventType.GroupLeaderChanged: { //群主转移
                const leaderUid = event._raw.eventData.changeGroupLeader.msg.newLeader.uid.toString();
                EnsureTeamMembersExistCmd([leaderUid])
                    .then(() => {
                        this.setChannelData({
                            owner: TeamMembersStore.getTeamMemberByUid(leaderUid).toJS()
                        });
                    });
                break;
            }
            case EnumEventType.SessionOpened:   //打开会话
                this.setChannelData({open: true});
                break;
            case EnumEventType.SessionClosed:
                this.setChannelData({open: false});
                break;
            case EnumEventType.SessionRead:
                this.setChannelData({newMsgCount: 0});
                break;
            case EnumEventType.SessionStickyChanged:
                this.setChannelData(({issticky: event.isstar}));
                break;

            // 新消息推送
            case EnumEventType.TextMsg:
            case EnumEventType.FileMsg:
            case EnumEventType.RichTextMsg:
            case EnumEventType.FileShareMsg: {
                let containIdx = this.getMsgIdx(event.msguuid);
                event.receivestatus = event.receivestatus != null ? event.receivestatus : EnumReceiveStatus.Sent;
                if (containIdx === -1) {
                    if (this.mgr.getCurrent() !== this) {
                        if (this.channelData.newMsgCount === 0) {
                            //这里对消息添加标记，从这条开始，是未读的新消息
                            this.setChannelData({unreadMsgFromUUID: event.msguuid});
                        }
                        this.setChannelData({newMsgCount: this.channelData.newMsgCount + 1});
                    }
                    if (!this.messages) {
                        // 如果之前未加载过消息, 则需要添加标记
                        this.setChannelData({hasMoreBackwardMsgs: true});
                    }
                    this.onPushMessages(createImmutableSchemaData(MessageListSchema, [{
                        isstarred: false,
                        unreadnum: -1,
                        ...event,
                        senderavatar: event.avatar,
                        sendername: event.username
                    }]));
                    shouldNotify = event.senderuid !== LoginStore.getUID() && event.receivestatus !== EnumReceiveStatus.Read;
                } else {
                    this.onEditMessages([{
                        unreadnum: -1,
                        ...event,
                        clientSendingStatus: null
                    }]);
                }

                if ((shouldNotify && this.mgr.getCurrent() !== this) || (!this.mgr.windowIsFocused() && shouldNotify)) {
                    gUiMessageQueue.push({
                        ...event,
                        topic: this.channelData.displayname,
                        from: this.channelData.sessionid,
                        clienttime: Date.now()
                    });
                }
                this.setChannelData({open: true});
                break;
            }

            // 消息相关事件
            case EnumEventType.MsgAck: {
                this.setChannelData({open: true});
                this.onEditMessages([{
                    msguuid: event.origmsguuid,
                    receivestatus: event.receivestatus,
                    unreadnum: event.sessiontype === EnumSessionType.P2P ? 0 : event.unreadnum
                }]);
                break;
            }
            case EnumEventType.MsgDeleted: {
                this.setChannelData({open: true});
                if (this.messages) {
                    this.deleteMessage({msguuid: event.origmsguuid});
                }
                break;
            }
            case EnumEventType.MsgStarredChange:
                if (this.messages) {
                    this.onEditMessages([{
                        msguuid: event.msguuid,
                        isstarred: event.isstar
                    }]);
                }
                break;
        }
    }
}

