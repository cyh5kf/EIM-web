import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';
import exposePendingCmds from '../../view-components/exposePendingCmds';
import LoadingButton,{LOADING_STATUS} from '../../../components/button/LoadingButton';
import ValidatorInput from '../../../components/textinput/ValidatorInput';
import PureRenderComponent from '../../../components/PureRenderComponent';
import ReactPropTypes from '../../../core/ReactPropTypes';
import ForgotPasswordStore,{RESET_PASSWORD_EVENTS} from '../../../core/stores/ForgotPasswordStore';
import {ResendPasswordAuthCodeCmd,VerifyPasswordAuthCodeCmd} from '../../../core/commands/ForgotPasswordCommands';
import StringUtils from '../../../utils/StringUtils';
import AlertType from '../../../core/enums/EnumAlertType';
import IndexAlertComponent from '../IndexAlertComponent';
import ValidationUtils from '../../../utils/ValidationUtils';

@exposePendingCmds([VerifyPasswordAuthCodeCmd])
export default class PasswordAuthCodeView extends PureRenderComponent {
    constructor(props) {
        super(props);
        this.state = {
            alertType: AlertType.NoneAlert,
            resendInterval: 60,
            toResend: false,
            authCodetips: '',
            authCodevalid: true,
            errorMsg: '',
            btnDisable: true,
            authCode: ''
        };

        this.interval = null;
        this.buttonState = {};
    }

    static propTypes = {
        locale: ReactPropTypes.ofLocale(['LOGIN_FORGET_PASSWORD'])
    };

    componentDidMount(){
        this.setResendInterval();
    }

    componentWillMount(){
        ForgotPasswordStore.addEventListener(RESET_PASSWORD_EVENTS.VERIFY_CODE_FAILURE, this.verifyCodeFailure);
    }

    componentWillUnmount(){
        clearInterval(this.interval);
        this.interval = null;
        this.buttonState = null;

        ForgotPasswordStore.removeEventListener(RESET_PASSWORD_EVENTS.VERIFY_CODE_FAILURE, this.verifyCodeFailure);
    }

    verifyCodeFailure = msg=>{
        this.setState({
            errorMsg: msg,
            alertType: AlertType.AlertError
        });
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

    resendAuthCode(e){
        ResendPasswordAuthCodeCmd(ForgotPasswordStore.getEmail()).then(req=>{
            this.setResendInterval();
        }).catch(error=>{
            this.setState({
                errorMsg: error.message,
                alertType: AlertType.AlertError,
                resendInterval: 0,
                toResend: true
            });
        });
    }

    submit(e){
        let authCode = ReactDOM.findDOMNode(this.refs.authCode).querySelector('input[name]').value.trim();
        VerifyPasswordAuthCodeCmd(ForgotPasswordStore.getEmail(), authCode);
    }

    toggleButtonState(buttonState){
        this.buttonState = _.extend(this.buttonState, buttonState);
        this.setState({
            btnDisable: ValidationUtils.getButtonState(this.buttonState),
            alertType: AlertType.NoneAlert,
            errorMsg: ''
        });
    }

    toggleValidaterStates(validResult){
        this.setState(validResult);
    }

    render(){
        let {locale} = this.props,{resendInterval, alertType, errorMsg,pendingCmds,toResend,authCode,btnDisable} = this.state;
        let showLoading = pendingCmds.isPending(VerifyPasswordAuthCodeCmd);
        
        return (
            <div className="page_contents">
                <div className="span_4_of_6 col float_none margin_auto no_right_padding">
                    <IndexAlertComponent alertType={alertType} msg={errorMsg} />
                </div>
                <div className="card card2 align_center span_4_of_6 col float_none margin_auto large_bottom_margin right_padding large_bottom_padding">
                    <h1>{locale.authCode.title}</h1>

                    <div className="col span_4_of_6 float_none margin_auto large_bottom_margin no_right_padding">                        
                        <ValidatorInput
                            name="authCode" 
                            ref="authCode"
                            datatype="authCode"
                            type="text"
                            initValue={authCode}
                            placeholder={locale.authCode.authCodePlaceholder}
                            tips={this.state.authCodetips}
                            message={StringUtils.format(locale.authCode.desc, ForgotPasswordStore.getEmail())}
                            valid={this.state.authCodevalid}
                            onToggleButtonState={(inputValidator)=>this.toggleButtonState(inputValidator)}
                            onToggleValidaterStates={(validResult)=>this.toggleValidaterStates(validResult)}
                            isFocus={true}
                            className="auth_code"
                            header={locale.authCode.authCodePlaceholder}
                        >
                            <button className="g_btn code_btn" disabled={!toResend} onClick={e=>this.resendAuthCode(e)}>{StringUtils.format(locale.authCode.resendBtnLabel, resendInterval)}</button>
                        </ValidatorInput>
                        <LoadingButton 
                            className="g_btn btn_large login_btn"
                            loading={showLoading? LOADING_STATUS.Loading: LOADING_STATUS.NoLoading}
                            onClick={(e) =>this.submit(e)}
                            disabled={btnDisable}
                        >
                            {locale.authCode.btnLabel}
                        </LoadingButton>
                    </div>

                </div>   
            </div>
        );
    }
}