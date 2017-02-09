import React from 'react';
import Dialog from '../../components/dialog/Dialog';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import PureRenderComponent from '../../components/PureRenderComponent';
import ReactPropTypes from '../../core/ReactPropTypes';
import StringUtils from '../../utils/StringUtils';
import EnumRoleId from '../../core/enums/EnumRoleId';
import EnumLoginStatus from '../../core/enums/EnumLoginStatus';
//import { SwitchRightPanelCmd } from '../../core/commands/RightPanelConfigCommands';
import { SetLoginStatusCmd, LogoutAccountCmd } from '../../core/commands/LoginCommands';
import PreferenceDialog from '../setup/preference/PreferenceDialog';
import InviteMemberDialog from '../dialog/invite-group-member/InviteMemberDialog';
import MessageUserInfoDialog from '../message-list-view/MessageUserInfoDialog';
import LogOffAccountDialog from '../dialog/LogOffAccountDialog';
import SettingsPage from '../settings/SettingsPage';
import { UserProfileSchema } from '../../core/schemas/LoginSchemas';
import exposeUserInfo from '../view-components/exposeUserInfo';
import exposeLocale from '../../components/exposeLocale';
import defAvatarImg from '../../../static/images/default_user_avatar.png';
import './AccountComposer.less';

const MENU_USER_LOGO = '1',
    MENU_PERSONAL_INFO = '2',
    MENU_PREFERENCE = '3',
    MENU_SET_STATUS = '4',
    MENU_HELP_FEEDBACK = '5',
    MENU_COMPANY_INFO = '6',
    MENU_INVITE = '7',
    MENU_MEMBER_MANAGER = '8',
    MENU_COMPANY_MANAGER = '9',
    MENU_LOGOUT = '10';

class AccountView extends PureRenderComponent {
    static propTypes = {
        userInfo: ReactPropTypes.ofSchema(UserProfileSchema).isRequired,
        accountSetting: ReactPropTypes.ofLocale(['ACCOUNT_SETTING_MENU']).isRequired
    }

    state = {
        dialogType: null
    }

    //openUserProfilePanel = () => SwitchRightPanelCmd(EnumRightPanelType.USER_PROFILE, {
    //    uid: this.props.userInfo.uid
    //})
    openUserProfilePanel (uid) {
        Dialog.openDialog(MessageUserInfoDialog,{
            uid:uid,isSelf:true
        });
    }

    openDialog = (e) => {
        let dialogType = e.currentTarget.getAttribute('data-type');
        console.log(dialogType)
        if(dialogType === 'membersManager') {
            SettingsPage.openSettingsPage('manage-team');
            return;
        }

        if(dialogType==='companysetting') {
            SettingsPage.openSettingsPage('team-settings/settings');
            return;
        }

        if (dialogType ==='invite') {
            InviteMemberDialog.open();
        }
        if (this.refs[dialogType]) {
            this.refs[dialogType].open();
        }
        else {
            this.setState({dialogType: dialogType});
        }
    }

    onSetLoginStatusClick = e => {
        const targetStatus = e.currentTarget.dataset.targetStatus;
        SetLoginStatusCmd(targetStatus);
    }

    _logOutAccount = (e) => {
        e.preventDefault();
        LogoutAccountCmd(this.props.userInfo.uid, this.props.userInfo.token);
    }

    fixTimeZone() {
        this.setState({
            dialogType: 'accountSetDialog',
            openTimeZonePanel: true,
            showModelBox: true
        });
    }

    closeDialog(obj){
        this.setState(obj);
    }

