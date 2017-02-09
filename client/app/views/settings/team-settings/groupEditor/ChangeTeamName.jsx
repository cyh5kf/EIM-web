import React from 'react';
import SaveButton from '../../../../components/button/LoadingButton';
import exposeLocale from '../../../../components/exposeLocale';
import {getCompanyByIdCmd} from '../../../../core/commands/SettingCommands';
import SettingStore,{SETTING_EVENTS} from '../../../../core/stores/SettingStore';

@exposeLocale(['DIALOGS', 'dlg-accountInfo'])
export default class ChangeTeamName extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            companyName: ''
        };
    }

    componentDidMount(){
        getCompanyByIdCmd();
    }

    componentWillMount() {
        SettingStore.addEventListener(SETTING_EVENTS.COMPANY_INFO, this.getCompanyDetail);
    }

    componentWillUnmount() {
        SettingStore.removeEventListener(SETTING_EVENTS.COMPANY_INFO, this.getCompanyDetail);
    }

    getCompanyDetail=()=>{
        var data = SettingStore.getCompanyInfo();
        let companyName = data.name;
        this.setState({companyName:companyName});
    }

    TeamNameChange(e){
        let companyName = e.target.value;
        this.setState({companyName:companyName});
        this.props.parent.setSaveBtnState(8, 0);//按钮状态变成 恢复正常
    }

    saveTeamNameClick(){
        event.preventDefault();
        let name = this.state.companyName;
        this.props.parent.updateCompanyInfo(name,8);
    }

    render(){
        let locale = this.state.locale;
        let btnState = this.props.btnState || 0; ////0 正常,1 loading, 2 saved
        return (<div className="settingContent showMemNameOptions">
                    <div className="teamNameInputBox">
                        <input className="teamNameInput" onChange={this.TeamNameChange.bind(this)} value={this.state.companyName}/>
                    </div>
                    <div className="buttonBoxLine teamNameSave" onClick={this.saveTeamNameClick.bind(this)}>
                        <SaveButton className="green" loading={btnState}>
                            {btnState===2?locale.noticeSaved:locale.saveSetting}
                        </SaveButton>
                    </div>
                    <div className="clearfix"></div>
                </div>);
    }
    
}



ChangeTeamName.propTypes = {
    parent: React.PropTypes.object,
    updateCompanySetting: React.PropTypes.func,
    locale: React.PropTypes.object,
    btnState: React.PropTypes.number
};

