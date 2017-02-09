import React from 'react';
import ReactDOM from 'react-dom';
import ValidationUtils from '../../../utils/ValidationUtils';
import KeyCode from '../../../utils/enums/EnumKeyCode';
import {SendPasswordAuthCodeCmd, CheckEmailCmd} from '../../../core/commands/ForgotPasswordCommands';
import exposePendingCmds from '../../view-components/exposePendingCmds';
import LoadingButton,{LOADING_STATUS} from '../../../components/button/LoadingButton';
import TextInput,{AUTOCOMPLETE_TYPE} from '../../../components/textinput/TextInput';
import PureRenderComponent from '../../../components/PureRenderComponent';
import ReactPropTypes from '../../../core/ReactPropTypes';
import ForgotPasswordStore,{RESET_PASSWORD_EVENTS} from '../../../core/stores/ForgotPasswordStore';
import AlertType from '../../../core/enums/EnumAlertType';
import IndexAlertComponent from '../IndexAlertComponent';

@exposePendingCmds([SendPasswordAuthCodeCmd, CheckEmailCmd])
export default class ForgotPasswordView extends PureRenderComponent {
    constructor(props) {
        super(props);
        this.state = {
            alertType: AlertType.NoneAlert,
            tips: '',
            emailValue: props.email
        };
    }

    static propTypes = {
        locale: ReactPropTypes.ofLocale(['LOGIN_FORGET_PASSWORD']),
        email: ReactPropTypes.string
    };

    componentWillMount(){
        ForgotPasswordStore.addEventListener(RESET_PASSWORD_EVENTS.EVENT_FAILURE, this.submitFailure);
        ForgotPasswordStore.addEventListener(RESET_PASSWORD_EVENTS.CHECK_EMAIL_SUCCESS,this.checkEmailSuccess);
    }

    componentWillUnmount(){
        ForgotPasswordStore.removeEventListener(RESET_PASSWORD_EVENTS.EVENT_FAILURE, this.submitFailure);
        ForgotPasswordStore.removeEventListener(RESET_PASSWORD_EVENTS.CHECK_EMAIL_SUCCESS,this.checkEmailSuccess);
    }

    submitFailure = msg=>{
        this.setState({alertType: AlertType.AlertError, tips: msg});
    }

    checkEmailSuccess = email=>{
        SendPasswordAuthCodeCmd(email);
    }

    submit(e){
        e.preventDefault();
        var validResult = ValidationUtils.validateData({
            "value": this.state.emailValue,
            "datatype": "email",
            "name": "email"
        }, gLocaleSettings.VALIDATOR_MESSAGES);
        if (validResult.valid) {
            CheckEmailCmd(this.state.emailValue);
        }else{
            this.setState({alertType: AlertType.AlertError, tips: validResult.errors[0].message});
        }
        
    }

     _onEnterKey(e){
        if (e.keyCode === KeyCode.ENTER) {
            let elem = ReactDOM.findDOMNode(this).querySelector('button');
            elem.click();
        }
    }

    render(){
        const {pendingCmds,alertType,tips,emailValue} = this.state, {locale} = this.props;
        let showLoading = pendingCmds.isPending(SendPasswordAuthCodeCmd);

        return (
            <div className="page_contents">
                <div className="span_4_of_6 col float_none margin_auto no_right_padding">
                    <IndexAlertComponent alertType={alertType} msg={tips} />
                </div>
                <div className="card card1 align_center span_4_of_6 col float_none margin_auto large_bottom_margin right_padding large_bottom_padding">
                    <h1>{locale.email.title}</h1>
                    <div className="col span_4_of_6 float_none margin_auto large_bottom_margin no_right_padding">
                        <p className="title_desc">{locale.email.desc}</p>
                        <TextInput 
                            type="email"
                            datatype="email"
                            ref="email"
                            name="email" 
                            size="40" 
                            placeholder={locale.email.emailPlaceholder}
                            onKeyDown={(e)=>this._onEnterKey(e)}
                            value={emailValue}
                            onChange={e=>this.setState({emailValue: e.target.value.trim(),alertType: AlertType.NoneAlert, tips: ''})}
                            isFocus={true}
                            header={locale.email.emailPlaceholder}
                            visibleHeader={!!emailValue}
                            autoComplete={AUTOCOMPLETE_TYPE.on}
                        />
                        <LoadingButton 
                            className="g_btn btn_large login_btn"
                            loading={showLoading? LOADING_STATUS.Loading: LOADING_STATUS.NoLoading}
                            onClick={(e) =>this.submit(e)}
                        >
                            {locale.email.btnLabel}
                        </LoadingButton>
                    </div>
                </div>   
            </div>
        );
    }
}
