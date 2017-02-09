import React from 'react';
import LogonRecord from './LogonRecord';
import TeamSetting from './TeamSetting';
import Notification from './Notification';
import AccountSetting from './AccountSetting';
import {browserHistory} from 'react-router';
import exposeLocale from '../../../components/exposeLocale';
import NavTabs from '../../../components/nav-tabs/NavTabs';
import PureRenderComponent from '../../../components/PureRenderComponent';
import "./account-style.less";
import "./setupitem.less";
import AlertType from '../../../core/enums/EnumAlertType';

@exposeLocale(['DIALOGS', 'dlg-accountInfo'])
export default class AccountInfoDialog extends PureRenderComponent{
    static defaultProps = {
        className: 'account-manage'
    }

    constructor(props){
        super(...arguments);
        this.state = {
            show:true,
            alertType: AlertType.NoneAlert,
            alertContent: ''
        }
    }

    displayDialog(currentPage,locale){
        var dialog = <span></span>;
        switch(currentPage){
            case 'settings':
                dialog = <AccountSetting  ref="accountSetting"  locale = {locale} setAlertContent={this.setAlertContent}/>;
            break;
            case 'notifications':
                dialog = <Notification ref="notification" locale = {locale}/>;
            break;
            case 'logs':
                dialog = <LogonRecord ref="logonRecord" locale = {locale}/>;
            break;
            case 'team':
                dialog = <TeamSetting ref="teamSetting" locale = {locale}/>;
            break;
        }      
        return dialog;
    }

    setAlertContent=(alertType, alertContent)=>{
        this.setState({alertType: alertType, alertContent: alertContent});
    }

    handleTabSelected = currentPage =>{
        browserHistory.push('/settings/manage-account/'+currentPage);
    }

    renderNavTabs() {
        let locale = this.state.locale;
        let currentPage = this.props.routeParams.currentPage;
        let tabItems = [
                {key: 'settings', label: locale.leftSetting},
                {key: 'notifications', label: locale.leftNotification}
            ];
        let rightTabItems = [
            {key: 'logs', label: locale.leftLogonRecord},
            {key: 'team', label: locale.leftGroupSetting}];
        return <NavTabs navStyle="tabs" activeKey={currentPage} items={tabItems} itemsRight={rightTabItems} onSelect={this.handleTabSelected}/>;
    }

    renderAlert(alertType, alertContent){
        switch (alertType){
            case AlertType.AlertSuccess:
                return (
                    <p className="alert alert_success">
                        <i className="ficon_check_circle_o"></i>
                        {alertContent}
                    </p>
                );
            case AlertType.AlertError:
                return (
                    <p className="alert alert_error">
                        <i className="ficon_warning"></i>
                        {alertContent}
                    </p>
                );
            case AlertType.NoneAlert:
                return null;
        }
        
    }

    render(){
        let locale = this.state.locale;
        let currentPage = this.props.routeParams.currentPage;
        let {alertType,alertContent} = this.state;
        return (<div className="manage-page accountSettingBox mission_global">
                    <div className="manage-team-directory-header">
                        <h1>
                            <i className="icon icon-content-listview-account"/>
                            {locale.title}
                        </h1>
                    </div>
                    {this.renderAlert(alertType, alertContent)}
                    {this.renderNavTabs()}
                    <div className="content">
                        {this.displayDialog(currentPage,locale)}
                    </div>
                </div>);
    }

}
