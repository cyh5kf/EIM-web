import React from 'react';
import _ from 'underscore';
import PureRenderComponent from '../../../components/PureRenderComponent';
import AddPreviewSessionCmd from '../../../core/commands/channel/AddPreviewSessionCmd';
import {ChannelListSchema} from '../../../core/schemas/ChannelSchemas';
import {TeamMemberListSchema} from '../../../core/schemas/TeamMembersSchema';
import exposeLocale from '../../../components/exposeLocale';
import exposePendingCmds from '../../view-components/exposePendingCmds';
import EnumLoginStatus from '../../../core/enums/EnumLoginStatus';
import EnumSessionType from '../../../core/enums/EnumSessionType';
import ReactPropTypes from '../../../core/ReactPropTypes';
import defAvatarImg from '../../../../static/images/default_user_avatar.png';
import { getChannelIdByUserId } from '../../../core/core-utils/ChannelUtils';

import './ContactComposer.less';

@exposePendingCmds([AddPreviewSessionCmd])
class ContactView extends PureRenderComponent {
    static propTypes = {
        sessionid: ReactPropTypes.string,
        channelList: ReactPropTypes.ofSchema(ChannelListSchema).isRequired,
        teamMembers: ReactPropTypes.ofSchema(TeamMemberListSchema).isRequired,
        contactLocale: ReactPropTypes.ofLocale(['CONTACT']).isRequired,
        onChangeSessionid: ReactPropTypes.func
    }

    state = {
        showGroup: false,
        showMember: false,
        shwoHelper: false
    }

    componentWillMount () {
    }

    handleContactClick (type) {
        if (type === 'group') {
            this.setState({showGroup: !this.state.showGroup});
        }
        else if (type === 'member') {
            this.setState({showMember: !this.state.showMember});
        }
        else if (type === 'helper') {
            this.setState({showHelper: !this.state.showHelper});
        }
    }

    handleContactItemClick (e) {
        const sessionid = e.currentTarget.dataset.sessionid;
        this.props.onChangeSessionid(sessionid);
    }

    handleMemberItemClick (e) {
        const uid = e.currentTarget.dataset.sessionid;
        const sessionid = getChannelIdByUserId(uid);
        if (!this.state.pendingCmds.isPending(AddPreviewSessionCmd, sessionid)) {
            AddPreviewSessionCmd({sessionid, sessiontype: EnumSessionType.P2P})
                .then(()=>{
                    this.props.onChangeSessionid(sessionid);
                })
        }
    }

