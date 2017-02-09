import React from 'react';
import _ from 'underscore';
import PureRenderComponent from '../../../components/PureRenderComponent';
import Select from '../../../components/rc-select/Select';
import StringUtils from '../../../utils/StringUtils';
import SearchStore from '../../../core/stores/SearchStore';
import TeamMembersStore, {TEAM_MEMBERS_EVENTS} from '../../../core/stores/TeamMembersStore';
import ContactGroupsStore, {EVENTS as ContactGroupsEvents} from '../../../core/stores/ContactGroupsStore';
import {searchUserCmd} from '../../../core/commands/searchUserCommands';
import {SearchUserListSchema} from '../../../core/schemas/SearchStoreSchemas';
import EnumSearchUserType from '../../../core/enums/EnumSearchUserType';
import ReactPropTypes from '../../../core/ReactPropTypes';
import exposeLocale from '../../../components/exposeLocale';
import OnlineStatusIndicator from '../online-status-indicator/OnlineStatusIndicator';

import './UsersSelector.less';

const SEL_USER_PROP_TYPE = ReactPropTypes.shape({
    id: ReactPropTypes.string.isRequired,
    name: ReactPropTypes.string.isRequired,
    mail:ReactPropTypes.string,
    userType: ReactPropTypes.ofEnum(EnumSearchUserType)
});

@exposeLocale()
export default class UsersSelector extends PureRenderComponent {
    static propTypes = {
        selectedUser: ReactPropTypes.oneOfType([SEL_USER_PROP_TYPE, ReactPropTypes.arrayOf(SEL_USER_PROP_TYPE)]),
        onSelectedUserChange: ReactPropTypes.func.isRequired, // param: (selUser: Array.<USER> | USER)
        userTypes: ReactPropTypes.arrayOf(ReactPropTypes.ofEnum(EnumSearchUserType)), // 搜索的用户类型

        multiple: ReactPropTypes.bool, // 是否多选
        idField: ReactPropTypes.string,
        placeholder: ReactPropTypes.string,
        alwaysShowPopup: ReactPropTypes.bool,
        getPopupContainer: ReactPropTypes.func,
        autoFocus: ReactPropTypes.bool,
        filterResultsDatasource: ReactPropTypes.func, // 过滤搜索结果可选集合, 参数 (datasource)
        defaultDatasource: ReactPropTypes.ofSchema(SearchUserListSchema, {isImmutable: false}) // 当没有输入也没有选中任何东西时的默认显示列表
    };
    static defaultProps = {
        userTypes: [EnumSearchUserType.User],
        filterResultsDatasource: datasource => datasource,
        multiple: true,
        idField: 'id'
    };
    constructor() {
        super(...arguments);
        this._searchUserSlice = _.uniqueId('searchSlice_');
    }

    handleSearch = searchText => {
        const {userTypes} = this.props;
        if (userTypes.indexOf(EnumSearchUserType.Channel) !== -1) {
            searchUserCmd({
                slice: this._searchUserSlice,
                userTypes: [EnumSearchUserType.Channel],
                keyword: searchText
            });
        }
        this.setState({searchText});
    };

    handleSelectedUsersChange = selUserOrUsers => this.props.onSelectedUserChange(selUserOrUsers);

    updateAvailableUsers = () => {
        const {userTypes, filterResultsDatasource} = this.props;
        let results = null;

        if (userTypes.indexOf(EnumSearchUserType.User) !== -1) {
            const members = TeamMembersStore.getTeamMembers();
            results = (results || []).concat((members && members.toJS() || []).map(member => ({
                userType: EnumSearchUserType.User,
                id: member.uid,
                name: member.username,
                logo: member.avatar,
                createDate: member.gmtcreate,
                title: member.title,
                mail: member.email,
                loginstatus: member.loginstatus
            })));
        }

        if (userTypes.indexOf(EnumSearchUserType.ContactGroup) !== -1) {
            const groups = ContactGroupsStore.getContactGroups();
            results = (results || []).concat((groups && groups.toJS() || []).map(group => ({
                userType: EnumSearchUserType.ContactGroup,
                id: group.guuid,
                name: group.name
            })));
        }

        if (userTypes.indexOf(EnumSearchUserType.Channel) !== -1) {
            const searchedChannels = SearchStore.getSearchUserList(this._searchUserSlice);
            if (searchedChannels) {
                results = (results || []).concat(searchedChannels.toJS().map(channel => ({
                    ...channel,
                    name: StringUtils.htmlToText(channel.name)
                })));
            }
        }
        
        results = results && (_.sortBy(results, 'name'));

        results = results && filterResultsDatasource(results);

        this.setState({
            datasource: results
        });
    };

