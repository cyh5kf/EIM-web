import React, {PropTypes} from 'react';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import _ from 'underscore';
import Button from '../../../components/button/Button';
import NavTabs from '../../../components/nav-tabs/NavTabs';
import StringUtils from '../../../utils/StringUtils';
import TeamDirectoryComposer from '../../team-directory/TeamDirectoryComposer';
import TeamDirectoryView from '../../team-directory/TeamDirectoryView';
import LoginStore, {EVENTS} from '../../../core/stores/LoginStore';
import InviteMemberDialog from '../../dialog/invite-group-member/InviteMemberDialog';

import './ManageTeamDirectoryView.less';

class ManageTeamDirectoryView extends TeamDirectoryView {
    static propTypes = {
        ...TeamDirectoryView.propTypes,
        username: PropTypes.string.isRequired,
        companyName: PropTypes.string.isRequired
    }
    static defaultProps = {
        className: 'manage-team-directory'
    }
    renderHeader() {
        const {locale, username, companyName} = this.props,
            guideMsg = StringUtils.formatAsReact(
                StringUtils.format(locale.MANAGE_TEAM_DIRECTORY.guideMsgForOwner, `{0:${username}}`, `{1:${companyName}}`),
                usernameText => <b>{usernameText}</b>,
                companyNameText => <b>{companyNameText}</b>
            );
        return (
            <div className="manage-team-directory-header">
                <h1>
                    <i className="ficon ficon_team_directory"/>
                    {locale.TEAM_DIRECTORY['title']}
                    <Button className="button-green" onClick={InviteMemberDialog.open}>
                        <i className="ficon ficon_share_email"/>
                        {locale.MANAGE_TEAM_DIRECTORY.inviteNewMember}
                    </Button>
                </h1>
                <p className="guide-msg">{guideMsg}</p>
            </div>
        );
    }

    renderNavTabs() {
        const {enabledMembers, disabledMembers, locale: {MANAGE_TEAM_DIRECTORY: myLocale}} = this.props,
            tabItems = [
                {key: TeamDirectoryView.TAB_ENABLED_MEMBERS, label: myLocale.tabFullMembers + ` (${enabledMembers.size})`}
            ],
            tabItemsRight = [{key: TeamDirectoryView.TAB_DISABLED_MEMBERS, label: myLocale.tabDisabledMembers + ` (${disabledMembers.size})`, className: 'disabled-members'}];
        return <NavTabs navStyle="tabs" activeKey={this.state.currentTab} items={tabItems} itemsRight={tabItemsRight} onSelect={this.handleTabSelected}/>;
    }

    renderMemberItemExtra = member => {
        const {locale} = this.props;
        return [
            <div key="email" className="member-email-container">
                <span className="member-email-title">{locale.COMMON.email}</span>
                <a href={`mailto:${member.email}`}>{member.email}</a>
            </div>,
            <DropdownButton key="actions" id="mtd-actions-dropdown" onSelect={key => console.log(key)} noCaret pullRight title={<i className="icon icon-message-button-action-more32"/>}>
                <MenuItem className="component-disabled" eventKey="profile">{locale.MANAGE_TEAM_DIRECTORY.menuViewProfile}</MenuItem>
                <MenuItem className="component-disabled" eventKey="files">{locale.MANAGE_TEAM_DIRECTORY.menuViewFiles}</MenuItem>
            </DropdownButton>
        ];
    }

    renderContentExtra() {
        return null;
    }
}


export default class ManageTeamDirectoryComposer extends TeamDirectoryComposer {
    static defaultProps = {
        ...TeamDirectoryComposer.defaultProps,
        TeamDirectoryViewComponent: ManageTeamDirectoryView
    }
    _updateLoginUserAndCompanyInfo = () => this.setState({
        username: LoginStore.getUserName(),
        companyName: LoginStore.getCompanyName()
    })
    componentWillMount() {
        super.componentWillMount(...arguments);
        this._updateLoginUserAndCompanyInfo();
        LoginStore.addEventListener(EVENTS.CHANGE, this._updateLoginUserAndCompanyInfo);
    }
    componentWillUnmount() {
        super.componentWillUnmount(...arguments);
        LoginStore.removeEventListener(EVENTS.CHANGE, this._updateLoginUserAndCompanyInfo);
    }
    render() {
        const {TeamDirectoryViewComponent} = this.props;
        return <TeamDirectoryViewComponent {..._.pick(this.state, ['enabledMembers', 'disabledMembers', 'contactGroups', 'locale', 'username', 'companyName'])}/>;
    }
}
