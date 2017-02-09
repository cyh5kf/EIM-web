import React from 'react';
import _ from 'underscore';
//import {Link} from 'react-router';
//import classnames from '../../../utils/ClassNameUtils';
import PureRenderComponent from '../../../components/PureRenderComponent';
import exposeLocale from '../../../components/exposeLocale';
//import timeZoneList from '../../../core/enums/EnumTimeZoneList';
import NavTabs from '../../../components/nav-tabs/NavTabs';
import SettingStore from '../../../core/stores/SettingStore';
import {getCompanySettingCmd, getUserSettingCmd, updateCompanySettingCmd, updateCompanyInfoCmd, updateUserSettingCmd} from '../../../core/commands/SettingCommands';
import "../account/setupitem.less";
import "./teamSettings.less";

import Logs from './Logs';
import Permissions from './Permissions';
import Settings from './Settings';

@exposeLocale(['DIALOGS', 'dlg-groupSetting'])
export default class TeamSettingComposer extends PureRenderComponent {

    static contextTypes = {
        router: React.PropTypes.object.isRequired
    };


    constructor(props){
        super(...arguments);
        this.state = {
        };
        this.getCompanyDetails();
    }


    componentDidMount(){
        this.getCompanyDetails();
    }

    componentWillMount() {
        //super.componentWillMount(...arguments);
        this._getUserInfoData = this.getUserInfoData.bind(this);
        this._getCompanyInfoData = this.getCompanyInfoData.bind(this);
        this._updateUserData = this.updateUserData.bind(this);
        this._updateCompanyData = this.updateCompanyData.bind(this);
        SettingStore.addEventListener('user', this._getUserInfoData);
        SettingStore.addEventListener('company', this._getCompanyInfoData);
        SettingStore.addEventListener('updateUser', this._updateUserData);
        SettingStore.addEventListener('updateCompany', this._updateCompanyData);
    }

    componentWillUnmount() {
        //super.componentWillUnmount(...arguments);
        SettingStore.removeEventListener('user', this._getUserInfoData);
        SettingStore.removeEventListener('company', this._getCompanyInfoData);
        SettingStore.removeEventListener('updateUser', this._updateUserData);
        SettingStore.removeEventListener('updateCompany', this._updateCompanyData);
    }

    getCompanyDetails(){
        getCompanySettingCmd();
        getUserSettingCmd();
    }

    getCompanyInfoData(){
        var data = SettingStore.getCompanySetting();
        this.setState({companyDetails:data});
    }

    getUserInfoData(){
        var data = SettingStore.getUserSetting();
        this.setState({userDetails:data});
    }

    updateCompanySetting(setting,callbackObj){
        if (!_.isEmpty(setting)) {
            setting.cid = this.state.companyDetails.cid;
            updateCompanySettingCmd(setting).then(function(){
                if(callbackObj && callbackObj.callback){
                    callbackObj.callback(callbackObj.settingType);
                }
            });
        }
    }

    updateCompanyInfo(name,callbackObj){
        if (!_.isEmpty(name)) {
            updateCompanyInfoCmd({name:name}).then(function(){
                if(callbackObj && callbackObj.callback){
                    callbackObj.callback();
                }
            });
        }
    }

    updateUserSetting(setting,message,callbackObj){
        this.message = message;
        setting.uid = this.state.userDetails.uid;
        updateUserSettingCmd(setting).then(function(){
            if(callbackObj && callbackObj.callback){
                callbackObj.callback();
            }
        });
    }

    updateUserData(){
        let user = SettingStore.getUserSetting();
        this.setState({userDetails:user});
        this.onAlert(this.message, {
            time: 2000,
            type: 'success'
        });
    }

    updateCompanyData(){
        let company = SettingStore.getCompanySetting();
        this.setState({companyDetails:company});
        this.onAlert(this.message, {
            time: 2000,
            type: 'success'
        });
    }


    onAlert(){
    }


    displayDialog(currentPage, locale) {
        var dialog = <span></span>;
        switch (currentPage) {
            case 'settings':
                dialog = (
                    <Settings
                        key="groupSetting"
                        ref="groupSetting"
                        parent = {this}
                        locale = {locale}
                        userDetails={this.state.userDetails}
                        companyDetails={this.state.companyDetails} />
                );
                break;
            case 'permissions':
                dialog =
                    <Permissions key="permissions"
                                 ref="permissions"
                                 parent={this}
                                 locale={locale}
                                 userDetails={this.state.userDetails}
                                 companyDetails={this.state.companyDetails}
                                 onAlert={this.onAlert.bind(this)} />;
                break;
            case 'logs':
                dialog = <Logs key="logonLog"
                               ref="logonLog"
                               parent = {this}
                               locale = {locale}
                               userDetails={this.state.userDetails}
                               companyDetails={this.state.companyDetails} />;
                break;
        }
        return dialog;
    }


    handleTabSelected(currentPage) {
        this.context.router.push('/settings/team-settings/' + currentPage);
    }

    renderNavTabs(currentPage, locale) {
        let tabItems = [
            {key: 'settings', label: locale.groupSettingLabel},
            {key: 'permissions', label: locale.authorityLabel},
            {key: 'logs', label: locale.logonLogLabel}
        ];
        return <NavTabs navStyle="tabs" activeKey={currentPage} items={tabItems} onSelect={this.handleTabSelected.bind(this)}/>;
    }

    render() {

        var locale = this.state.locale || {};
        let currentPage = this.props.routeParams.currentPage;

        return (
            <div className="accountSettingBox teamSettings">
                <div className="manage-team-directory-header">
                    <h1>
                        <i className="icon icon-content-listview-account"/>
                        {locale.sSettingsAndPermissions || ""}
                    </h1>
                </div>
                {this.renderNavTabs(currentPage, locale)}
                <div className="content">
                    {this.displayDialog(currentPage, locale)}
                </div>
            </div>);
    }
}


TeamSettingComposer.propTypes = {
    router: React.PropTypes.object,
    locale: React.PropTypes.object,
    routeParams: React.PropTypes.object
};