    render () {
        let user = this.props.userInfo;
        let roleId = user.role;
        let account = this.props.accountSetting;
        let hasAminRole = roleId === EnumRoleId.Owner || roleId === EnumRoleId.Admin;
        let userAvatar = user.avatar;
        let companyAvatar = user.coverimg;
        let companyName = user.companyname;
        let loginStatus = user.loginstatus;
        //let switchTeamText = StringUtils.format(account.switchTeam, "SOMA");
        let setStatusTarget = loginStatus !== EnumLoginStatus.WebOnline ? EnumLoginStatus.WebOnline : EnumLoginStatus.ManuallyOffline;
        let setYourStatus = StringUtils.format(account.setYourStatus, setStatusTarget === EnumLoginStatus.WebOnline ? account.activeStatus : account.awayStatus);
        let userLogo = <img src={userAvatar?userAvatar:defAvatarImg}/>;
        let companyLogo = companyAvatar?<img src={companyAvatar}/>:<div className="eim-deprecated eim-morengongsi32" />;

        let dialog = null;
        if(this.state.dialogType === 'logOffDlg'){
            const locale = gLocaleSettings.DIALOGS['dlg-logOff'];
            dialog = <LogOffAccountDialog className="dlg-logoffAccount" onCloseDialog={this.closeDialog.bind(this)} ref="logOffDlg" locale={locale} uid={this.props.userInfo.uid} token={this.props.userInfo.token}/>;
        }
        else if(this.state.dialogType === 'preference'){
            const locale = gLocaleSettings.DIALOGS['dlg-preference'];
            dialog = <PreferenceDialog title={locale.title} fixTimeZone={this.fixTimeZone.bind(this)} className="dlg-preference" onCloseDialog={this.closeDialog.bind(this)} ref="preference" locale={locale} hiddenFooter={true} token={this.props.userInfo.token}/>;
        }

        return (
            <div className="account">
                {dialog}
                <div className="account-logo">
                    {userLogo}
                    <i className="status-indicator"/>
                </div>
                <div className="account-dropdown">
                    <DropdownButton id={`_dropdown-${user.cid}`} title="">
                        <MenuItem eventKey={MENU_USER_LOGO} disabled>
                            <div className="user-logo">
                                <div className="user-head">
                                    {userLogo}
                                </div>
                                <div className="user-info">
                                    <div className="nick-name">{user.username}</div>
                                    <div className="nick-desc">{'@'+user.username}</div>
                                </div>
                            </div>
                        </MenuItem>
                        <MenuItem eventKey={MENU_PERSONAL_INFO}>
                            <div className="btn-item" data-index={0} onClick={this.openUserProfilePanel.bind(this, user.uid)}>{account.personalinfo}</div>
                        </MenuItem>
                        <MenuItem eventKey={MENU_PREFERENCE} disabled>
                            <div className="btn-item" data-index={0} data-type={'preference'} onClick={this.openDialog}>{account.preference}</div>
                        </MenuItem>
                        <MenuItem eventKey={MENU_SET_STATUS} disabled>
                            <div className="btn-item" data-index={0} dangerouslySetInnerHTML={{__html: setYourStatus}} data-target-status={setStatusTarget} onClick={this.onSetLoginStatusClick}></div>
                        </MenuItem>
                        <MenuItem eventKey={MENU_HELP_FEEDBACK} disabled>
                            <div className="btn-item" data-index={0} >{account.helpAndFeedback}</div>
                        </MenuItem>
                        <MenuItem eventKey={MENU_COMPANY_INFO} disabled>
                            <div className="user-logo">
                                <div className="user-head">
                                    {companyLogo}
                                </div>
                                <span className="user-info" style={{lineHeight: '32px',top: '0'}}>
                                    <span className="nick-name" style={{lineHeight: '32px'}}>{companyName}</span>
                                </span>
                            </div>
                        </MenuItem>
                        <MenuItem eventKey={MENU_INVITE} disabled>
                            <div className="btn-item" data-type={'invite'} onClick={this.openDialog}>{account.invitationmember}</div>
                        </MenuItem>
                        <MenuItem eventKey={MENU_MEMBER_MANAGER} disabled>
                            {hasAminRole && <div className="btn-item" data-type={'membersManager'} onClick={this.openDialog}>{account.companymanage}</div>}
                        </MenuItem>
                        <MenuItem eventKey={MENU_COMPANY_MANAGER}>
                            {hasAminRole && <div className="btn-item" data-type={'companysetting'} onClick={this.openDialog}>{account.companysetting}</div>}
                        </MenuItem>
                        <MenuItem eventKey={MENU_LOGOUT}>
                            <div className="btn-item" onClick={this._logOutAccount}>{account.logoutcompany}</div>
                        </MenuItem>
                    </DropdownButton>
                </div>
            </div>
        );
    }
}

@exposeUserInfo
@exposeLocale(['ACCOUNT_SETTING_MENU'])
export default class AccountComposer extends PureRenderComponent {
    render() {
        return <AccountView userInfo={this.state.userInfo} accountSetting={this.state.locale}/>;
    }
}
