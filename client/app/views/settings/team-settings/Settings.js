import React from 'react';
import SetupItems from '../../../components/setupitem/SetupItems';
import AddMemberToEmail from './groupEditor/AddMemberToEmail';
import FileRemainStrategy from './groupEditor/FileRemainStrategy';
import GroupRegisterStyle from './groupEditor/GroupRegisterStyle';
import MsgRemainStrategy from './groupEditor/MsgRemainStrategy';
import NameDisplayStrategy from './groupEditor/NameDisplayStrategy';
import NotDisturbTimeSetting from './groupEditor/NotDisturbTimeSetting';
import ChangeTeamName from './groupEditor/ChangeTeamName';
import OperateGroupLogo from './groupEditor/OperateGroupLogo';
import StringUtils from '../../../utils/StringUtils';
import LoginStore from '../../../core/stores/LoginStore';
import PureRenderComponent from '../../../components/PureRenderComponent';

export default class Settings extends PureRenderComponent{
    static contextTypes = {
        router: React.PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            show:true,
            companyDetails:this.props.companyDetails,
            userDetails:this.props.userDetails
        };
    }

    open(){
        this.setState({show:true});
    }

    close(){
        this.setState({show:false});
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            companyDetails:nextProps.companyDetails
            ,userDetails:nextProps.userDetails});
    }



    updateCompanySetting(setting,btnIndex){
        this.setSaveBtnState(btnIndex,1);//按钮状态变成 loading...
        this.props.parent.updateCompanySetting(setting,{settingType:btnIndex,callback:function () {
            this.setSaveBtnState(btnIndex,2);//Saved
        }.bind(this)});
    }

    updateCompanyInfo(name,btnIndex){
        this.setSaveBtnState(btnIndex,1);//按钮状态变成 loading...
        this.props.parent.updateCompanyInfo(name,{settingType:btnIndex,callback:function () {
            this.setSaveBtnState(btnIndex,2);//Saved
        }.bind(this)});
    }

    updateUserSetting(setting,btnIndex){
        this.setSaveBtnState(btnIndex,1);//按钮状态变成 loading...
        let message = this.props.locale.companyUpdateMsg;
        this.props.parent.updateUserSetting(setting,message,{settingType:btnIndex,callback:function () {
            this.setSaveBtnState(btnIndex,2);//Saved
        }.bind(this)});
    }

    setSaveBtnState(settingType,state){
        var m = {};
        m['btnState_' + settingType] = state;
        this.setState(m);
    }

    getSaveBtnState(settingType){
        return this.state['btnState_' + settingType]|| 0;
    }

    handleClickDeleteBtn() {
        this.context.router.push('/settings/team-delete/');
    }

    renderMainContent(locale){
        var getSaveBtnState = this.getSaveBtnState.bind(this);
        // let getRole = LoginStore.getRoleId();
        // switch(getRole){
        //     case '1':
                var registerDesc=(<span className="messages">
                                     <span>{locale.regMethodLinkDesc}</span>
                                     <br/>
                                     <span className="underline">{StringUtils.format(locale.regMethodLink, LoginStore.getCid())}</span>.
                                 </span>);
                return (<ul className="main-panel settings">
                    <SetupItems ref="groupRegItem" title={locale.regMethodLabel} subtitle={registerDesc}>
                        <GroupRegisterStyle locale = {locale} parent={this} companyDetails={this.state.companyDetails} btnState={getSaveBtnState(1)}/>
                    </SetupItems>
                    <SetupItems ref="addEmailItem" title={locale.defaultEmailLabel} subtitle={locale.defaultEmailDesc}>
                        <AddMemberToEmail locale = {locale} parent={this} companyDetails={this.state.companyDetails} btnState={getSaveBtnState(2)}/>
                    </SetupItems>
                    <SetupItems ref="nameShowItem" title={locale.userRealNameLabel} subtitle={locale.userRealNameDesc}>
                        <NameDisplayStrategy locale = {locale} parent={this} changeusernamepolicy={this.state.userDetails.changeusernamepolicy} btnState={getSaveBtnState(3)}/>
                    </SetupItems>
                    <SetupItems ref="notDisturbItem" title={locale.notDisturbLabel} subtitle={locale.notDisturbDesc}>
                        <NotDisturbTimeSetting locale={locale} parent={this} companyDetails={this.state.companyDetails} btnState={getSaveBtnState(4)}/>
                    </SetupItems>
                    <SetupItems ref="msgRemainItem" title={locale.messageRemainLabel} subtitle={locale.messageRemainDesc}>
                        <MsgRemainStrategy locale={locale} parent={this} companyDetails={this.state.companyDetails} btnState={getSaveBtnState(5)}  btnState2={getSaveBtnState(6)}/>
                    </SetupItems>
                    <SetupItems ref="fileRemainItem" title={locale.fileRemainLabel} subtitle={locale.fileRemainDesc}>
                        <FileRemainStrategy locale={locale} parent={this} companyDetails={this.state.companyDetails} btnState={getSaveBtnState(7)}/>
                    </SetupItems>
                    <SetupItems ref="editLogoItem" title={locale.iconSettingLabel} subtitle={locale.iconSettingDesc}>
                        <OperateGroupLogo locale={locale} parent={this} userDetails={this.state.userDetails}/>
                    </SetupItems>
                    <SetupItems ref="teamNameItem" title={locale.TeamNameLabel} subtitle={locale.TeamNameDesc}>
                        <ChangeTeamName locale={locale} parent={this} btnState={getSaveBtnState(8)}/>
                    </SetupItems>
                    <li className="setupitems mission_global">
                        <h4><a href="javascript:;">{locale.deleteGroupLabel}</a></h4>
                        <p className="no_bottom_margin">{locale.deleteGroupDesc}</p>
                        <div className="settingContent deleteGroupBox">
                            <div className="deleteTeamBtn" onClick={this.handleClickDeleteBtn.bind(this)}>{locale.delGroupLabel}</div>
                        </div>
                    </li>
                </ul>);
        //     case '2':  //管理员
        //         return (<ul className="main-panel settings">
        //             <SetupItems ref="addEmailItem" title={locale.defaultEmailLabel} subtitle={locale.defaultEmailDesc}>
        //                 <AddMemberToEmail locale = {locale} parent={this} companyDetails={this.state.companyDetails} btnState={getSaveBtnState(2)}/>
        //             </SetupItems>
        //         </ul>);
        //     case '3':  //普通用户
        //         return (<div></div>);
        //     default:
        //         return (<div></div>);
        // }

    }

    render(){
        let dialog = <span></span>;
        let locale = this.props.locale;
        if (this.state.companyDetails&&this.state.userDetails){
            dialog = this.renderMainContent(locale);
        }
        return (dialog);
    }

}

Settings.propTypes = {
    locale: React.PropTypes.object
};


