import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';
import SignupGraphicsPanel from '../SignupGraphicsPanel';
import SignupForm from '../SignupForm';
import ValidatorInput from '../../../components/textinput/ValidatorInput';
import exposeLocale from '../../../components/exposeLocale';
import KeyCode from '../../../utils/enums/EnumKeyCode';
import ValidationUtils from '../../../utils/ValidationUtils';
import UserRegisterStore,{RegisterEvents} from '../../../core/stores/UserRegisterStore';
import {RegistUserCmd} from '../../../core/commands/RegisterCommands';
import exposePendingCmds from '../../view-components/exposePendingCmds';
import AlertType from '../../../core/enums/EnumAlertType';
import PureRenderComponent from '../../../components/PureRenderComponent';
import IndexAlertComponent from '../IndexAlertComponent';

@exposeLocale(['REGISTER', 'MemberUserInfo'])
@exposePendingCmds([RegistUserCmd])
export default class MemberUserInfoView extends PureRenderComponent{
    constructor(props) {
        super(props);
        this.state = {
            usernamevalid: false,
            usernametips: '',
            usernameValue: UserRegisterStore.getEmailName(),
            passwordvalid: false,
            passwordtips: '',
            confirmPasswordvalid: false,
            confirmPasswordtips: '',
            btnDisable: true,
            alertType: AlertType.NoneAlert,
            message: ''
        };
        this.buttonState= {};
        
    }

    componentWillMount(){
        UserRegisterStore.addEventListener(RegisterEvents.EVENT_FAILURE, this.submitFailure);
    }

    componentWillUnmount(){
        this.buttonState = null;
        UserRegisterStore.removeEventListener(RegisterEvents.EVENT_FAILURE, this.submitFailure);
    }

    submitFailure=msg=>{
        this.setState({alertType: AlertType.AlertError, message: msg});
    }

    submit(e){
        e.preventDefault();
        let userNameValue=ReactDOM.findDOMNode(this.refs.username).querySelector('input[name]').value.trim(),
            passwordValue = ReactDOM.findDOMNode(this.refs.password).querySelector('input[name]').value.trim(),
            confimrPasswordValue = ReactDOM.findDOMNode(this.refs.confirmPassword).querySelector('input[name]').value.trim();
        if (passwordValue === confimrPasswordValue) {
            RegistUserCmd({
                email: UserRegisterStore.getEmail(),
                password: passwordValue,
                userName: userNameValue,
                token: UserRegisterStore.getToken(),
                authCode: UserRegisterStore.getAuthCode(),
                timezone: (new Date()).getTimezoneOffset().toString()
            });
        }else{
            this.setState({alertType: AlertType.AlertError, message: this.state.locale.confirmError});
        }
    }

    toggleButtonState(buttonState){
        this.buttonState = _.extend(this.buttonState, buttonState);
        this.setState({
            btnDisable: ValidationUtils.getButtonState(this.buttonState),
            alertType: AlertType.NoneAlert,
            message: ''
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

    render(){
        const {locale,pendingCmds,alertType,message, btnDisable} = this.state;
        
        return (
            <div className="full_height fs_split signup_flow">
                <SignupForm
                    onClick={(e)=>this.submit(e)}
                    disabled={btnDisable}
                    btnLabel={locale.btnLabel}
                    showLoading={pendingCmds.isPending(RegistUserCmd)}
                >
                        <IndexAlertComponent  alertType={alertType} msg={message} />
                        <h1>{locale.title}</h1>
                        <p className="desc">{locale.titleDesc}</p>
                        <ValidatorInput
                            name="username" 
                            type="text" 
                            datatype="username"
                            ref="username"
                            placeholder={locale.usernamePlaceholder} 
                            tips={this.state.usernametips}
                            valid={this.state.usernamevalid}
                            onToggleButtonState={(inputValidator)=>this.toggleButtonState(inputValidator)}
                            onToggleValidaterStates={(validResult)=>this.toggleValidaterStates(validResult)}
                            onKeyDown={(e)=>this._onEnterKey(e)}
                            isFocus={true}
                            initValue={this.state.usernameValue}
                            header={locale.usernamePlaceholder}
                        />
                        <ValidatorInput
                            name="password" 
                            type="password" 
                            datatype="password"
                            ref="password"
                            tips={this.state.passwordtips}
                            valid={this.state.passwordvalid}
                            onToggleButtonState={(inputValidator)=>this.toggleButtonState(inputValidator)}
                            onToggleValidaterStates={(validResult)=>this.toggleValidaterStates(validResult)}
                            onKeyDown={(e)=>this._onEnterKey(e)}
                            placeholder={locale.passwordPlaceholder}
                            header={locale.passwordPlaceholder}
                        />

                        <ValidatorInput
                            name="confirmPassword" 
                            type="password" 
                            datatype="password"
                            ref="confirmPassword"
                            placeholder={locale.confirmPasswordPlaceholder} 
                            tips={this.state.confirmPasswordtips}
                            valid={this.state.confirmPasswordvalid}
                            onToggleButtonState={(inputValidator)=>this.toggleButtonState(inputValidator)}
                            onToggleValidaterStates={(validResult)=>this.toggleValidaterStates(validResult)}
                            onKeyDown={(e)=>this._onEnterKey(e)}
                            header={locale.confirmPasswordPlaceholder}
                        />
                </SignupForm>

                <SignupGraphicsPanel GraphicsClassName="companyemail_graphics" />
            </div>
        );
        
    }
}
