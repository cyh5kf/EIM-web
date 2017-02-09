import React from 'react';
import PureRenderComponent from '../../../components/PureRenderComponent';
import exposeLocale from '../../../components/exposeLocale';
import MessagePopup from '../../../components/alert/MessagePopup';
import "./teamSettings.less";
import SettingStore ,{SETTING_EVENTS} from '../../../core/stores/SettingStore';
import {checkPasswordCmd, deleteTeamCmd} from '../../../core/commands/SettingCommands';

@exposeLocale(['DIALOGS', 'dlg-groupSetting'])
export default class TeamDeleteComposer extends PureRenderComponent {

    static contextTypes = {
        router: React.PropTypes.object.isRequired
    };

    constructor(props){
        super(...arguments);
        this.state = {
            checkpwResult: '',
            password: '',
            deleteTeamResult: ''
        };
    }


    componentDidMount(){
    }

    componentWillMount() {
        SettingStore.addEventListener(SETTING_EVENTS.CHECK_PASSWORD, this.getCheckResultData);
        SettingStore.addEventListener(SETTING_EVENTS.DELETE_TEAM, this.getDeleteTeamResultData);
    }

    componentWillUnmount() {
        SettingStore.removeEventListener(SETTING_EVENTS.CHECK_PASSWORD, this.getCheckResultData);
        SettingStore.removeEventListener(SETTING_EVENTS.DELETE_TEAM, this.getDeleteTeamResultData);
    }

    deleteGroupClick(){
        let password = this.state.password;
        deleteTeamCmd(password);
    }

    handleCheckPassword(password) {
        if(password) {
            this.setState({password: password});
            checkPasswordCmd(password);
        } else {
            this.setState({checkpwResult:''});
        }

    }

    getCheckResultData =()=>{
        var data = SettingStore.getCheckpwResult();
        this.setState({checkpwResult:data});
    }

    getDeleteTeamResultData =()=>{
        var data = SettingStore.getDeleteTeamResult();
        this.setState({deleteTeamResult:data});
    }


    switchCompenent(dialogFlag, locale, checkpwResult){
        var dialog = <span></span>;
        switch(dialogFlag){
            case 'deleteSuccess':
                dialog = <DeleteGroupSuccess parent = {this} locale = {locale}/>;
                break;
            default:
                dialog = <DeleteGroupBox parent = {this} locale = {locale} checkpwResult = {checkpwResult}/>;
                break;
        }
        return dialog;
    }

    render(){
        var locale = this.state.locale || {};
        let dialogFlag = this.state.deleteTeamResult? 'deleteSuccess': '' || {};
        let checkpwResult = this.state.checkpwResult;
        let dialog = this.switchCompenent(dialogFlag,locale,checkpwResult);
        return (dialog);
    }


}

export class DeleteGroupBox extends React.Component{

    static contextTypes = {
        router: React.PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
    }

    confirmDeleteClick(){
        this.props.parent.deleteGroupClick();
    }

    handleCancelDeleteBtn() {
        this.context.router.push('/settings/team-settings/settings');
    }

    handleCheckPassword(e) {
        let passwordVal = e.target.value;
        this.props.parent.handleCheckPassword(passwordVal);
    }


    render() {
        let locale = this.props.locale;
        let checkpwResult = this.props.checkpwResult;
        return (
            <div className="accountSettingBox deleteTeam">
                <div className="manage-team-directory-header">
                    <h1>
                        {locale.DeleteTeam || ""}
                    </h1>
                </div>
                <MessagePopup className="error">
                    <i className="ficon-button ficon-uniE209"></i>
                    <div className="deleteDesc">
                        <span>{locale.delGroupDesc}</span>
                        <br/>
                        <span>{locale.delGroupResDesc}</span>
                    </div>
                    <div className="clearfix"></div>
                </MessagePopup>
                <div className="content">
                    <div className="noteStyle confirmMsg">{locale.importantNote}</div>
                    <div className="textStyle confirmDesc">{locale.deleteTeamDesc}</div>
                    <div className="textStyle pwText">{locale.passwordText}</div>
                    <div className="inputPassLine">
                        <input type="password" className="inputPasswd" onChange={this.handleCheckPassword.bind(this)} />
                        {(checkpwResult === false)?
                            (<MessagePopup className="error pwError"><i className="ficon-button ficon-info_circle"></i>{locale.passwordError}</MessagePopup>):
                            (<span></span>)
                        }
                    </div>
                    <div className="buttonLine">
                        {(checkpwResult === true)?
                            (<div className="YesDelete" onClick={this.confirmDeleteClick.bind(this)}>{locale.YesDelete}</div>):
                            (<div className="YesDelete greyClass">{locale.YesDelete}</div>)
                        }
                        <div className="cancelDelete" onClick={this.handleCancelDeleteBtn.bind(this)}>{locale.cancelDelete}</div>
                    </div>
                </div>
            </div>);
    }
}

export class DeleteGroupSuccess extends React.Component{
    constructor(props) {
        super(props);
    }

    backToMainPage(){
        this.props.parent.deleteGroupClick('');
    }

    render(){
        let locale = this.props.locale;
        return (<div className="deleteGroupSuccess">
            <div className="eim-deprecated eim-back-nor" onClick={this.backToMainPage.bind(this)}></div>
            <div className="eim-deprecated eim-no"></div>
            <div className="deleteSuccMsg">{locale.deleteSuccess}</div>
        </div>);
    }
}


TeamDeleteComposer.propTypes = {
    locale: React.PropTypes.object
};
