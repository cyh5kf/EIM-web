import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';

import Popper from '../../../components/popper/Popper';
import PureRenderComponent from '../../../components/PureRenderComponent';
import Loading from '../../../components/loading/Loading';
import StringUtils from '../../../utils/StringUtils';
import ReactPropTypes from '../../../core/ReactPropTypes';
import {ChannelSchema} from '../../../core/schemas/ChannelSchemas';
import {MessageSchema} from '../../../core/schemas/MessageSchemas';
import MessageActionMenus from './MessageActionMenus';

import MessageImageHolder from './MessageImageHolder';
import MessageFileHolder from './MessageFileHolder';
import MessageTextHolder from './MessageTextHolder';
import MessageRichTextHolder from './MessageRichTextHolder';
import {isPicture} from '../../../utils/FileExtensionUtils';
import warning from '../../../utils/warning';
import {getTargetUidByChannelId} from '../../../core/core-utils/ChannelUtils';

import {UserProfileSchema} from '../../../core/schemas/LoginSchemas';
import EnumEventType from '../../../core/enums/EnumEventType';
import {EnumSendingStatus} from '../../../core/enums/MessageEnums';
import EnumSessionType from '../../../core/enums/EnumSessionType';
import SendTextMsgCmd from '../../../core/commands/messages/SendTextMsgCmd';
import SendFileMessageCmd from '../../../core/commands/messages/SendFileMessageCmd';
import SendRichTextMsgCmd from '../../../core/commands/messages/SendRichTextMsgCmd';
import EditTextMsgCmd from '../../../core/commands/messages/EditTextMsgCmd';

import '../../view-components/dropdown-menu-popover.less';


export default class MessageItem extends PureRenderComponent {
    static propTypes = {
        channelData:ReactPropTypes.ofSchema(ChannelSchema).isRequired,
        message:ReactPropTypes.ofSchema(MessageSchema).isRequired,
        locale:ReactPropTypes.ofLocale(['MESSAGE_COMPOSER']).isRequired,
        unreadstart:PropTypes.bool,
        userInfo: ReactPropTypes.ofSchema(UserProfileSchema).isRequired,
        highlighting: ReactPropTypes.bool.isRequired,
        highlightwords: ReactPropTypes.string.isRequired
    }

    constructor(props) {
        super(props);
        this.state = {showActionMenu:false,editing: false};
    }

    onShowMenu=()=>{
		this.setState({
			showActionMenu:true
		});
	}

	onHideMenu=()=>{
		this.setState({
			showActionMenu:false
		});
	}

    onEditStart = () => this.setState({
        editing: true
    })
    
    onMsgEdited = () => this.setState({editing: false})

    componentWillReceiveProps(nextProps) {
        if (this.props.highlighting && !nextProps.highlighting) {
            clearTimeout(this._highlightFadingTimer);
            this.setState({
                highlightFading: true
            });
            this._highlightFadingTimer = setTimeout(() => this.setState({
                highlightFading: false
            }), 2000);
        }
    }

    handleRetryClick = () => {
        const {
                sessionid, sessiontype, eventtype, msguuid, clientSendTime, clientSendingStatus,
                text,
                filetype, filename, filedesc, filesize, fileurl, imgwidth, imgheight,
                title, content, preview
                } = this.props.message;
        if (clientSendingStatus === EnumSendingStatus.ClientSendFailed) {
            switch (eventtype) {
                case EnumEventType.TextMsg:
                    SendTextMsgCmd({
                        sessionid, sessiontype, clientSendTime, msguuid,
                        text
                    });
                    break;
                case EnumEventType.FileMsg:
                    SendFileMessageCmd({
                        sessionid, sessiontype, clientSendTime, msguuid,
                        filetype, filename, filedesc, filesize, fileurl, imgwidth, imgheight
                    });
                    break;
                case EnumEventType.RichTextMsg:
                    SendRichTextMsgCmd({
                        sessionid, sessiontype, clientSendTime, msguuid,
                        title, content, preview
                    });
                    break;
            }
        } else if (clientSendingStatus === EnumSendingStatus.ClientEditFailed) {
            switch (eventtype) {
                case EnumEventType.TextMsg:
                    EditTextMsgCmd({
                        editingMsg: this.props.message,
                        text
                    });
                    break;
            }
        }
    }

