import React, {PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import moment from 'moment';
import MessageItem from './MessageItem';
import PureRenderComponent from '../../../components/PureRenderComponent';
import ModelDialog from '../../../components/dialog/ModelDialog';
import MessageUserInfoDialog from './../MessageUserInfoDialog';
import {UserProfileSchema} from '../../../core/schemas/LoginSchemas';
import {ChannelSchema} from '../../../core/schemas/ChannelSchemas';
import {MessageListSchema} from '../../../core/schemas/MessageSchemas';
import EnumSessionType from '../../../core/enums/EnumSessionType';
import ReactPropTypes from '../../../core/ReactPropTypes';

import './MessageList.less';

const MESSAGE_TIME_GROUP_INTERVAL = 10 * 60 * 1000; // 消息合并的时间间隔 (10分钟)

export default class MessageList extends PureRenderComponent {
    static propTypes = {
        messages: ReactPropTypes.ofSchema(MessageListSchema),
        channelData:ReactPropTypes.ofSchema(ChannelSchema),
        onScroll:PropTypes.func,
        isLoadingForward: PropTypes.bool.isRequired,
        isLoadingBackward: PropTypes.bool.isRequired,
        locale: ReactPropTypes.ofLocale(['MESSAGE_COMPOSER']).isRequired,
        userInfo: ReactPropTypes.ofSchema(UserProfileSchema).isRequired,
        showRealname: ReactPropTypes.bool.isRequired,
        highlightwords: ReactPropTypes.string.isRequired
    }

    constructor() {
        super(...arguments);
        this._hasManuallyScrolled = false;
        this.state = {};
    }    

    scrollToMessage({msguuid, position}) {
        const scrollNode = findDOMNode(this.refs['messageList']);
        let scrollTop = null;
        const msgNode = scrollNode.querySelector(`.message-item[data-msguuid="${msguuid}"]`);
        if (msgNode) {
            const pos = scrollNode.getBoundingClientRect(),
                msgPos = msgNode.getBoundingClientRect(),
                baseScrollTop = msgPos.top - pos.top + scrollNode.scrollTop;
            switch (position) {
                case 'center':
                    scrollTop = baseScrollTop - (pos.height / 2);
                    // 高亮3秒
                    clearTimeout(this._highlightMsgTimer);
                    this.setState({
                        highlightMsguuid: msguuid
                    });
                    this._highlightMsgTimer = setTimeout(() => {
                        this.setState({
                            highlightMsguuid: null
                        });
                    }, 3000);
                    break;
                case 'top':
                    scrollTop = baseScrollTop;
                    break;
                case 'bottom':
                    scrollTop = baseScrollTop - pos.height + msgPos.height
            }
        }

        if (scrollTop != null) {
            this._scrollWithScrollTop(scrollTop);
        }
    }

    scrollToBottom({forceScroll = true} = {}) {
        const scrollNode = findDOMNode(this.refs['messageList']);
        if (forceScroll || !this._hasManuallyScrolled) {
            this._scrollWithScrollTop(scrollNode.scrollHeight);
            this._hasManuallyScrolled = false;
        }
    }

    componentDidMount(){
        this.scrollToBottom();
    }

    componentWillReceiveProps(nextProps) {
        const channelChanged = (!this.props.channelData && nextProps.channelData) ||
            (this.props.channelData && !nextProps.channelData) ||
            (this.props.channelData && nextProps.channelData && this.props.channelData.sessionid !== nextProps.channelData.sessionid);
        if (channelChanged) {
            this.setState({}, () => this.scrollToBottom());
        }
    }

    onScroll=(e)=>{
        if(this.ignorescroll) return;
        const channelData = this.props.channelData,
            node = e.target,
            scrolledToBottom = node.scrollTop + node.clientHeight === node.scrollHeight;
        // let top = e.target.scrollTop + e.target.clientHeight;
        if(node.scrollTop === 0 && channelData && channelData.hasMoreBackwardMsgs){
            setTimeout(()=>{
                if(this.props.onScroll){
                    this.props.onScroll({forward: false});
                }
            }, 500);
        } else if (scrolledToBottom && channelData && channelData.hasMoreForwardMsgs) {
            setTimeout(()=>{
                if(this.props.onScroll){
                    this.props.onScroll({forward: true});
                }
            }, 500);
        }

        this._hasManuallyScrolled = !scrolledToBottom;
    }
    onLoadForwardClick = () => this.props.onScroll({forward: true})
    onLoadBackwardClick = () => this.props.onScroll({forward: false})

    _scrollWithScrollTop(scrollTop) {
        this.ignorescroll = true;
        $(".message-list-data").animate({scrollTop:scrollTop}, 20, 'swing', () =>{
            this.ignorescroll = false;
        });
    }

    handleSenderLogoClick = (e) => {
        const senderuid = e.target.dataset.senderuid,
            isSelf = senderuid === this.props.userInfo.uid;
        ModelDialog.openDialog(MessageUserInfoDialog,{
            uid:senderuid,isSelf:isSelf
        });
    }

    render() {
        const {messages, channelData, isLoadingForward, isLoadingBackward, highlightwords, locale, userInfo: {uid: currentUid}} = this.props,
            {highlightMsguuid} = this.state,
            unreadMsgUUid = channelData && channelData.unreadMsgFromUUID,
            getLoadingLabel = isLoading => isLoading ? '[正在加载...]' : locale.CONTENT.hasmore;
        let content = [];

        if (messages && messages.size) {
            // jyf: TODO: 添加未读分割线, locale: locale.CONTENT.newmessages
            const msgTimeGroups = [];
            let currTimeGrp = null,
                currUserGrp = null;
            messages.forEach(msg => {
                const timeLine = msg.msgsrvtime != null ? msg.msgsrvtime : msg.clientSendTime;
                if (currTimeGrp && currTimeGrp.timeLine + MESSAGE_TIME_GROUP_INTERVAL >= timeLine) { // 同一时间分组
                    if (currUserGrp && currUserGrp.userFirstMsg.senderuid === msg.senderuid) { // 同一用户分组
                        currUserGrp.messages.push(msg);
                    } else { // 不同用户分组
                        currUserGrp = {
                            userFirstMsg: msg,
                            messages: [msg]
                        };
                        currTimeGrp.msgUserGroups.push(currUserGrp);
                    }
                } else { // 不同时间分组
                    currUserGrp = {
                        userFirstMsg: msg,
                        messages: [msg]
                    };
                    currTimeGrp = {
                        timeLine: timeLine,
                        msgUserGroups: [currUserGrp]
                    };
                    msgTimeGroups.push(currTimeGrp);
                }
            });

            msgTimeGroups.forEach(msgTimeGrp => {
                const {timeLine, msgUserGroups} = msgTimeGrp;
                content.push(<div key={`tl-${timeLine}`} className="msg-timeline-label">
                    {moment(timeLine).format('MMMD H:mm A')}
                </div>);
                msgUserGroups.forEach(msgUserGrp => {
                    const {userFirstMsg} = msgUserGrp,
                        isSelf = userFirstMsg.senderuid === currentUid;
                    let senderNameLabel = null;
                    if (!isSelf && userFirstMsg.sessiontype !== EnumSessionType.P2P) {
                        senderNameLabel = userFirstMsg.sendername;
                    }
                    content.push(
                        <div key={`ug-${timeLine}-${userFirstMsg.msguuid}`} className={`user-msgs-container ${isSelf ? 'own-msgs' : ''}`}>
                            {senderNameLabel && <div className="msg-sender-name">{senderNameLabel}</div>}
                            <div className="user-msg-list">
                                {msgUserGrp.messages.map(msg => {
                                    const {locale, userInfo} = this.props,
                                        msguuid = msg.msguuid,
                                        highlighting = msguuid === highlightMsguuid;
                                    return (
                                        <MessageItem key={msguuid}
                                                     channelData={channelData}
                                                     userInfo={userInfo}
                                                     highlightwords={highlightwords}
                                                     message={msg} locale={locale}
                                                     unreadstart={unreadMsgUUid === msguuid}
                                                     highlighting={highlighting}/>
                                    );
                                })}
                            </div>
                            <div className="msg-sender-logo" style={userFirstMsg.senderavatar ? {backgroundImage: `url(${userFirstMsg.senderavatar})`} : {}}
                                 onClick={this.handleSenderLogoClick} data-senderuid={userFirstMsg.senderuid}></div>
                        </div>
                    );
                });
            });
        }

        return (
            <div className="message-list-data" ref="messageList" onScroll={this.onScroll}>
                {
                    !!channelData && channelData.hasMoreBackwardMsgs && <div className="message-hasmore hasmore-backward" onClick={this.onLoadBackwardClick}>{getLoadingLabel(isLoadingBackward)}</div>
                }
                {content}
                {
                    !!channelData && channelData.hasMoreForwardMsgs && <div className="message-hasmore hasmore-forward" onClick={this.onLoadForwardClick}>{getLoadingLabel(isLoadingForward)}</div>
                }
            </div>);
    }
}
