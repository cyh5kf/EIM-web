import React from 'react';
import toast from '../../components/popups/toast';
import BrowserUtils from '../../utils/BrowserUtils';
import ModelDialog from '../../components/dialog/ModelDialog';
import exposeLocale from '../../components/exposeLocale';
import UserEditorStore from '../../core/stores/UserEditorStore';
import {updateUserPasswordCmd} from '../../core/commands/UserEditorCommands';
import './ResetPasswordDialog.less';

@exposeLocale(['DIALOGS', 'DLG_RESET_PASSWORD'])
export default class ResetPasswordDialog extends ModelDialog {
    static propTypes = {
        ...ModelDialog.propTypes
    }

    static defaultProps = {
        ...ModelDialog.defaultProps,
        name: 'dlg-resetPassword'
    }

    constructor(props) {
        super(props);
        this.state = {show:true,userId:null
            ,currentPwd:''
            ,newPwd:''
            ,currentPwdStatus:false
            ,newPwdStatus:false
        };
        this.uriParis = BrowserUtils.parseURLPara();
    }

    componentWillMount(){
        UserEditorStore.addEventListener('SETTING_ACCOUNT', (e)=>this.updatePasswordRsp(e));
        UserEditorStore.addEventListener('SUBMIT_USEREDITOR_FAILURE', (e)=>this.alertMessage(e));
    }

    componentWillUnmount(){
        UserEditorStore.removeEventListener('SETTING_ACCOUNT', (e)=>this.updatePasswordRsp(e));
        UserEditorStore.removeEventListener('SUBMIT_USEREDITOR_FAILURE', (e)=>this.alertMessage(e));
    }

    alertMessage=(req)=>{
        toast(req);
    }

    updatePasswordRsp=(req)=>{
        this.close();
    }

    currentPwdChanged=(e)=>{
        this.setState({currentPwd:e.target.value});
    }

    newPwdChanged=(e)=>{
        this.setState({newPwd:e.target.value});
    }

    currentPwdStatusChanged=()=>{
        this.setState({currentPwdStatus:!this.state.currentPwdStatus});
    }

    newPwdStatusChanged=()=>{
        this.setState({newPwdStatus:!this.state.newPwdStatus});
    }

    saveNewPassword=()=>{
        updateUserPasswordCmd({
            'currentPassswd': this.state.currentPwd.trim(),
            'newPasswd': this.state.newPwd.trim()
        });
    }

    renderContent(){
        let locale = this.state.locale;
        let disabled = (this.state.currentPwd&&this.state.newPwd)?'':'disable';
        let currentPwdStatus = this.state.currentPwdStatus?'hideEyes':'';
        let newPwdStatus = this.state.newPwdStatus?'hideEyes':'';
        return (<div className="resetCacheBox" ref="resetCacheBox">
                    <div className="headTitle">{locale.title}</div>
                    <div className="passwordLine">
                        <div className={`eyesIcon ${currentPwdStatus}`} onClick={this.currentPwdStatusChanged}></div>
                        <input type={this.state.currentPwdStatus?"text":"password"} value={this.state.currentPassswd} autoComplete="off" size="30" className="password" name="currentPwd" onChange={e=>this.currentPwdChanged(e)} placeholder={locale.currentPwd}/>
                    </div>
                    <div className="passwordLine">
                        <div className={`eyesIcon ${newPwdStatus}`} onClick={this.newPwdStatusChanged}></div>
                        <input type={this.state.newPwdStatus?"text":"password"} value={this.state.newPwd} autoComplete="off" size="30" className="password" name="newPwd" onChange={e=>this.newPwdChanged(e)} placeholder={locale.newPwd}/>
                    </div>
                    <button className={`savePwd ${disabled}`} onClick={this.saveNewPassword}>{locale.savePwd}</button>
                </div>
        );
    }
}
