import React from 'react';
import moment from 'moment';
import Dropdown from '../../../components/dropdown/Dropdown';
import Menu, {MenuItem} from '../../../components/rc-menu/Menu';
import PureRenderComponent from '../../../components/PureRenderComponent';
import exposeLocale from '../../../components/exposeLocale';
import {getTargetUidByChannelId} from '../../../core/core-utils/ChannelUtils';
import OnlineStatusIndicator from '../../view-components/online-status-indicator/OnlineStatusIndicator';
import MessageHelper from '../../message-list-view/MessageHelper';
import OpenOrCloseChannelCommand from '../../../core/commands/channel/OpenOrCloseChannelCommand';
import StickSessionCmd from '../../../core/commands/channel/StickSessionCmd';
import {ChannelListSchema, ChannelSchema} from '../../../core/schemas/ChannelSchemas';
import {TeamMemberListSchema} from '../../../core/schemas/TeamMembersSchema';
import EnumSessionType from '../../../core/enums/EnumSessionType';
import EnumEventType from '../../../core/enums/EnumEventType';
import ReactPropTypes from '../../../core/ReactPropTypes';

import './RecentSessionsList.less';

const MENU_STAR = '1',
    MENU_TOGGLE_MUTE = '2',
    MENU_REMOVE_SESSION = '3';

class SessionActionsDropdown extends PureRenderComponent {
    static propTypes = {
        session: ReactPropTypes.ofSchema(ChannelSchema).isRequired,
        locale: ReactPropTypes.ofLocale(['SESSION_LIST']).isRequired
    }
    handleMenuSelect = ({key}) => {
        const {session} = this.props;
        switch (key) {
            case MENU_STAR:
                StickSessionCmd({
                    sessionid: session.sessionid,
                    sessiontype: session.sessiontype,
                    issticky: !session.issticky
                });
                break;
            case MENU_TOGGLE_MUTE:
                window.alert('TODO...');
                break;
            case MENU_REMOVE_SESSION:
                OpenOrCloseChannelCommand({
                    sessionid: session.sessionid,
                    sessiontype: session.sessiontype,
                    open: false
                });
                break;
        }
    }
    render() {
        const {locale} = this.props;
        return (
            <Dropdown className="eficon-ic_next_pressed" onSelect={this.handleMenuSelect}>
                <Menu>
                    <MenuItem key={MENU_STAR}>{locale.menuPopup.menuStick}</MenuItem>
                    <MenuItem key={MENU_TOGGLE_MUTE}>{locale.menuPopup.menuMute}</MenuItem>
                    <MenuItem key={MENU_REMOVE_SESSION}>{locale.menuPopup.menuRemoveSession}</MenuItem>
                </Menu>
            </Dropdown>
        );
    }
}

@exposeLocale(['SESSION_LIST'])
export default class RecentSessionsList extends PureRenderComponent {
    static propTypes = {
        recentSessions: ReactPropTypes.ofSchema(ChannelListSchema).isRequired,
        teamMembers: ReactPropTypes.ofSchema(TeamMemberListSchema).isRequired,
        currentSessionid: ReactPropTypes.string,
        onSessionSelect: ReactPropTypes.func
    }

    handleSessionClick = e => {
        const sessionid = e.currentTarget.dataset.sessionid,
            {onSessionSelect} = this.props;
        //SwitchChannelCmd({sessionid});
        onSessionSelect && onSessionSelect({sessionid});
    }

    render() {
        const {recentSessions, teamMembers, currentSessionid} = this.props;

        return (
            <div className="recent-sessions">
                {recentSessions.map(session => {
                    const {sessionid, lastMessage, newMsgCount} = session,
                        isCurrent = sessionid === currentSessionid;
                    let msgDisplay = null;
                    if (lastMessage) {
                        if (lastMessage.eventtype === EnumEventType.TextMsg) {
                            msgDisplay = <span dangerouslySetInnerHTML={{__html: MessageHelper.parse(lastMessage)}}/>;
                        } else if (lastMessage.eventtype === EnumEventType.FileMsg) {
                            msgDisplay = '[pic]';
                        }
                        if (session.sessiontype === EnumSessionType.Channel) {
                            msgDisplay = <span>{lastMessage.sendername + ': '}{msgDisplay}</span>;
                        }
                    }

                    let logoContent = null;
                    if (session.sessiontype === EnumSessionType.P2P) {
                        const targetUid = getTargetUidByChannelId(sessionid),
                            memberInfo = teamMembers.find(member => member.uid === targetUid);
                        logoContent = (
                            <div className="session-logo" style={memberInfo && memberInfo.avatar && {backgroundImage: `url(${memberInfo.avatar})`} || {}}>
                                <OnlineStatusIndicator onlineStatus={memberInfo && memberInfo.loginstatus}/>
                            </div>
                        );
                    } else {
                        logoContent = <div className="session-logo"></div>;
                    }


                    return (
                        <div key={sessionid} className={`recent-session-item ${isCurrent ? 'current-session' : ''}`}
                             data-sessionid={sessionid} onClick={this.handleSessionClick}>
                            {logoContent}
                            <div className="session-detail">
                                <div className="session-detail-first">
                                    <div className="session-name">{session.displayname}</div>
                                    {!!lastMessage && <div className="session-last-time">{moment(lastMessage.msgsrvtime).format('H:mm A')}</div>}
                                </div>
                                <div className="session-detail-second">
                                    <div className="session-last-msg">{msgDisplay}</div>
                                   {newMsgCount > 0 && <div className="session-new-msg-cnt">{newMsgCount <= 99 ? newMsgCount : '99+'}</div>}
                                    <SessionActionsDropdown session={session} locale={this.state.locale}/>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
}
