import React from 'react';
import _ from 'underscore';
import ReactDOM from 'react-dom';
import SignupGraphicsPanel from '../SignupGraphicsPanel';
import SignupForm from '../SignupForm';
import ValidatorInput from '../../../components/textinput/ValidatorInput';
import exposeLocale from '../../../components/exposeLocale';
import UserRegisterStore, {RegisterEvents} from '../../../core/stores/UserRegisterStore';
import KeyCode from '../../../utils/enums/EnumKeyCode';
import ValidationUtils from '../../../utils/ValidationUtils';
import {VerifyCodeCmd,ResendRegisterCodeCmd} from '../../../core/commands/RegisterCommands';
import StringUtils from '../../../utils/StringUtils';
import exposePendingCmds from '../../view-components/exposePendingCmds';
import IndexAlertComponent from '../IndexAlertComponent';
import AlertType from '../../../core/enums/EnumAlertType';

@exposeLocale(['REGISTER', 'MemberAuthCode'])
@exposePendingCmds([VerifyCodeCmd])
export default class MemberAuthCodeView extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            toResend: false,
            authCodetips: '',
            authCodevalid: false,
            btnDisable: true,
            resendInterval: 60,
            alertType: AlertType.NoneAlert,
            msg: ''
        };

        this.interval = null;
        this.buttonState = {};
    }

    componentWillMount(){
        this.setResendInterval();
        UserRegisterStore.addEventListener(RegisterEvents.EVENT_FAILURE, this.submitFailure);
    }
    setResendInterval(){
        this.setState({resendInterval: 60, toResend: false});
        this.interval = setInterval(()=>{
            if (this.state.resendInterval>0) {
                this.setState({resendInterval: this.state.resendInterval-1, toResend: false});
            }else{
                clearInterval(this.interval);
                this.setState({resendInterval: 0, toResend: true});
            }
            
        }, 1000);
    }

    componentWillUnmount(){
        clearInterval(this.interval);
        this.interval = null;
        this.buttonState = null;
        UserRegisterStore.removeEventListener(RegisterEvents.EVENT_FAILURE, this.submitFailure);
    }

    submitFailure =message=>{
        this.setState({
            msg: message,
            alertType: AlertType.AlertError
        });
    }

    submit(e){
        VerifyCodeCmd(UserRegisterStore.getEmail(),ReactDOM.findDOMNode(this.refs.authCode).querySelector('input[name]').value.trim());
    }

    toggleButtonState(inputValidator){
        this.buttonState = _.extend(this.buttonState, inputValidator);
        this.setState({
            btnDisable: ValidationUtils.getButtonState(this.buttonState),
            alertType: AlertType.NoneAlert,
            msg: ''
        });
    }

    toggleValidaterStates(validResult){
        this.setState(validResult);
    }

    _onEnterKey(e){
        if (e.keyCode === KeyCode.ENTER) {
            let elem = ReactDOM.findDOMNode(this).querySelector('button');
            elem.click();
        }
    }

    resendAuthCode = e =>{
        ResendRegisterCodeCmd(UserRegisterStore.getEmail()).then(req=>{
            this.setResendInterval();
        }).catch(error=>{
            this.setState({
                msg: error.message,
                alertType: AlertType.AlertError
            });
        });
    }

    render(){
        const {locale, toResend, resendInterval,pendingCmds,alertType,msg,btnDisable} = this.state;
        return (
            <div className="full_height fs_split signup_flow">
                <SignupForm
                    onClick={(e)=>this.submit(e)}
                    disabled={btnDisable}
                    btnLabel={locale.btnLabel}
                    showLoading={pendingCmds.isPending(VerifyCodeCmd)}
                >
                    <IndexAlertComponent alertType={alertType} msg={msg} />
                    <h1>{locale.title}</h1>
                    <ValidatorInput
                        name="authCode" 
                        ref="authCode"
                        datatype="authCode"
                        type="text"
                        placeholder={locale.authCodePlaceholder}
                        tips={this.state.authCodetips}
                        message={locale.authCodeDesc}
                        valid={this.state.authCodevalid}
                        onToggleButtonState={(inputValidator)=>this.toggleButtonState(inputValidator)}
                        onToggleValidaterStates={(validResult)=>this.toggleValidaterStates(validResult)}
                        onKeyDown={(e)=>this._onEnterKey(e)}
                        isFocus={true}
                        className="auth_code"
                        header={locale.authCodePlaceholder}
                    >
                        <button className="g_btn code_btn" disabled={!toResend} onClick={e=>this.resendAuthCode(e)}>{StringUtils.format(locale.resend, resendInterval)}</button>
                    </ValidatorInput>
                </SignupForm>

                <SignupGraphicsPanel GraphicsClassName="companyname_graphics" />
            </div>
        );
    }
}
