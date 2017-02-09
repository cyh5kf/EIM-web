import React from 'react';
import PureRenderComponent from '../../components/PureRenderComponent';
import NavTabs from '../../components/nav-tabs/NavTabs';
import {TeamMemberListSchema, TeamMemberSchema} from '../../core/schemas/TeamMembersSchema';
import {ContactGroupListSchema, ContactGroupSchema} from '../../core/schemas/ContactGroupsSchemas';
import {queryContactGroupsCmd} from '../../core/commands/contactGroupsCommands';
import SearchInput from '../../components/search-input/SearchInput';
import ReactPropTypes from '../../core/ReactPropTypes';
import SettingsPage from '../settings/SettingsPage';
import QueryUserInfoCommand from '../../core/commands/channel/QueryUserInfoCommand';
import {SwitchRightPanelCmd} from '../../core/commands/RightPanelConfigCommands';
import EnumRightPanelType from '../../core/enums/EnumRightPanelType';
import EditContactGroupsDlgComposer from '../contact-groups/EditContactGroupsDlgComposer';
import OnlineStatusIndicator from '../view-components/online-status-indicator/OnlineStatusIndicator';

import './TeamDirectoryView.less';

class TeamMemberItem extends PureRenderComponent {
    static propTypes = {        
        member: ReactPropTypes.ofSchema(TeamMemberSchema).isRequired,
        renderItemExtra: ReactPropTypes.func
    }

    onViewProfile=()=>{
        QueryUserInfoCommand({uid:this.props.member.uid,callback:this.getCurrentUser.bind(this)});        
    }

    getCurrentUser=(data)=>{
        SwitchRightPanelCmd(EnumRightPanelType.USER_PROFILE, {
            uid: data.uid
        });
    }

    render() {
        const {member: {username, firstname, lastname, avatar,title, loginstatus}, renderItemExtra} = this.props;
        return (
            <div className="team-member-item clear-float" onClick={this.onViewProfile}>
                <div className="member-avatar" style={avatar ? {background: `url(${avatar}) center/cover no-repeat`} : {}}></div>
                <div className="member-details">
                    <div className="member-username">{firstname}{lastname}</div>
                    <div className="member-realname">@{username}<OnlineStatusIndicator onlineStatus={loginstatus}/></div>
                    {!!title && <div className="member-title">{title}</div>}
                </div>
                {!!renderItemExtra && renderItemExtra(this.props.member)}
            </div>
        );
    }
}

class GroupItem extends PureRenderComponent {
    static propTypes = {
        group: ReactPropTypes.ofSchema(ContactGroupSchema).isRequired,
        locale: ReactPropTypes.ofLocale()
    }

    handleClick = () => {

        //SwitchRightPanelCmd(EnumRightPanelType.USER_GROUP, {
        //    contactGroup: this.props.group.toJS()
        //})

    }

    render() {
        const {group: {name, desc, count}, locale} = this.props;
        return (
            <div className="contact-group-item" onClick={this.handleClick}>
                <div className="group-name">{name}</div>
                <div className="group-desc">{desc}</div>
                <div className="group-more-info">{count} {locale.CONTACTGROUP.groupMembers} - @{name}</div>
            </div>
        )
    }
}

export default class TeamDirectoryView extends PureRenderComponent {
    static propTypes = {
        enabledMembers: ReactPropTypes.ofSchema(TeamMemberListSchema).isRequired,
        disabledMembers: ReactPropTypes.ofSchema(TeamMemberListSchema).isRequired,
        contactGroups: ReactPropTypes.ofSchema(ContactGroupListSchema).isRequired,
        locale: ReactPropTypes.ofLocale().isRequired,
        className: ReactPropTypes.string
    };
    static defaultProps = {
        className: 'rightside-team-directory'
    }

    static TAB_ENABLED_MEMBERS = 'enabled-members'
    static TAB_DISABLED_MEMBERS = 'disabled-members'
    static TAB_USER_GROUPS = 'user-groups'

    componentWillMount() {
        this.setState({
            currentTab: TeamDirectoryView.TAB_ENABLED_MEMBERS,
            searchText: ''
        });
    }

    openManageTeamSetingsPage = () => SettingsPage.openSettingsPage('manage-team')
    handleTabSelected = currentTab => {
        this.setState({currentTab});
        if (currentTab === TeamDirectoryView.TAB_USER_GROUPS) {
            // 每次打开群组页时重新请求数据
            queryContactGroupsCmd();
        }
    }
    handleSearchChange = searchText => this.setState({searchText})
    handleEditGroupsClick = () => EditContactGroupsDlgComposer.open();
    handleAddGroupClick = () => EditContactGroupsDlgComposer.open({isCreating: true});
    handleCloseClick = () => SwitchRightPanelCmd(EnumRightPanelType.HIDE_PANEL)

