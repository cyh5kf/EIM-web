import React from 'react';
import UsersSelector from '../../../view-components/users-selector/UsersSelector';
import SaveButton from '../../../../components/button/LoadingButton';
import exposeLocale from '../../../../components/exposeLocale';

@exposeLocale(['DIALOGS', 'dlg-accountInfo'])
export default class AddMemberToEmail extends React.Component{
    constructor(props) {
        super(props);
        this.state = {show:true};
    }
    
    componentWillMount() {
        var defaultchannel = this.props.companyDetails.toJS().defaultchannel;
        this.setState({
            selectInputDatasource: (defaultchannel && defaultchannel.split(',') || []).map(mail => ({
                id: mail, mail: mail, name: mail
            }))
        });
    }

    onSelectInputDataChanged = (data) => {
        this.setState({selectInputDatasource:data});
        this.props.parent.setSaveBtnState(2, 0);//按钮状态变成 恢复正常
    }

    saveMemberListClick = () => {
        this.props.parent.updateCompanySetting({
            defaultchannel: this.state.selectInputDatasource.map(data => data.mail).join(",")
        },2);
    }
    
    render(){
        let locale = this.state.locale;
        let btnState = this.props.btnState || 0; ////0 正常,1 loading, 2 saved
        return (<div className="settingContent chooseMoreMem">
                    <div className="settingEmailLine">
                        <UsersSelector idField="mail" selectedUser={this.state.selectInputDatasource} onSelectedUserChange={this.onSelectInputDataChanged}/>
                    </div>
                    <div className="buttonBoxLine mar_top" onClick={this.saveMemberListClick.bind(this)}>
                        <SaveButton className="green" loading={btnState}>
                            {btnState===2?locale.noticeSaved:locale.saveSetting}
                        </SaveButton>
                    </div>
                    <div className="clearfix"></div>
                </div>);
    }
    
}

AddMemberToEmail.propTypes = {
    defaultchannel: React.PropTypes.string,
    parent: React.PropTypes.object,
    updateCompanySetting: React.PropTypes.func,
    btnState: React.PropTypes.number
};
