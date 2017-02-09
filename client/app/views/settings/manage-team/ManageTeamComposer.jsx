import React, {PropTypes} from 'react';
import _ from 'underscore';
import Button from '../../../components/button/Button';
import PureRenderComponent from '../../../components/PureRenderComponent';
import exposeLocale from '../../../components/exposeLocale';
import exposeStoreData from '../../view-components/exposeStoreData';
import NavTabs from '../../../components/nav-tabs/NavTabs';
import StringUtils from '../../../utils/StringUtils';
import ManageFullMembersComposer from './ManageFullMembersComposer';
import EnumMemberStatus from '../../../core/enums/EnumMemberStatus';
import ManageUserGroupsGuide from './ManageUserGroupsGuide';
import TeamMembersStore from '../../../core/stores/TeamMembersStore';
import InviteMemberDialog from '../../dialog/invite-group-member/InviteMemberDialog';

import './ManageTeamView.less';

const
    TAB_FULL_MEMBERS = 'full-members',
    TAB_DISABLED_MEMBERS = 'disabled-members',
    TAB_USER_GROUPS = 'user-groups';

class ManageTeamView extends PureRenderComponent {
    static propTypes = {
        totalEnabled: PropTypes.number.isRequired,
        totalDisabled: PropTypes.number.isRequired,
        locale: PropTypes.object.isRequired
    }

    state = {activeKey: TAB_FULL_MEMBERS};

    handleSelect = eventKey => this.setState({activeKey: eventKey});

    render() {
        const {totalEnabled, totalDisabled, locale} = this.props,
            {activeKey} = this.state,
            navItems = [
                {key: TAB_FULL_MEMBERS, label: locale.MANAGE_TEAM['tabFullMembers'] + ` (${totalEnabled})`},
                {key: TAB_USER_GROUPS, label: locale.MANAGE_TEAM['tabUserGroups']}
            ],
            navItemsRight = [{key: TAB_DISABLED_MEMBERS, label: locale.MANAGE_TEAM['tabDisabledMembers'] + ` (${totalDisabled})`, className: 'disabled-members'}],
            renderGuideMsg = () => StringUtils.formatAsReact(
                locale.MANAGE_TEAM['guideMsg'],
                primaryOwnerLabel => <b>{primaryOwnerLabel}</b>,
                manageSettingsLabel => <a className="component-disabled"><b>{manageSettingsLabel}</b></a>,
                transferOwnerLabel => <a className="component-disabled"><b>{transferOwnerLabel}</b></a>
            );
        let content = null;
        if (activeKey === TAB_FULL_MEMBERS) {
            content = <ManageFullMembersComposer key={TAB_FULL_MEMBERS} locale={locale} targetStatus={EnumMemberStatus.Enabled}/>;
        } else if (activeKey === TAB_USER_GROUPS) {
            content = <ManageUserGroupsGuide locale={locale}/>;
        } else if (activeKey === TAB_DISABLED_MEMBERS) {
            content = <ManageFullMembersComposer key={TAB_DISABLED_MEMBERS} locale={locale} targetStatus={EnumMemberStatus.Disabled}/>;
        }

        return (
            <div className="manage-team">
                <h1 className="manage-team-title">
                    <i className="ficon ficon_Book"/>
                    {locale.MANAGE_TEAM['title']}
                    <Button className="button-green floatRight" onClick={InviteMemberDialog.open}>
                        <i className="ficon ficon_share_email"/>
                        {locale.MANAGE_TEAM['inviteNewMember']}
                    </Button>
                </h1>
                <p className="tip-text">{renderGuideMsg()}</p>
                <NavTabs navStyle="tabs" activeKey={activeKey} onSelect={this.handleSelect} items={navItems} itemsRight={navItemsRight}/>

                <div className="manage-team-content">
                    {content}
                </div>
            </div>
        );
    }
}


@exposeLocale()
@exposeStoreData([
    [TeamMembersStore, () => ({
        totalEnabled: TeamMembersStore.getTeamMembers(EnumMemberStatus.Enabled).size,
        totalDisabled: TeamMembersStore.getTeamMembers(EnumMemberStatus.Disabled).size
    })]
])
export default class ManageTeamComposer extends PureRenderComponent {
    render() {
        return <ManageTeamView {..._.pick(this.state, ['totalEnabled', 'totalDisabled', 'locale'])}/>
    }
}
