import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';
import SignupGraphicsPanel from '../SignupGraphicsPanel';
import SignupForm from '../SignupForm';
import ValidatorInput from '../../../components/textinput/ValidatorInput';
import ValidationUtils from '../../../utils/ValidationUtils';
import exposeLocale from '../../../components/exposeLocale';
import UserRegisterStore,{RegisterEvents} from '../../../core/stores/UserRegisterStore';
import KeyCode from '../../../utils/enums/EnumKeyCode';
import AlertType from '../../../core/enums/EnumAlertType';
import {CheckEmailCmd, SendAuthCodeCmd} from '../../../core/commands/RegisterCommands';
import exposePendingCmds from '../../view-components/exposePendingCmds';
import PureRenderComponent from '../../../components/PureRenderComponent';
import IndexAlertComponent from '../IndexAlertComponent';
import {browserHistory} from 'react-router';

@exposeLocale(['REGISTER', 'MemberEmail'])
@exposePendingCmds([SendAuthCodeCmd, CheckEmailCmd])
export default class MemberEmailView extends PureRenderComponent{
    constructor(props){
        super(props);
        this.state = {
            email: UserRegisterStore.getEmail(),
            emailvalid: true,
            emailtips: '',
            btnDisable: true,
            alertType: AlertType.NoneAlert,
            message: ''
        };

        this.buttonState= {};
    }

    componentWillMount(){
        UserRegisterStore.addEventListener(RegisterEvents.EVENT_FAILURE, this.sendFailure);
        UserRegisterStore.addEventListener(RegisterEvents.CHECK_EMAIL_SUCCESS, this.checkEmailSuccess);
        UserRegisterStore.addEventListener(RegisterEvents.EMAIL_REGISTED, this.registedEmail);
    }

    componentWillUnmount(){
        this.buttonState = null;
        UserRegisterStore.removeEventListener(RegisterEvents.EVENT_FAILURE, this.sendFailure);
        UserRegisterStore.removeEventListener(RegisterEvents.CHECK_EMAIL_SUCCESS, this.checkEmailSuccess);
        UserRegisterStore.removeEventListener(RegisterEvents.EMAIL_REGISTED, this.registedEmail);
    }

    sendFailure=message=>{
        this.buttonState = _.extend(this.buttonState, {email: false});
        this.setState({
            'message': message,
            'btnDisable': ValidationUtils.getButtonState(this.buttonState),
            'alertType': AlertType.AlertError
        });
    }

    registedEmail = email =>{
        browserHistory.push({pathname: "/signin", state: {email: email}});
    }

    checkEmailSuccess = email =>{
        SendAuthCodeCmd(email);
    }

    submit(e){
        CheckEmailCmd(ReactDOM.findDOMNode(this).querySelector('input[name="email"]').value.trim());
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
        const {locale,pendingCmds, alertType, message,btnDisable} = this.state;
        return (
            <div className="full_height fs_split signup_flow">
                <SignupForm 
                    onClick={(e)=>this.submit(e)}
                    disabled={btnDisable}
                    btnLabel={locale.btnLabel}
                    showCheckBox={true}
                    showLoading={pendingCmds.isPending(SendAuthCodeCmd)}
                >
                    <IndexAlertComponent alertType={alertType} msg={message} />
                    <h1>{locale.title}</h1>
                    <ValidatorInput
                        name="email"
                        type="email"
                        datatype="email"
                        initValue={this.state.email}
                        placeholder={locale.emailPlaceholder}
                        message={locale.emailDesc}
                        tips={this.state.emailtips}
                        valid={this.state.emailvalid}
                        onToggleButtonState={(inputValidator)=>this.toggleButtonState(inputValidator)}
                        onToggleValidaterStates={(validResult)=>this.toggleValidaterStates(validResult)}
                        onKeyDown={(e)=>this._onEnterKey(e)}
                        isFocus={true}
                        header={locale.emailPlaceholder}
                    />
                </SignupForm>
                <SignupGraphicsPanel 
                    GraphicsClassName="companyemail_graphics"
                />
            </div>
        );
    }
}
