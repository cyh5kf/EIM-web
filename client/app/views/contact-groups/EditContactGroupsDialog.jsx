import React from 'react';
import immutable from 'immutable';
import moment from 'moment';
import FormControl from 'react-bootstrap/lib/FormControl';
import _ from 'underscore';

import PureRenderComponent from '../../components/PureRenderComponent';
import Loading from '../../components/loading/Loading';
import Button from '../../components/button/Button';
import Animator from '../../components/AnimatorInAndOut';
import exposeLocale from '../../components/exposeLocale';
import FullScreenDialog from '../../components/dialog/FullScreenDialog';
import UsersSelector from '../view-components/users-selector/UsersSelector';
import toast from '../../components/popups/toast';
import SearchInput from './../../components/search-input/SearchInput';
import ReactPropTypes from '../../core/ReactPropTypes';
import {ContactGroupListSchema, ContactGroupSchema} from '../../core/schemas/ContactGroupsSchemas';
import EnumContactGroupStatus from '../../core/enums/EnumContactGroupStatus';
import EnumSearchUserType from '../../core/enums/EnumSearchUserType';
import {addOrEditContactGroupCmd, updateContactGroupStatusCmd, queryContactGroupsCmd, queryGroupMembersCmd, updateGroupMembersCmd} from '../../core/commands/contactGroupsCommands';
import searchGroups from './searchGroups';

import './EditContactGroupsDialog.less';

const TAB_GROUP_LIST = 'group-list',
    TAB_ADD_GROUP = 'add-group',
    TAB_EDIT_GROUP = 'edit-group',
    TAB_EDIT_GROUP_MEMBERS = 'edit-group-members';

const ContactGroupsButtons = ({onConfirm, onCancel, confirmLabel, cancelLabel, submitting = false}) => (
    <div className="cg-buttons">
        <Button className="button-gray" onClick={onCancel}>{cancelLabel}</Button>
        <Button className="button-purple" loading={submitting} onClick={onConfirm}>{confirmLabel}</Button>
    </div>
);
ContactGroupsButtons.propTypes = {
    onConfirm: ReactPropTypes.func.isRequired,
    onCancel: ReactPropTypes.func.isRequired,
    confirmLabel: ReactPropTypes.string.isRequired,
    cancelLabel: ReactPropTypes.string.isRequired,
    submitting: ReactPropTypes.bool
};

