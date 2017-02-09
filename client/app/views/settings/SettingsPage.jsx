import React, {PropTypes} from 'react';
import {Link} from 'react-router';
import _ from 'underscore';
import PureRenderComponent from '../../components/PureRenderComponent';
import exposeLocale from '../../components/exposeLocale';
import exposeUserInfo from '../view-components/exposeUserInfo';

import {QueryTeamMembersCmd} from '../../core/commands/TeamMembersCommands';
import {queryContactGroupsCmd} from '../../core/commands/contactGroupsCommands'; 

import './SettingsPage.less';


class SettingsPage extends PureRenderComponent {
    static propTypes = {
        locale: PropTypes.object.isRequired,
        userAvatar: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
        companyName: PropTypes.string.isRequired,
        companyAvatar: PropTypes.string.isRequired,
        children: PropTypes.node
    }

    componentWillMount() {
        QueryTeamMembersCmd();
        queryContactGroupsCmd();

        this.setState({
            navMenuOpened: false
        });
    }

    toggleNavMenuOpened = () => this.setState({navMenuOpened: !this.state.navMenuOpened})
    hideNavMenu = () => this.setState({navMenuOpened: false})

    render() {
        const {locale, userAvatar, username, companyName, companyAvatar} = this.props,
            {navMenuOpened} = this.state,
            _PrimarySetting = (to, label, iconCls, cls = '') => <Link onClick={this.hideNavMenu} className={`settings-nav-item ${cls}`} to={to}><i className={`icon ${iconCls}`}/>{label}</Link>,
            _NavSetting = (to, label, cls = '') => <Link onClick={this.hideNavMenu} className={`settings-nav-item ${cls}`} to={to}>{label}</Link>;
        return (
            <div className={`setttings-page-wrapper ${navMenuOpened ? 'nav-menu-opened' : ''}`}>
                <div className="settings-page">
                    <div className="settings-page-header">
                        <div className="menu-toggler" onClick={this.toggleNavMenuOpened}>{locale.menu}</div>
                        <div className="company-info">
                            <i className="company-avatar icon icon-header-listview-home" style={companyAvatar ? {background: `url(${companyAvatar}) center/cover no-repeat`} : {}}/>
                            {companyName}
                        </div>
                    </div>
                    <div className="settings-page-left-nav">
                        <div className="signed-in-user-info">
                            <i className="user-avatar" style={userAvatar ? {background: `url(${userAvatar}) center/cover no-repeat`} : {}}/>
                            <div className="username-container">
                                <div className="username-tip">{locale.signedInAs}</div>
                                <div className="username">{username}</div>
                            </div>
                        </div>
                        <div className="primary-nav">
                            {_PrimarySetting('#', locale.sHome, 'icon-leftmenu-listview-home', 'component-disabled')}
                            {_PrimarySetting('/settings/manage-account/settings', locale.sAccountAndProfile, 'icon-lefrmenu-listview-account', '')}
                            {_PrimarySetting('#', locale.sConfigApp, 'icon-lefrmenu-listview-configure', 'component-disabled')}
                            {_PrimarySetting('#', locale.sMsgArchive, 'icon-lefrmenu-listview-message', 'component-disabled')}
                            {_PrimarySetting('#', locale.sFiles, 'icon-lefrmenu-listview-file', 'component-disabled')}
                            {_PrimarySetting('/settings/team-directory', locale.sTeamDir, 'icon-lefrmenu-listview-team')}
                            {_PrimarySetting('#', locale.sStat, 'icon-lefrmenu-listview-team', 'component-disabled')}
                            {_PrimarySetting('#', locale.sCustom, 'icon-lefrmenu-listview-team', 'component-disabled')}
                        </div>
                        <div className="admin-nav-title">{locale.adminSettings}</div>
                        <div className="admin-nav">
                            {_NavSetting('/settings/team-settings/settings', locale.sSettingsAndPermissions)}
                            {_NavSetting('/settings/manage-team', locale.sManageTeam)}
                            {_NavSetting('/settings/invites/pending', locale.sInvite)}
                            {_NavSetting('#', locale.sBilling, 'component-disabled')}
                            {_NavSetting('#', locale.sAuth, 'component-disabled')}
                        </div>
                    </div>
                    <div className="settings-page-content">
                        {this.props.children}
                    </div>
                    <div className="settings-page-mask" onClick={this.hideNavMenu}></div>
                </div>
            </div>
        );
    }
}

@exposeLocale(['SETTINGS_PAGE'])
@exposeUserInfo
export default class SettingsPageComposer extends PureRenderComponent {
    static propTypes = {children: PropTypes.node}

    static openSettingsPage(subURI) {
        window.open('/settings/' + subURI, '_settings');
    }

    render() {
        const {userInfo} = this.state;
        return (
            <SettingsPage userAvatar={userInfo.avatar}
                          username={userInfo.userName}
                          companyName={userInfo.companyName}
                          companyAvatar={userInfo.coverImg}
                          {..._.pick(this.state, ['locale'])}>
                {this.props.children}
            </SettingsPage>
        );
    }
}