    renderHeader() {
        const {locale: {TEAM_DIRECTORY: myLocale}} = this.props;
        return (
            <div className="header team-directory-header">
                {myLocale['title']}
                <div className="actions-container">
                    <i className="btn-opt team-setting-icon" onClick={this.openManageTeamSetingsPage}/>
                    <i className="btn-opt icon icon-global-button-action-closeblack" onClick={this.handleCloseClick}/>
                </div>
            </div>
        );
    }

    renderNavTabs() {
        const {enabledMembers, disabledMembers, contactGroups, locale: {TEAM_DIRECTORY: myLocale}} = this.props,
            tabItems = [
                {key: TeamDirectoryView.TAB_ENABLED_MEMBERS, label: myLocale.tabEnabledMembers + ` (${enabledMembers.size})`},
                {key: TeamDirectoryView.TAB_USER_GROUPS, label: myLocale.tabUserGroups + ` (${contactGroups.size})`},
                {key: TeamDirectoryView.TAB_DISABLED_MEMBERS, label: myLocale.tabDisabledMembers + ` (${disabledMembers.size})`}
            ];
        return <NavTabs activeKey={this.state.currentTab} items={tabItems} onSelect={this.handleTabSelected}/>;
    }

    renderMemberItemExtra(member) {
        return null;
    }

    renderContentExtra() {
        const {locale: {TEAM_DIRECTORY: myLocale}} = this.props,
            {currentTab} = this.state;
        if (currentTab === TeamDirectoryView.TAB_DISABLED_MEMBERS) {
            return (
                <div className="disabled-members-guide td-bordered-block">
                    <div className="guide-tip">{myLocale.disabledMembersTip}</div>
                    <a onClick={this.openManageTeamSetingsPage}><b>{myLocale.disabledMembersActionText}</b></a>
                </div>
            );
        } else {
            return null;
        }
    }

    render() {
        const {enabledMembers, disabledMembers, contactGroups, className, locale} = this.props,
            {currentTab, searchText} = this.state,
            lowercaseSearchText = searchText.toLowerCase();
        let itemListPrevContent = null;
        let itemList = [];
        switch (currentTab) {
            case TeamDirectoryView.TAB_ENABLED_MEMBERS:
            case TeamDirectoryView.TAB_DISABLED_MEMBERS: {
                const searchPassed = text => text.toLowerCase().indexOf(lowercaseSearchText) !== -1;
                (currentTab === TeamDirectoryView.TAB_ENABLED_MEMBERS ? enabledMembers : disabledMembers).forEach(member => {
                    if (searchPassed(member.username) || searchPassed(member.firstname + member.lastname) || searchPassed(member.email)) {
                        itemList.push(<TeamMemberItem key={member.uid} member={member} renderItemExtra={this.renderMemberItemExtra}/>);
                    }
                })
                break;
            }
            case TeamDirectoryView.TAB_USER_GROUPS: {
                const searchPassed = group => group.name.toLowerCase().indexOf(lowercaseSearchText) !== -1;
                contactGroups.forEach(group => {
                    if (searchPassed(group)) {
                        itemList.push(<GroupItem key={group.guuid} group={group} locale={locale}/>);
                    }
                });
                itemListPrevContent = (
                    <div className="user-groups-actions">
                        <div className="group-action" onClick={this.handleEditGroupsClick}><i className="ficon ficon_cog_o"/>{locale.TEAM_DIRECTORY.editUserGroups}</div>
                        <div className="group-action" onClick={this.handleAddGroupClick}><i className="ficon ficon_plus_circle"/>{locale.TEAM_DIRECTORY.createUserGroups}</div>
                    </div>
                );
            }
        }

        return (
            <div className={`min-panel-view team-directory ${className || ''}`}>
                {this.renderHeader()}
                {this.renderNavTabs()}
                <div className="team-directory-content">
                    <div className="search-input-wrapper">
                        <SearchInput value={searchText} onValueChange={this.handleSearchChange} placeholder={locale.TEAM_DIRECTORY.searchPlaceholder}/>
                    </div>
                    {itemListPrevContent}
                    <div className="item-list">
                        {itemList}
                    </div>
                    {this.renderContentExtra()}
                </div>
            </div>
        );
    }
}
