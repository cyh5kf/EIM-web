import React from 'react';
import _ from 'underscore';
import PureRenderComponent from '../../components/PureRenderComponent';
import MessageList from './message-list/MessageList';
import MessageInputView from './../view-components/message-input/MessageInputView';
import MessageHeader from './message-header/MessageHeader';
import QueryMessagesCmd, {QUERY_DIRECTION} from './../../core/commands/messages/QueryMessagesCmd';
import {QueryGroupInfoCommand} from '../../core/commands/channel/GroupInfoCommands';
import {SwitchRightPanelCmd} from '../../core/commands/RightPanelConfigCommands';
import SendMessageAckCommand from '../../core/commands/messages/SendMessageAckCommand';
import ResetSessionCommand from '../../core/commands/channel/ResetSessionCommand';
import FileProgressBar from './FileProgressBar';
import Loading from 'react-loading';
import AddUserFromGroupCommand from '../../core/commands/channel/AddUserFromGroupCommand';
import AttendButton from '../../components/button/LoadingButton';
import classnames from '../../utils/ClassNameUtils';
import EnumSessionType from '../../core/enums/EnumSessionType';
import EnumRightPanelType from '../../core/enums/EnumRightPanelType';
import {EnumReceiveStatus} from '../../core/enums/MessageEnums';
import {getTargetUidByChannelId} from '../../core/core-utils/ChannelUtils';
import exposeLocale from '../../components/exposeLocale';
import exposeUserInfo from '../view-components/exposeUserInfo';
import exposeStoreData from '../view-components/exposeStoreData';
import exposePendingCmds from '../view-components/exposePendingCmds';
import exposeChannelData from '../view-components/exposeChannelData';
import StringUtils from '../../utils/StringUtils';
import SettingStore, {SETTING_EVENTS} from '../../core/stores/SettingStore';
import ChannelsStore, {SINGLE_CHANNEL_EVENTS} from '../../core/stores/ChannelsStore';
import RightPanelConfigStore from '../../core/stores/RightPanelConfigStore';
import TeamMembersStore from '../../core/stores/TeamMembersStore';
import ReactPropTypes from '../../core/ReactPropTypes';

import './MessageListViewComposer.less';

@exposeLocale(['MESSAGE_COMPOSER'])
@exposeUserInfo
@exposePendingCmds([QueryMessagesCmd, QueryGroupInfoCommand])
@exposeStoreData([
    [SettingStore, SETTING_EVENTS.USER_CHANGE, () => {
        const userSettings = SettingStore.getUserSetting();
        return {
            showRealname: userSettings ? userSettings.changeusernamepolicy === 1 : false,
            highlightwords: userSettings ? userSettings.highlightwords : ''
        };
    }],
    [RightPanelConfigStore, () => ({panelType: RightPanelConfigStore.getPanelConfig().panelType})],
    [TeamMembersStore, () => ({teamMembers: TeamMembersStore.getTeamMembers()})]
])
@exposeChannelData({channelData: true, messages: true})
// 组件会自动加载历史消息, 但是不会加载会话的基础数据, 需外面控制
export default class MessageListViewComposer extends PureRenderComponent {
    static propTypes = {
        sessionid: ReactPropTypes.string,
        onSendMessage: ReactPropTypes.func
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextProps.sessionid !== this.props.sessionid) {
            if (this.state.panelType === EnumRightPanelType.SESSION_DETAIL
                || this.state.panelType === EnumRightPanelType.SESSION_FILE) {
                SwitchRightPanelCmd(this.state.panelType, {
                    sessionid: nextProps.sessionid
                });
            }
        }