    renderMessageContent() {
        const {message, locale, highlightwords} = this.props,
            {editing} = this.state,
            msgtype = message.eventtype;
        if(msgtype === EnumEventType.TextMsg){
            return <MessageTextHolder message={message} editing={editing} onEdited={this.onMsgEdited} locale={locale} highlightwords={highlightwords}/>;
        }else if (msgtype === EnumEventType.FileMsg
            || msgtype === EnumEventType.FileShareMsg) {
            if(isPicture(message.filetype)){
                return <MessageImageHolder message={message}/>;
            }
            else{
                return <MessageFileHolder message={message}/>;
            }
        } else if (msgtype === EnumEventType.RichTextMsg) {
            return <MessageRichTextHolder file={message} locale={locale.MESSAGES}/>
        } else {
            warning(`MessageTemplate: 未知的消息事件类型(${msgtype})`);
            return null;
        }
    }

    render(){
        const {highlighting, message, channelData, userInfo, unreadstart, locale} = this.props,
            {highlightFading, showActionMenu} = this.state,
            {clientSendingStatus, unreadnum} = message,
            isOwnMsg = message.senderuid === userInfo.uid,
            itemCls = `${highlighting ? 'highlighting' : ''} ${highlightFading ? 'highlight-fading' : ''}`,
            onlySelfWatching = (channelData.sessiontype === EnumSessionType.P2P && getTargetUidByChannelId(channelData.sessionid) === userInfo.uid)
                || (channelData.sessiontype === EnumSessionType.Channel && channelData.members.size === 1);

        let msgStatus = null;
        if (clientSendingStatus == null) {
            if (isOwnMsg) {
                if (unreadnum === 0 || onlySelfWatching) {
                    msgStatus = <span className="msg-item-status msg-readnum-indicator msg-read">{locale.CONTENT.read}</span>;
                } else {
                    let unreadLabel = null;
                    if (channelData.sessiontype === EnumSessionType.P2P) {
                        unreadLabel = locale.CONTENT.unread;
                    } else {
                        unreadLabel = (unreadnum >= channelData.members.size - 1 || unreadnum === -1) ? locale.CONTENT.allUnread : StringUtils.format(locale.CONTENT.someUnread, unreadnum);
                    }
                    msgStatus = <span className="msg-item-status msg-readnum-indicator msg-unread">{unreadLabel}</span>;
                }
            }
        } else if (clientSendingStatus === EnumSendingStatus.ClientSending || clientSendingStatus === EnumSendingStatus.ClientEditing) {
            msgStatus = <Loading className="msg-item-status" type="spinningBubbles" width={18}/>;
        } else if (clientSendingStatus === EnumSendingStatus.ClientSendFailed || clientSendingStatus === EnumSendingStatus.ClientEditFailed) {
            msgStatus = <div className="msg-item-status msg-failure-indicator eficon-warning" onClick={this.handleRetryClick}></div>;
        }

        return (
            <div className={`message-item ${itemCls}`} data-msguuid={message.msguuid}>
                {this.renderMessageContent()}
                {msgStatus}
                <div className={`msg-actions-anchor ${showActionMenu ? 'keep-showing' : ''}`} ref="actionMenuTarget" onClick={this.onShowMenu}></div>

                {showActionMenu && (
                    <Popper target={() => ReactDOM.findDOMNode(this.refs.actionMenuTarget)}
                            placement={isOwnMsg ? 'bottom-end' : 'bottom-start'}
                            onRootClose={this.onHideMenu}>
                        <MessageActionMenus message={message} userInfo={userInfo} locale={locale} onSelect={this.onHideMenu}
                                            unreadstart={unreadstart}
                                            onEdit={this.onEditStart}/>
                    </Popper>
                )}
            </div>
        );
    }

}