class GroupEditorContent extends PureRenderComponent {
    static propTypes = {
        locale: ReactPropTypes.ofLocale().isRequired,
        editingGroup: ReactPropTypes.shape({
            name: ReactPropTypes.string.isRequired,
            desc: ReactPropTypes.string.isRequired,
            channel: ReactPropTypes.shape({
                channelId: ReactPropTypes.string.isRequired,
                channelName: ReactPropTypes.string.isRequired,
                ispublic: ReactPropTypes.bool.isRequired
            })
        }),
        onSwitchTab: ReactPropTypes.func.isRequired,
        onCancel: ReactPropTypes.func.isRequired,
        onSubmit: ReactPropTypes.func.isRequired,
        isSubmitting: ReactPropTypes.bool,
        okLabel: ReactPropTypes.string
    };
    userSearchTypes = [EnumSearchUserType.Channel]
    onSubmit = () => {
        const {isSubmitting = false, locale: {CONTACTGROUP: cgLocale}} = this.props;
        if (!isSubmitting) {
            const {name, desc, defaultChannel} = this.state;
            const data = {
                name: name.trim(),
                desc: desc.trim(),
                channel: defaultChannel && {
                    channelId: defaultChannel.id,
                    channelName: defaultChannel.name,
                    ispublic: defaultChannel.ispublic
                }
            }
            if (!data.name) {
                toast(cgLocale['warnInputGroupName']);
                return;
            }
            this.props.onSubmit(data);
        }
    };
    switchToGroupListTab = () => this.props.onSwitchTab(TAB_GROUP_LIST);
    componentWillMount() {
        const {editingGroup} = this.props;
        this.setState({
            name: editingGroup && editingGroup.name || '',
            desc: editingGroup && editingGroup.desc || '',
            defaultChannel: editingGroup && editingGroup.channel && {
                id: editingGroup.channel.channelId,
                name: editingGroup.channel.channelName,
                ispublic: editingGroup.channel.ispublic,
                userType: EnumSearchUserType.Channel
            }
        });
    }
    handleNameChange = e => this.setState({name: e.target.value});
    handleDescChange = e => this.setState({desc: e.target.value});
    handleSelectedChannelChange = selChannel => this.setState({defaultChannel: selChannel});
    render() {
        const {isSubmitting = false, onCancel, locale: {CONTACTGROUP: cgLocale, COMMON: commonLocale}, okLabel = commonLocale['okLabel']} = this.props,
            {name, desc, defaultChannel} = this.state;
        return (
            <div className="cg-tab tab-add-edit-group has-cg-buttons">
                <div className="tab-back-icon eim-deprecated eim-back-nor" onClick={this.switchToGroupListTab}></div>

                <div className="tab-setting-title">{cgLocale['groupName']}</div>
                <FormControl className="tab-setting-input group-name" value={name} onChange={this.handleNameChange}
                             type="text" placeholder={cgLocale['groupNameLong']} />
                <div className="tab-setting-hint">{cgLocale['groupNameHint']}</div>

                <div className="tab-setting-title">{cgLocale['groupDesc']}</div>
                <FormControl className="tab-setting-input group-desc" value={desc} onChange={this.handleDescChange}
                             type="text" placeholder={cgLocale['groupDescHint']}/>

                <div className="tab-setting-title">{cgLocale['groupDefaultMacroEmail']}</div>
                <UsersSelector userTypes={this.userSearchTypes} multiple={false} selectedUser={defaultChannel} onSelectedUserChange={this.handleSelectedChannelChange}/>
                <ContactGroupsButtons onCancel={onCancel} cancelLabel={commonLocale['cancelLabel']}
                                      onConfirm={this.onSubmit} confirmLabel={okLabel}
                                      submitting={isSubmitting}/>
            </div>
        );
    }
}


