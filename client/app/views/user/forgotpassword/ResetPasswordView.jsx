import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderComponent from '../../../components/PureRenderComponent';
import ReactPropTypes from '../../../core/ReactPropTypes';
import ForgotPasswordStore, {RESET_PASSWORD_EVENTS} from '../../../core/stores/ForgotPasswordStore';
import {ResetPasswordCmd} from '../../../core/commands/ForgotPasswordCommands';
import exposePendingCmds from '../../view-components/exposePendingCmds';
import ValidatorInput from '../../../components/textinput/ValidatorInput';
import LoadingButton,{LOADING_STATUS} from '../../../components/button/LoadingButton';
import AlertType from '../../../core/enums/EnumAlertType';
import IndexAlertComponent from '../IndexAlertComponent';
import ValidationUtils from '../../../utils/ValidationUtils';
import _ from 'underscore';

@exposePendingCmds([ResetPasswordCmd])
export default class ResetPasswordView extends PureRenderComponent {
    constructor(props) {
        super(props);
        this.state ={
            isSuccessAlert: false,
            errorMsg: '',
            alertType: AlertType.NoneAlert,
            passwordvalid: false,
            passwordtips: '',
            confirmPasswordvalid: false,
            confirmPasswordtips: '',
            btnDisable: true
        };
        this.buttonState= {};
    }

    static propTypes = {
        locale: ReactPropTypes.ofLocale(['LOGIN_FORGET_PASSWORD'])
    };

    componentWillMount(){
        ForgotPasswordStore.addEventListener(RESET_PASSWORD_EVENTS.RESET_PSD_SUCCESS, this.resetSuccess);
        ForgotPasswordStore.addEventListener(RESET_PASSWORD_EVENTS.RESET_PSD_FAILURE, this.resetFailure);
    }

    componentWillUnmount(){
        this.buttonState = null;
        ForgotPasswordStore.removeEventListener(RESET_PASSWORD_EVENTS.RESET_PSD_SUCCESS, this.resetSuccess);
        ForgotPasswordStore.removeEventListener(RESET_PASSWORD_EVENTS.RESET_PSD_FAILURE, this.resetFailure);
    }

    resetSuccess = ()=>{
        this.setState({isSuccessAlert: true});
    }

    resetFailure = msg=>{
        this.setState({isSuccessAlert: false, errorMsg: msg, alertType: AlertType.AlertError});
    }

    submit(e){
        let psdValue = ReactDOM.findDOMNode(this.refs.password).querySelector('input[name]').value.trim();
        let confirmPsdValue = ReactDOM.findDOMNode(this.refs.confirmPassword).querySelector('input[name]').value.trim();
        if (psdValue === confirmPsdValue) {
            ResetPasswordCmd(ForgotPasswordStore.getAll(), psdValue);
        }else{
            this.setState({
                alertType: AlertType.AlertError,
                errorMsg: this.props.locale.reset.diffPasswordTips
            });
        }
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
        const {isSuccessAlert,errorMsg, alertType} = this.state, {locale} = this.props;
        let successContent = null;

        if (isSuccessAlert) {
            successContent = (
                <div className="page_contents">
                    <div className="card align_center span_4_of_6 col float_none margin_auto large_bottom_margin right_padding large_bottom_padding">
                        <h1>{locale.settingSuccess.title}</h1>
                        <div className="col span_4_of_6 float_none margin_auto large_bottom_margin no_right_padding">
                            <p>{locale.settingSuccess.message}</p>
                            <hr/>
                        </div>
                    </div>
                </div>
            );
        }else{
            let showLoading = this.state.pendingCmds.isPending(ResetPasswordCmd);
            successContent = (
                <div className="page_contents">
                    <div className="span_4_of_6 col float_none margin_auto no_right_padding">
                        <IndexAlertComponent alertType={alertType} msg={errorMsg} />
                    </div>
                    <div className="card card1 align_center span_4_of_6 col float_none margin_auto large_bottom_margin right_padding large_bottom_padding">
                        <h1 className="align_center">{locale.reset.title}</h1>

                        <div className="col span_4_of_6 float_none margin_auto large_bottom_margin no_right_padding">
                            <p className="title_desc">{locale.reset.desc}</p>
                            <ValidatorInput 
                                type="password"
                                datatype="password"
                                ref="password"
                                name="password" 
                                size="40" 
                                placeholder={locale.reset.psdPlaceholder}
                                isFocus={true}
                                header={locale.reset.psdPlaceholder}
                                onToggleButtonState={(inputValidator)=>this.toggleButtonState(inputValidator)}
                                onToggleValidaterStates={(validResult)=>this.toggleValidaterStates(validResult)}
                                tips={this.state.passwordtips}
                                valid={this.state.passwordvalid}
                            />
                            <ValidatorInput 
                                type="password"
                                datatype="password"
                                ref="confirmPassword"
                                name="confirmPassword" 
                                size="40" 
                                placeholder={locale.reset.confirmPsdPlaceholder}
                                header={locale.reset.confirmPsdPlaceholder}
                                onToggleButtonState={(inputValidator)=>this.toggleButtonState(inputValidator)}
                                onToggleValidaterStates={(validResult)=>this.toggleValidaterStates(validResult)}
                                tips={this.state.confirmPasswordtips}
                                valid={this.state.confirmPasswordvalid}
                            />
                            <LoadingButton 
                                className="g_btn btn_large login_btn"
                                loading={showLoading? LOADING_STATUS.Loading: LOADING_STATUS.NoLoading}
                                onClick={(e) =>this.submit(e)}
                                disabled={this.state.btnDisable}
                            >
                                {locale.reset.btnLabel}
                            </LoadingButton>
                        </div>
                    </div>   
                </div>
            );
        }
        
        return successContent;
    }
}