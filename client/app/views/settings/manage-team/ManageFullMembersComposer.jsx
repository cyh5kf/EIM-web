import React from 'react';
import _ from 'underscore';
import PureRenderComponent from '../../../components/PureRenderComponent';
import Loading from '../../../components/loading/Loading';
import Select from '../../../components/rc-select/Select';
import Button from '../../../components/button/Button';
import TeamMembersStore from '../../../core/stores/TeamMembersStore';
import {TeamMemberListSchema, TeamMemberSchema} from '../../../core/schemas/TeamMembersSchema';
import ReactPropTypes from '../../../core/ReactPropTypes';
import SearchInput from '../../../components/search-input/SearchInput';
import EnumRoleId from '../../../core/enums/EnumRoleId';
import EnumMemberStatus from '../../../core/enums/EnumMemberStatus';
import {QueryTeamMembersCmd, UpdateMemberRoleCmd, UpdateMemberStatusCmd} from '../../../core/commands/TeamMembersCommands';
import exposePendingCmds from '../../view-components/exposePendingCmds';
import exposeStoreData from '../../view-components/exposeStoreData';

import './ManageFullMembersView.less';

class MemberItem extends PureRenderComponent {
    static propTypes = {
        member: ReactPropTypes.ofSchema(TeamMemberSchema).isRequired,
        showActions: ReactPropTypes.bool.isRequired,
        toggleSelected: ReactPropTypes.func.isRequired,
        locale: ReactPropTypes.object.isRequired,
        roleUpdating: ReactPropTypes.bool.isRequired,
        statusUpdating: ReactPropTypes.bool.isRequired
    }
    handleClick = () => this.props.toggleSelected(this.props.member)
    handleSetRoleBtnClick = e => {
        e.stopPropagation();
        const {roleUpdating, member} = this.props,
            targetRole = Number(e.target.dataset.targetRole);
        !roleUpdating && UpdateMemberRoleCmd({
            originStatus: member.status,
            targetUid: member.uid,
            role: targetRole
        });
    }
    handleSetStatusClick = e => {
        e.stopPropagation();
        const {statusUpdating, member} = this.props,
            targetStatus = Number(e.target.dataset.targetStatus);
        !statusUpdating && UpdateMemberStatusCmd({
            originStatus: member.status,
            targetUid: member.uid,
            status: targetStatus
        });
    }
    getActions() {
        const {member, locale: {MANAGE_TEAM: mtLocale}} = this.props;
        if (member.status === EnumMemberStatus.Enabled) {
            const setRoleBtn = (roleId, label) => <Button key={`setRole-${roleId}`} className="button-simple" data-target-role={roleId} onClick={this.handleSetRoleBtnClick}>{label}</Button>;
            let buttons = [];
            if (member.role === EnumRoleId.Normal) {
                buttons = [
                    setRoleBtn(EnumRoleId.Admin, mtLocale['makeAsAdmin']),
                    setRoleBtn(EnumRoleId.Owner, mtLocale['makeAsOwner'])
                ];
            } else if (member.role === EnumRoleId.Admin) {
                buttons = [
                    setRoleBtn(EnumRoleId.Owner, mtLocale['makeAsOwner']),
                    setRoleBtn(EnumRoleId.Normal, mtLocale['removeAdminRole'])
                ];
            } else if (member.role === EnumRoleId.Owner) {
                buttons = [
                    setRoleBtn(EnumRoleId.Normal, mtLocale['removeOwnerRole'])
                ];
            }
            return buttons.concat([
                <div key="text-actions" className="right-actions">
                    <span className="action-text" data-target-status={EnumMemberStatus.Disabled} onClick={this.handleSetStatusClick}>{mtLocale['disableAccount']}</span>
                    <span className="action-text" onClick={() => alert('TODO...')}>{mtLocale['convertToGuest']}</span>
                </div>
            ])
        } else {
            return [
                <Button key="enable" className="button-simple" data-target-status={EnumMemberStatus.Enabled} onClick={this.handleSetStatusClick}>{mtLocale['enableAccount']}</Button>
            ];
        }
    }
    render() {
        const {member, showActions, roleUpdating, statusUpdating, locale: {MANAGE_TEAM: mtLocale}} = this.props;
        return (
            <div className="member-item" onClick={this.handleClick}>
                <div className="member-item-info clear-float">
                    <div className="member-avatar" style={member.avatar ? {background: `url(${member.avatar}) center/cover no-repeat`} : {}}></div>
                    <div className="member-details">
                        <div className="member-realname">{member.firstname}{member.lastname}</div>
                        <div>
                            <span className="member-username">@{member.username}</span>
                            <span className="dot-separator"/>
                            <span className="member-email">{member.email}</span>
                        </div>
                    </div>
                    <div className="member-role">
                        {member.role === EnumRoleId.Admin ? mtLocale['roleAdmin'] : (member.role === EnumRoleId.Owner ? mtLocale['roleOwner'] : mtLocale['roleMember'])}
                        <i className={`ficon ${showActions ? 'ficon_caret_down': 'ficon_caret_right'}`}/>
                    </div>
                </div>

                <div className={`member-item-actions clear-float ${!showActions ? 'gHidden' : ''}`}>
                    {this.getActions()}
                </div>
                {(roleUpdating || statusUpdating) && <Loading/>}
            </div>
        );
    }
}