    componentWillMount() {
        this.handleSearch('');
        this.updateAvailableUsers();
        SearchStore.addSearchUserListener(this.updateAvailableUsers, this._searchUserSlice);
        TeamMembersStore.addEventListener(TEAM_MEMBERS_EVENTS.ON_CHANGE, this.updateAvailableUsers);
        ContactGroupsStore.addEventListener(ContactGroupsEvents.CHANGE, this.updateAvailableUsers);
    }

    componentWillUnmount() {
        SearchStore.removeSearchUserListener(this.updateAvailableUsers, this._searchUserSlice);
        TeamMembersStore.removeEventListener(TEAM_MEMBERS_EVENTS.ON_CHANGE, this.updateAvailableUsers);
        ContactGroupsStore.removeEventListener(ContactGroupsEvents.CHANGE, this.updateAvailableUsers);
    }

    renderInput(data) {
        let userType = data.userType === EnumSearchUserType.Channel?'is_channel':'';
        let simpol = data.ispublic?'#':'';
        return (
            <div className={`selected-item ${userType}`}>
                {data.userType === EnumSearchUserType.Channel && simpol}
                {data.userType === EnumSearchUserType.User && <i className="user-avatar" style={data.logo ? {backgroundImage: `url(${data.logo})`} : {}}/>}
                {data.name}
            </div>
        );
    }

    renderOptionInfo = (data) => {
        const {userType} = data;
        if (userType === EnumSearchUserType.User) {
            return (
                <div className="user-info">
                    <div className="user-info-main-label user-info-name">{data.firstname + data.lastname}</div>
                    <div className="user-info-second-label user-info-email">{data.name}</div>
                </div>
            );
        } else {
            return <div className="group-chat-name">{data.ispublic?'#':''}{data.name}</div>
        }
    }

    renderOption = (data) => {
        const {userType = this.props.userTypes[0]} = data;
        if (userType === EnumSearchUserType.User) {
            return (
                <div className="user-info-item clear-float">
                    <div className="item-logo" style={data.logo ? {backgroundImage: `url(${data.logo})`} : {}}>
                        <OnlineStatusIndicator onlineStatus={data.loginstatus}/>
                    </div>
                    {this.renderOptionInfo(data)}
                </div>
            );
        } else {
            return (
                <div className="group-chat-item">
                    {this.renderOptionInfo(data)}
                </div>
            );
        }
    }

    filterOption(searchText, {name, firstname, lastname, userType}) {
        if (userType === EnumSearchUserType.Channel) {
            // 频道数据来自实时搜索, 不做过滤
            return true;
        }
        searchText = searchText.toLowerCase();
        const realName = firstname + lastname;
        return name.toLowerCase().indexOf(searchText) !== -1 || (realName && realName.toLowerCase().indexOf(searchText) !== -1);
    }

    render() {
        const {selectedUser, idField, multiple, defaultDatasource} = this.props,
            {datasource, searchText, locale} = this.state,
            hasSelected = multiple ? selectedUser && !!selectedUser.length : false,
            displayDatasource = (defaultDatasource && !hasSelected && !searchText) ? defaultDatasource : datasource;
        return <Select ref="select" className="users-selector" dropdownClassName="users-selector-dropdown"
                       filterOption={this.filterOption}
                       datasource={displayDatasource} selectedDatasource={selectedUser}
                       valueField={idField} labelField="name"
                       onSelectedDatasourceChange={this.handleSelectedUsersChange}
                       onSearch={this.handleSearch} renderOption={this.renderOption} renderInput={this.renderInput}
                       notFoundContent={StringUtils.format(locale.USERS_SELECTOR['notFound'], searchText)}
            {..._.pick(this.props, ['multiple', 'placeholder', 'alwaysShowPopup', 'getPopupContainer', 'autoFocus'])}/>;
    }
}