class TabGroupList extends PureRenderComponent {
    static propTypes = {
        locale: ReactPropTypes.ofLocale().isRequired,
        contactGroups: ReactPropTypes.ofSchema(ContactGroupListSchema),
        pendingCmds: ReactPropTypes.instanceOf(immutable.Map).isRequired,
        onSwitchTab: ReactPropTypes.func.isRequired,
        searchText: ReactPropTypes.string.isRequired,
        onSearchTextChange: ReactPropTypes.func.isRequired
    };
    switchToEditGroupTab = (editingGroup, {isEditingMembers = false} = {}) => this.props.onSwitchTab(isEditingMembers ? TAB_EDIT_GROUP_MEMBERS : TAB_EDIT_GROUP, {editingGroup});
    toggleGroupStatus = group => !this.props.pendingCmds.isPending(updateContactGroupStatusCmd, group.guuid) && updateContactGroupStatusCmd({
        guuid: group.guuid,
        status: group.status === EnumContactGroupStatus.Enabled ? EnumContactGroupStatus.Disabled : EnumContactGroupStatus.Enabled
    });
    filterGroups = (groups, searchText) => {
        this.setState({
            filteredGroups: searchGroups(groups, searchText)
        });
    };
    handleSearchTextChange = searchText => this.props.onSearchTextChange(searchText);
    componentWillMount() {
        this.filterGroups(this.props.contactGroups, this.props.searchText);
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.contactGroups !== nextProps.contactGroups || this.props.searchText !== nextProps.searchText) {
            this.filterGroups(nextProps.contactGroups, nextProps.searchText);
        }
    }
    render() {
        const {pendingCmds, searchText, locale: {CONTACTGROUP: cgLocale, COMMON: commonLocale}} = this.props,
            {filteredGroups} = this.state,
            content = pendingCmds.isPending(queryContactGroupsCmd) || !filteredGroups ? <Loading/> : (
                <div className="group-item-list">
                    {filteredGroups.map(group => {
                        const {guuid, name, username, time, desc, status, count} = group;
                        return status === EnumContactGroupStatus.Enabled ? (
                            <div key={guuid} className="group-item enabled-group">
                                <div className="group-item-title">
                                    <div className="group-name" dangerouslySetInnerHTML={{__html: name}}></div>
                                    <div className="group-name-alt">@<span dangerouslySetInnerHTML={{__html: name}}/></div>
                                    <div className="group-member-cnt"><i className="eim-deprecated eim-people-number"/> {count}</div>
                                    <div className="group-item-actions">
                                        <i className="group-item-act act-disable-group eim-deprecated eim-jinzhi" onClick={() => this.toggleGroupStatus(group)}/>
                                        <i className="group-item-act act-edit-group eim-deprecated eim-settingcopy" onClick={() => this.switchToEditGroupTab(group, {isEditingMembers: false})}/>
                                        <i className="group-item-act act-edit-group-members eim-deprecated eim-chengyuan" onClick={() => this.switchToEditGroupTab(group, {isEditingMembers: true})}/>
                                    </div>
                                </div>
                                {desc && <div className="group-desc">{desc}</div> || null}
                                <div className="group-creator">{username} {cgLocale['createdFrom']} {moment(time).format('YYYY-MM-DD')}</div>
                            </div>
                        ) : (
                            <div key={guuid} className="group-item disabled-group">
                                <div className="group-item-title">
                                    <div className="group-name" dangerouslySetInnerHTML={{__html: name}}></div>
                                    <div className="disabled-desc"> ({cgLocale['disabled']})</div>
                                    <div className="group-item-actions">
                                        <i className="group-item-act act-enable-group eim-deprecated eim-stop" onClick={() => this.toggleGroupStatus(group)}/>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        return (
            <div className="cg-tab tab-group-list">
                <SearchInput value={searchText} onValueChange={this.handleSearchTextChange} placeholder={commonLocale['search']}/>
                {content}
            </div>
        );
    }
}


class TabEditGroup extends PureRenderComponent {
    static propTypes = {
        locale: ReactPropTypes.ofLocale().isRequired,
        editingGroup: ReactPropTypes.ofSchema(ContactGroupSchema),
        onSwitchTab: ReactPropTypes.func.isRequired,
        pendingCmds: ReactPropTypes.instanceOf(immutable.Map).isRequired
    };
    handleSubmit = (changes) => {
        const {editingGroup} = this.props;
        addOrEditContactGroupCmd({
            guuid: editingGroup.guuid,
            name: changes.name,
            desc: changes.desc,
            defaultChannelId: changes.defaultChannelId
        }).then(this.switchToGroupListTab);
    };
    switchToGroupListTab = () => this.props.onSwitchTab(TAB_GROUP_LIST);
    render() {
        const {pendingCmds} = this.props;
        return <GroupEditorContent {..._.pick(this.props, ['editingGroup', 'locale', 'onSwitchTab'])}
            onCancel={this.switchToGroupListTab} onSubmit={this.handleSubmit} submitting={pendingCmds.isPending(addOrEditContactGroupCmd)}/>;
    }
}

class TabAddGroup extends PureRenderComponent {
    static propTypes = {
        locale: ReactPropTypes.ofLocale().isRequired,
        onSwitchTab: ReactPropTypes.func.isRequired,
        onClose: ReactPropTypes.func.isRequired,
        pendingCmds: ReactPropTypes.instanceOf(immutable.Map).isRequired
    };
    onGroupInfoFinished = groupInfo => this.setState({
        groupInfo: groupInfo,
        fillingBasicInfo: false
    })
    onMembersFinished = () => {
        const {pendingCmds, onSwitchTab} = this.props;
        if (!pendingCmds.isPending(addOrEditContactGroupCmd)) {
            const {groupInfo, selectedUsers} = this.state;
            addOrEditContactGroupCmd({
                name: groupInfo.name,
                desc: groupInfo.desc,
                defaultChannelId: groupInfo.defaultChannelId,
                uids: selectedUsers.map(user => user.id)
            }).then(() => onSwitchTab(TAB_GROUP_LIST));
        }
    }
    handleSelectedUsersChange = selectedUsers => this.setState({selectedUsers});
    componentWillMount() {
        this.setState({
            groupInfo: null,
            fillingBasicInfo: true,
            selectedUsers: []
        });
    }
    renderAddGroupMembers() {
        const {onClose, locale: {CONTACTGROUP: cgLocale, COMMON: commonLocale}, pendingCmds} = this.props,
            {selectedUsers} = this.state;
        return (
            <div className="cg-tab tab-edit-group-members has-cg-buttons">
                <div className="tab-header">
                    <div className="tab-back-icon eim-deprecated eim-back-nor" onClick={() => this.setState({fillingBasicInfo: true})}></div>
                    {cgLocale['groupMembers']} ({selectedUsers.length})
                </div>
                <UsersSelector selectedUser={selectedUsers} onSelectedUserChange={this.handleSelectedUsersChange}/>
                <ContactGroupsButtons onCancel={onClose} cancelLabel={commonLocale['cancelLabel']}
                                      onConfirm={this.onMembersFinished} confirmLabel={cgLocale['addGroupBtnLabel']}
                                      submitting={pendingCmds.isPending(addOrEditContactGroupCmd)}/>
            </div>
        );
    }
    render() {
        const {onClose, locale} = this.props,
            {fillingBasicInfo, groupInfo} = this.state;
        return (
            <span className="tab-add-group cg-tab">
                <Animator key="group-basic-info" className="creating-group-info-animator">
                    {fillingBasicInfo && <GroupEditorContent {..._.pick(this.props, ['locale', 'onSwitchTab'])}
                        onCancel={onClose} onSubmit={this.onGroupInfoFinished} editingGroup={groupInfo}
                        okLabel={locale.CONTACTGROUP['updateGroupMembersBtnLabel']}/>}
                </Animator>

                <Animator key="group-members" className="creating-group-members-animator">
                    {!fillingBasicInfo && this.renderAddGroupMembers()}
                </Animator>
            </span>
        );
    }
}


class TabEditGroupMembers extends PureRenderComponent {
    static propTypes = {
        locale: ReactPropTypes.ofLocale().isRequired,
        editingGroup: ReactPropTypes.ofSchema(ContactGroupSchema).isRequired,
        onSwitchTab: ReactPropTypes.func.isRequired,
        pendingCmds: ReactPropTypes.instanceOf(immutable.Map).isRequired
    };
    onSubmit = () => {
        const {editingGroup, pendingCmds} = this.props;
        if (!pendingCmds.isPending(updateGroupMembersCmd)) {
            const {selectedUsers} = this.state;
            updateGroupMembersCmd({
                guuid: editingGroup.guuid,
                uids: selectedUsers.map(user => user.id)
            }).then(this.switchToGroupListTab);
        }
    };
    switchToGroupListTab = () => this.props.onSwitchTab(TAB_GROUP_LIST);
    handleSelectedUsersChange = selectedUsers => this.setState({selectedUsers});
    initSelectedUsers = (props) => this.setState({
        selectedUsers: props.editingGroup.members.toJS().map(mem => ({
            userType: EnumSearchUserType.User,
            id: mem.uid,
            name: mem.username
        }))
    });
    componentWillMount() {
        if (!this.props.editingGroup.members) {
            this.setState({
                selectedUsers: null
            });
            const {guuid} = this.props.editingGroup;
            queryGroupMembersCmd({guuid});
        } else {
            this.initSelectedUsers(this.props);
        }
    }
    componentWillReceiveProps(nextProps) {
        if (!this.props.editingGroup.members && nextProps.editingGroup.members) {
            this.initSelectedUsers(nextProps);
        }
    }
    render() {
        const {locale: {CONTACTGROUP: cgLocale, COMMON: commonLocale}, editingGroup, pendingCmds} = this.props,
            {selectedUsers} = this.state;
        return (
            <div className="cg-tab tab-edit-group-members has-cg-buttons">
                <div className="tab-header">
                    <div className="tab-back-icon eim-deprecated eim-back-nor" onClick={this.switchToGroupListTab}></div>
                    {cgLocale['groupMembers']} ({selectedUsers ? selectedUsers.length : editingGroup.count})
                </div>
                {selectedUsers ? <UsersSelector selectedUser={selectedUsers} onSelectedUserChange={this.handleSelectedUsersChange}/> : <Loading/>}

                <ContactGroupsButtons onCancel={this.switchToGroupListTab} cancelLabel={commonLocale['cancelLabel']}
                                      onConfirm={this.onSubmit} confirmLabel={commonLocale['okLabel']}
                                      submitting={pendingCmds.isPending(updateGroupMembersCmd)}/>
            </div>
        );
    }
}


@exposeLocale()
export default class EditContactGroupsDialog extends FullScreenDialog {
    static propTypes = {
        ...FullScreenDialog.propTypes,
        contactGroups: ReactPropTypes.ofSchema(ContactGroupListSchema),
        pendingCmds: ReactPropTypes.instanceOf(immutable.Map).isRequired,
        isCreating: ReactPropTypes.bool.isRequired,
        refetchGroups: ReactPropTypes.bool.isRequired
    };
    static defaultProps = {
        ...FullScreenDialog.defaultProps,
        className: 'dlg-edit-contact-group',
        hiddenFooter: true
    };

    onClose = () => this.close();
    switchTab = (tab, options) => {
        this.setState({displayingTab: tab});
        if (tab === TAB_EDIT_GROUP || tab === TAB_EDIT_GROUP_MEMBERS) {
            this.setState({
                editingGroupId: options.editingGroup.guuid
            });
        }
    };

    handleAddGroupClick = () => this.switchTab(TAB_ADD_GROUP);
    handleSearchTextChange = searchText => this.setState({searchText});

    componentWillMount() {
        super.componentWillMount(...arguments);
        const {isCreating, refetchGroups} = this.props;
        this.setState({
            displayingTab: isCreating ? TAB_ADD_GROUP : TAB_GROUP_LIST,
            editingGroupId: '',
            disableAnimation: true,
            searchText: ''
        }, () => {
            setTimeout(() => this.setState({
                disableAnimation: false
            }), 300);
        });

        refetchGroups && queryContactGroupsCmd();
    }

    renderContent() {
        const {contactGroups, pendingCmds} = this.props,
            {displayingTab, editingGroupId, searchText, locale, disableAnimation} = this.state,
            editingGroup = contactGroups && contactGroups.find(group => group.guuid === editingGroupId),
            commonProps = {
                pendingCmds,
                locale,
                onSwitchTab: this.switchTab,
                onClose: this.onClose
            };

        let TabEditComponent = null,
            tabEditCompProps = {};
        switch (displayingTab) {
            case TAB_ADD_GROUP:
                TabEditComponent = TabAddGroup;
                break;
            case TAB_EDIT_GROUP:
                TabEditComponent = TabEditGroup;
                tabEditCompProps = {editingGroup};
                break;
            case TAB_EDIT_GROUP_MEMBERS:
                TabEditComponent = TabEditGroupMembers;
                tabEditCompProps = {editingGroup};
        }
        return [
            <h1 key="ttl">
                {displayingTab === TAB_ADD_GROUP ? locale.CONTACTGROUP['dlgTitleAddGroup'] : locale.CONTACTGROUP['dlgTitleEditGroups']}
                {displayingTab === TAB_GROUP_LIST && <Button className="button-green" onClick={this.handleAddGroupClick}>{locale.CONTACTGROUP['addGroupBtnLabel']}</Button>}
            </h1>,
            <div key="ct" className={`settings-content ${disableAnimation ? 'disable-animation' : ''}`}>
                <Animator key="list-tab" className="list-tab-animator">
                    {displayingTab === TAB_GROUP_LIST && <TabGroupList contactGroups={contactGroups} searchText={searchText}
                                                                       onSearchTextChange={this.handleSearchTextChange} {...commonProps}/>}
                </Animator>

                <Animator key="edit-tab" className="edit-tab-animator">
                    {displayingTab !== TAB_GROUP_LIST && <TabEditComponent {...commonProps} {...tabEditCompProps}/>}
                </Animator>
            </div>
        ];
    }
}