class ManageFullMembersView extends PureRenderComponent {
    static propTypes = {
        teamMembers: ReactPropTypes.ofSchema(TeamMemberListSchema),
        pendingCmds: ReactPropTypes.pendingCmds.isRequired,
        targetStatus: ReactPropTypes.ofEnum(EnumMemberStatus).isRequired,
        locale: ReactPropTypes.object.isRequired
    }

    state = {
        filterType: 'username',
        searchText: '',
        selectedMemberUid: ''
    }

    _getFilterTypes() {
        const {locale} = this.props;
        return [{
            id: 'username',
            name: locale.COMMON['username']
        }, {
            id: 'realname',
            name: locale.COMMON['realName']
        }, {
            id: 'role',
            name: locale.MANAGE_TEAM.filterByRole
        }, {
            id: 'gmtcreate',
            name: locale.MANAGE_TEAM.filterByDate
        }]
    }

    handleFilterTypeChange = filterType => this.setState({filterType: filterType && filterType.id})
    handleSearchTextChange = searchText => this.setState({searchText: searchText})
    toggleMemberSelected = member => {
        const {selectedMemberUid} = this.state;
        this.setState({
            selectedMemberUid: selectedMemberUid === member.uid ? '' : member.uid
        });
    }

    render() {
        const {teamMembers, pendingCmds, locale} = this.props,
            {filterType, searchText, selectedMemberUid} = this.state,
            filterTypeInfos = this._getFilterTypes(),
            isLoading = pendingCmds.isPending(QueryTeamMembersCmd) || !teamMembers;

        let filteredMembers = teamMembers;
        if (filteredMembers) {
            if (searchText) {
                const lowercaseSearchText = searchText.toLowerCase();
                const searchPassed = text => text.toLowerCase().indexOf(lowercaseSearchText) !== -1;
                filteredMembers = filteredMembers.filter(member => {
                    return searchPassed(member.username) || searchPassed(member.firstname + member.lastname) || searchPassed(member.email);
                });
            }
            filteredMembers = filteredMembers.sortBy(member => member[filterType]);
        }

        return (
            <div className="manage-full-members">
                <div className="filter-toolbar clear-float">
                    <div className="filter-selector">
                        {locale.MANAGE_TEAM['sortBy']}
                        <Select datasource={filterTypeInfos} selectedDatasource={filterTypeInfos.find(typeInfo => typeInfo.id === filterType)}
                                onSelectedDatasourceChange={this.handleFilterTypeChange}
                                showSearch={false}/>
                    </div>
                    <SearchInput value={searchText} onValueChange={this.handleSearchTextChange} placeholder={locale.MANAGE_TEAM.searchPlaceholder}/>
                </div>
                <div className="team-member-list">
                    {isLoading ? <Loading/> : filteredMembers.map(member => <MemberItem key={member.uid} member={member} locale={locale}
                                                                                  showActions={selectedMemberUid === member.uid}
                                                                                  roleUpdating={pendingCmds.isPending(UpdateMemberRoleCmd, member.uid)}
                                                                                  statusUpdating={pendingCmds.isPending(UpdateMemberStatusCmd, member.uid)}
                                                                                  toggleSelected={this.toggleMemberSelected}/>)}
                </div>
            </div>
        );
    }
}


@exposePendingCmds([QueryTeamMembersCmd, UpdateMemberRoleCmd, UpdateMemberStatusCmd])
@exposeStoreData([
    [TeamMembersStore, () => ({
        teamMembers: TeamMembersStore.getTeamMembers(this.props.targetStatus)
    })]
])
export default class ManageFullMembersComposer extends PureRenderComponent {
    static propTypes = {
        targetStatus: ReactPropTypes.ofEnum(EnumMemberStatus).isRequired,
        locale: ReactPropTypes.object.isRequired
    }
    render() {
        return <ManageFullMembersView {..._.pick(this.state, ['teamMembers', 'pendingCmds'])} {..._.pick(this.props, ['targetStatus', 'locale'])}/>;
    }
}