    render() {
        const { channelList, teamMembers, contactLocale } = this.props;
        const teamMembersCount = teamMembers.size;
        let onLineTeamMembers = teamMembers.filter( (member) => {
            return member.loginstatus === EnumLoginStatus.WebOnline;
        });
        let busyTeamMembers = teamMembers.filter( (member) => {
            return member.loginstatus === EnumLoginStatus.WebBusy;
        });
        let offLineTeamMembers = teamMembers.filter( (member) => {
            return member.loginstatus !== EnumLoginStatus.WebOnline && member.loginstatus !== EnumLoginStatus.WebBusy;
        });

        const contactGroupContent = this.state.showGroup && channelList.map( session => {
            const {sessionid} = session,
                isCurrent = this.props.sessionid === sessionid;
                //isP2P = session.sessiontype === EnumSessionType.P2P;
            const userAvatar = session.avatar;
            const userLogo = <img src={userAvatar?userAvatar:defAvatarImg}/>;
            return (
                <div key={sessionid} className={`contact-group-item ${isCurrent ? 'current-session' : ''}`}
                     data-sessionid={sessionid} onClick={this.handleContactItemClick.bind(this)}>
                    <div className="session-logo">
                        {userLogo}
                        <i className="status-indicator"/>
                    </div>
                    <div className="session-detail">
                        <div className="session-detail-first">
                            <div className="session-name">{session.displayname}</div>
                        </div>
                        <div className="session-detail-second">
                            {session.members && <div className="session-members-cnt">{`${session.members.size} members`}</div>}
                        </div>
                    </div>
                </div>
            )
        });

        const contactMemberContent = this.state.showMember && _.map([onLineTeamMembers, busyTeamMembers, offLineTeamMembers], (val) => {
                return val.map((session, index) => {
                    const {uid, loginstatus} = session;
                    const isCurrent = this.props.sessionid === getChannelIdByUserId(uid);
                    const isOnline = loginstatus === EnumLoginStatus.WebOnline;
                    const userAvatar = session.avatar;
                    const userLogo = <img src={userAvatar?userAvatar:defAvatarImg}/>;
                    //isP2P = session.sessiontype === EnumSessionType.P2P;
                    return (
                        <div key={index} className={`contact-member-item ${isCurrent ? 'current-session' : ''} ${isOnline ? 'online' : 'offline'}`}
                             data-sessionid={uid} onClick={this.handleMemberItemClick.bind(this)}>
                            <div className={`session-logo`}>
                                {userLogo}
                                <i className="status-indicator"/>
                            </div>
                            <div className="session-detail">
                                <div className="session-detail-first">
                                    <div className="session-name">{session.username}</div>
                                </div>
                            </div>
                        </div>
                    )
                })
            });

        var generalHelperContent = null;
        if (this.state.showHelper) {
            const userLogo = <img src={defAvatarImg}/>;
            generalHelperContent = [
                <div key={1} className={`contact-member-item`}
                     data-sessionid={1} onClick={this.handleMemberItemClick.bind(this)}>
                    <div className={`session-logo`}>
                        {userLogo}
                        <i className="status-indicator"/>
                    </div>
                    <div className="session-detail">
                        <div className="session-detail-first">
                            <div className="session-name">{contactLocale.transferAssitant}</div>
                        </div>
                    </div>
                </div>,
                <div key={2} className={`contact-member-item`}
                     data-sessionid={2} onClick={this.handleMemberItemClick.bind(this)}>
                    <div className={`session-logo`}>
                        {userLogo}
                        <i className="status-indicator"/>
                    </div>
                    <div className="session-detail">
                        <div className="session-detail-first">
                            <div className="session-name">{contactLocale.deskmoTeam}</div>
                        </div>
                    </div>
                </div>
            ];
        }


        return (
            <div className="contact">
                <div className="contact-member">
                    <div className="head" onClick={this.handleContactClick.bind(this, 'member')}>
                        <span>Instanza</span>
                        <span className="s2">{`(${teamMembersCount})`}</span>
                        <i className={`ficon ${this.state.showMember ? 'ficon_caret_down': 'ficon_caret_right'}`}/>
                    </div>
                    {contactMemberContent}
                </div>
                <div className="contact-group" >
                    <div className="head" onClick={this.handleContactClick.bind(this, 'group')}>
                        <span>{contactLocale.favoriteGroups}</span>
                        <span className="s2">{`(${channelList.size})`}</span>
                        <i className={`ficon ${this.state.showGroup ? 'ficon_caret_down': 'ficon_caret_right'}`}/>
                    </div>
                    {contactGroupContent}
                </div>
                <div className="general-helper" >
                    <div className="head" onClick={this.handleContactClick.bind(this, 'helper')}>
                        <span>{contactLocale.generalHelper}</span>
                        <i className={`ficon ${this.state.showHelper ? 'ficon_caret_down': 'ficon_caret_right'}`}/>
                    </div>
                    {generalHelperContent}
                </div>
            </div>
        );
    }
}



@exposeLocale(['CONTACT'])
export default class ContactComposer extends PureRenderComponent {
    static propTypes = {
        sessionid: ReactPropTypes.string,
        channelList: ReactPropTypes.ofSchema(ChannelListSchema).isRequired,
        teamMembers: ReactPropTypes.ofSchema(TeamMemberListSchema).isRequired,
        onChangeSessionid: ReactPropTypes.func
    }

    render() {
        return <ContactView {..._.pick(this.props, ['channelList', 'teamMembers', 'sessionid'])} contactLocale={this.state.locale} onChangeSessionid={this.props.onChangeSessionid}/>;
    }
}
