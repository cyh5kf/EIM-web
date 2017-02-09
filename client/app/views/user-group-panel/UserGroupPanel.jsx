import React from 'react';
import moment from 'moment';
import PureRenderComponent from '../../components/PureRenderComponent';
import exposeLocale from '../../components/exposeLocale';
import NavTabs from '../../components/nav-tabs/NavTabs';
import StringUtils from '../../utils/StringUtils';
import EnumRightPanelType from '../../core/enums/EnumRightPanelType';
import {ContactGroupSchema} from '../../core/schemas/ContactGroupsSchemas';
import SwitchChannelCmd from '../../core/commands/channel/SwitchChannelCmd';
import {SwitchRightPanelCmd} from '../../core/commands/RightPanelConfigCommands';
import ReactPropTypes from '../../core/ReactPropTypes';

import './UserGroupPanel.less';

const
    TAB_MEMBERS = 'members',
    TAB_CHANNEL = 'channel';

@exposeLocale()
export default class UserGroupPanel extends PureRenderComponent {
    static propTypes = {
        contactGroup: ReactPropTypes.ofSchema(ContactGroupSchema).isRequired
    }

    handleMemberItemClick = e => {
        SwitchRightPanelCmd(EnumRightPanelType.USER_PROFILE, {
            uid: e.currentTarget.dataset.memberUid
        });
    }
    renderMembersTab() {
        const {contactGroup: {members}} = this.props;
        return (
            <div className="user-members-tab">
                {members.map(({uid, avatar, firstname, lastname, username}) => (
                    <div key={uid} className="group-member-item clear-float" data-member-uid={uid} onClick={this.handleMemberItemClick}>
                        <div className="member-avatar" style={avatar ? {backgroundImage: `url(${avatar})`} : {}}></div>
                        <div className="member-details">
                            <div className="member-realname">{firstname} {lastname}</div>
                            <div className="member-username">@{username} <i className="online-status-indicator online"/></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    handleChannelItemClick = e => {
        const channelId = e.currentTarget.dataset.channelid;
        SwitchChannelCmd({sessionid: channelId});
    }
    renderChannelTab() {
        const {contactGroup} = this.props,
            {locale} = this.state;
        return (
            <div className="default-channels-tab">
                {(contactGroup.channel ? [contactGroup.channel] : []).map(channel => {
                    const creatorName = channel.channelCreatorInfo.firstname + channel.channelCreatorInfo.lastname;
                    return (
                        <div key={channel.channelId} className="group-channel-item" data-channelid={channel.channelId} onClick={this.handleChannelItemClick}>
                            <div className="channel-name">{channel.channelName}</div>
                            <div className="create-tip">{StringUtils.formatAsReact(locale.USER_GROUP.createTip, () => <b>{creatorName}</b>, () => moment(channel.channelCreateTime).format('LL'))}</div>
                        </div>
                    );
                })}
            </div>
        );
    }

    handleBackClick = () => SwitchRightPanelCmd(EnumRightPanelType.TEAM_DIRECTORY)
    handleCloseClick = () => SwitchRightPanelCmd(EnumRightPanelType.HIDE_PANEL)

    handleTabSelect = activeKey => this.setState({displayTab: activeKey})

    componentWillMount() {
        this.setState({
            displayTab: TAB_MEMBERS
        });
    }

    render() {
        const {contactGroup: {name, desc, time, username, members, channel}} = this.props,
            {displayTab, locale} = this.state,
            navTabItems = [{
                key: TAB_MEMBERS,
                label: `${locale.USER_GROUP.tabMembers} (${members.size})`
            }, {
                key: TAB_CHANNEL,
                label: `${locale.USER_GROUP.tabChannels} (${channel ? 1 : 0})`
            }];
        let tabContent = null;
        switch (displayTab) {
            case TAB_MEMBERS:
                tabContent = this.renderMembersTab();
                break;
            case TAB_CHANNEL:
                tabContent = this.renderChannelTab();
                break;
        }
        return (
            <div className="user-group-panel">
                <div className="user-group-panel-title">
                    <span className="panel-title-label" onClick={this.handleBackClick}>
                        <i className="ficon ficon_chevron_medium_left"/>
                        {locale.TEAM_DIRECTORY.title}
                    </span>
                    <i className="icon-close ficon ficon_delete" onClick={this.handleCloseClick}/>
                </div>
                <div className="user-group-info">
                    <h3 className="group-name">{name}</h3>
                    <p className="notify-tip">{StringUtils.formatAsReact(locale.USER_GROUP.notifyTip, () => <b>@{name}</b>)}</p>
                    <p className="create-tip">{StringUtils.formatAsReact(locale.USER_GROUP.createTip, () => <b>{username}</b>, () => moment(time).format('LL'))}</p>
                    <p className="group-desc">{desc}</p>
                </div>
                <NavTabs items={navTabItems} activeKey={displayTab} onSelect={this.handleTabSelect}/>
                {tabContent}
            </div>
        );
    }
}