        this._tryMarkSessionRead(nextState.channelData);
        if (nextState.messages && nextState.messages !== this.state.messages) {
            this._tryAckMessages();
        }
    }

    componentWillMount(){
        this._tryMarkSessionRead();
        this._tryAckMessages();
        ChannelsStore.addEventListener(SINGLE_CHANNEL_EVENTS.ON_MESSAGES_HISTORY_LOADED, this._onMessagesHistoryLoaded);
        ChannelsStore.addEventListener(SINGLE_CHANNEL_EVENTS.ON_NEW_MESSAGE_COME, this._onNewMessageCome);
    }

    componentWillUnmount(){
        ChannelsStore.removeEventListener(SINGLE_CHANNEL_EVENTS.ON_MESSAGES_HISTORY_LOADED, this._onMessagesHistoryLoaded);
        ChannelsStore.removeEventListener(SINGLE_CHANNEL_EVENTS.ON_NEW_MESSAGE_COME, this._onNewMessageCome);
    }

    _tryMarkSessionRead(channelData) {
        if (channelData) {
            const {sessionid, sessiontype, newMsgCount} = channelData;
            if (newMsgCount > 0 && !ResetSessionCommand.isPending(sessionid)) {
                ResetSessionCommand({sessionid, sessiontype});
            }
        }
    }
    _tryAckMessages = () => {
        if (!this._ackMessagesTimer) {
            this._ackMessagesTimer = window.setTimeout(() => {
                const {messages, userInfo: {uid}} = this.state;
                if (messages) {
                    const unreadmessages = messages.filter(msg => {
                        return msg.senderuid !== uid && msg.receivestatus === EnumReceiveStatus.Sent;
                    });
                    if (unreadmessages.size) {
                        const {sessionid, sessiontype} = messages.first();
                        SendMessageAckCommand({
                            sessionid,
                            sessiontype,
                            messages: unreadmessages
                        });
                    }
                }

                this._ackMessagesTimer = null;
            }, 500);
        }
    }

    _onMessagesHistoryLoaded = ({sessionid, msguuid, direction}) => {
        if (sessionid === this.props.sessionid) {
            const msgList = this.refs['message-list'];
            if (msgList) {
                if (direction === 'backward') {
                    if (msguuid) {
                        msgList.scrollToMessage({msguuid, position: 'top'});
                    } else {
                        msgList.scrollToBottom();
                    }
                } else if (direction === 'around') {
                    msgList.scrollToMessage({msguuid, position: 'center'});
                }
            }
        }
    }
    _onNewMessageCome = ({sessionid}) => {
        if (sessionid === this.props.sessionid) {
            const msgList = this.refs['message-list'];
            if (msgList) {
                msgList.scrollToBottom({forceScroll: false});
            }
        }
    }

    joinedToChannel=()=>{
        let uid = this.state.userInfo.uid;
        let channelData = this.state.channelData;
        let opt = {members:[uid], gid: channelData.sessionid};
        AddUserFromGroupCommand({options:opt});
    }

    isLoadingHistory = ({forward = true} = {}) => {
        const {channelData, pendingCmds} = this.state;
        return channelData && pendingCmds.isPending(QueryMessagesCmd, `${channelData.sessionid}-${forward ? QUERY_DIRECTION.FORWARD : QUERY_DIRECTION.BACKWARD}`);
    }
    _loadHistory = ({forward = false}) => {
        if(this.state.messages && !this.isLoadingHistory({forward})){
            const sortedMessages = this.state.messages.sortBy(msg => msg.msgsrvtime);
            if (!forward) {
                const firstMsg = sortedMessages && sortedMessages.first();
                if(firstMsg) {
                    QueryMessagesCmd({
                        baseMsguuid: firstMsg.msguuid,
                        sessionid: firstMsg.sessionid,
                        sessiontype: firstMsg.sessiontype,
                        timestamp: firstMsg.msgsrvtime,
                        queryDirection: QUERY_DIRECTION.BACKWARD
                    });
                }
            } else {
                const lastMsg = sortedMessages && sortedMessages.last();
                if(lastMsg) {
                    QueryMessagesCmd({
                        baseMsguuid: lastMsg.msguuid,
                        sessionid: lastMsg.sessionid,
                        sessiontype: lastMsg.sessiontype,
                        timestamp: lastMsg.msgsrvtime,
                        queryDirection: QUERY_DIRECTION.FORWARD
                    });
                }
            }
        }
    }

    onSendMessage=()=>{
        const msgList = this.refs['message-list'];
        if (msgList) {
            msgList.scrollToBottom();
        }
        this.props.onSendMessage && this.props.onSendMessage();
    }

    cancelFile=(file)=>{
        this.refs.messageInput.cancelFile(file);
    }

    renderJoinTip() {
        let channelData = this.state.channelData;
        let joinedChannel = this.state.locale.JOINED_CHANNEL;
        return (
            <div className="join_channel_container">
                <div className="join_channel_box">
                    <div className="joined_desc floatLeft">{joinedChannel.JoinedLabel}<b>{joinedChannel.simpol}{channelData.displayname}</b></div>
                    <div className="joined_operate floatRight">
                        <div className="join_chanel_line" onClick={this.joinedToChannel}><AttendButton className="join_channel_btn">{joinedChannel.JoinedButtonText}</AttendButton></div>
                        <div className="attend_desc">{joinedChannel.joinedDesc}</div>
                    </div>
                </div>
            </div>
        );
    }

    render(){
        let {userInfo, channelData, teamMembers, messages, panelType, pendingCmds} = this.state;
        const notJoinedChannel = channelData && channelData.sessiontype === EnumSessionType.Channel && (!channelData.members || channelData.members.every(member => member.uid !== userInfo.uid));
        const locale = this.state.locale;
        const isInitialLoading = !channelData ||
            pendingCmds.isPending(QueryGroupInfoCommand, channelData.sessionid) ||
            !messages;
        let p2pMemberInfo = null;
        if (channelData && channelData.sessiontype === EnumSessionType.P2P) {
            const targetUid = getTargetUidByChannelId(channelData.sessionid);
            p2pMemberInfo = teamMembers.find(member => member.uid === targetUid);
        }

        if (isInitialLoading) {
            return (
                <div className="message-list-view">
                    <div className="message-loading">
                        <Loading type='spinningBubbles' color='#e3e3e3'/>
                    </div>
                </div>
            )
        } else {
            let emptyText = '';
            if (!_.isEmpty(channelData)) {
                let publicEmpty = channelData.sessiontype === EnumSessionType.Channel && channelData.ispublic && messages.size === 0;
                let privateEmpty = channelData.sessiontype === EnumSessionType.Channel && !channelData.ispublic && messages.size === 0;
                let p2pEmpty = channelData.sessiontype === EnumSessionType.P2P && messages.size === 0;
                if (publicEmpty) {
                    emptyText = locale.EMPTY.public_channel;
                } else if (privateEmpty) {
                    emptyText = locale.EMPTY.private_channel;
                } else if (p2pEmpty) {
                    emptyText = StringUtils.format(locale.EMPTY.p2p_channel, '<span class="bold">' + channelData.displayname + '</span>');
                }
            }

            let emptyTextHidden = emptyText ? '' : 'hidden';
            return (
                <div className="message-list-view">
                    <MessageHeader channelData={channelData} p2pMemberInfo={p2pMemberInfo} rightPanelType={panelType} locale={locale.HEADER}/>
                    <FileProgressBar onCancelFile={this.cancelFile} locale={locale.UPLOAD_PROGRESS}/>

                    <div className={classnames("message-empty", emptyTextHidden)}>
                        <div className="message-meta">
                            <div dangerouslySetInnerHTML={{__html:emptyText}}></div>
                        </div>
                    </div>
                    <MessageList ref="message-list" channelData={channelData} onScroll={this._loadHistory}
                                 messages={messages}
                                 isLoadingForward={this.isLoadingHistory({forward: true})}
                                 isLoadingBackward={this.isLoadingHistory({forward: false})}
                                 locale={locale} userInfo={this.state.userInfo}
                                 showRealname={this.state.showRealname}
                                 highlightwords={this.state.highlightwords}/>
                    <div className="message-form-footer">
                        {notJoinedChannel ? this.renderJoinTip()
                            : <MessageInputView ref="messageInput"
                                                sessionid={channelData.sessionid} sessiontype={channelData.sessiontype}
                                                locale={locale} onSendMessage={this.onSendMessage}/>}
                    </div>
                </div>);
        }
    }
}
