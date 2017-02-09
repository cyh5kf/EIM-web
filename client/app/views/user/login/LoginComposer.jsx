import React from 'react';
import ReactDOM from 'react-dom';
import IndexLayoutComponent, {IndexMenu} from '../../index/IndexLayoutComponent';
import exposeLocale from '../../../components/exposeLocale';
import ValidationUtils from '../../../utils/ValidationUtils';
import LoginStore from '../../../core/stores/LoginStore';
import IndexAlertComponent from '../IndexAlertComponent';
import KeyCode from '../../../utils/enums/EnumKeyCode';
import NavLink from '../../../components/navlink/NavLink';
import AlertType from '../../../core/enums/EnumAlertType';
import {LoginAccountCmd} from '../../../core/commands/LoginCommands';
import exposePendingCmds from '../../view-components/exposePendingCmds';
import LandingButton,{LOADING_STATUS} from '../../../components/button/LoadingButton';
import TextInput,{AUTOCOMPLETE_TYPE} from '../../../components/textinput/TextInput';
import NavTabs from '../../../components/nav-tabs/NavTabs';
import classnames from '../../../utils/ClassNameUtils';
import ReactPropTypes from '../../../core/ReactPropTypes';

import "./LoginComposer.less";

export const LoginTab = {
    QRCODE: "QRCode",
    EMAIL: "email"
};

@exposeLocale(['LOGIN_ACCOUNT'])
@exposePendingCmds([LoginAccountCmd])
export default class LoginComposer extends React.Component {
    constructor(props) {
        super(props);
        const tabCurKey = LoginTab.EMAIL;
        this.state = {
            alertType: AlertType.NoneAlert,
            emailValue: props.location.state? props.location.state.email : '',
            tips: '',
            keeplognin: true,
            tabCurKey: tabCurKey,
            passwordValue: '',
            visiblePsd: false
        };
    }

    static propTypes = {
        location: ReactPropTypes.object
    }

    componentWillUnmount(){
        LoginStore.removeEventListener('LOGIN_ERROR', this.onLoginFailure);
    }
    componentWillMount(){
        LoginStore.addEventListener('LOGIN_ERROR', this.onLoginFailure);
    }

    onLoginFailure = ({alertType, message})=>{
        this.setState({alertType: alertType, tips: message});
    }

    renderNavTabs() {
        let {locale,tabCurKey} = this.state;
        let tabItems = [
            {key: LoginTab.QRCODE, label: locale.tabQRCode},
            {key: LoginTab.EMAIL, label: locale.tabEmail}
        ];
        return <NavTabs navStyle="bottom-bordered" activeKey={tabCurKey} items={tabItems} onSelect={status=>this.setState({tabCurKey: status})}/>;
    }

    renderEmailLogin(){
        let {locale,pendingCmds, emailValue,passwordValue,visiblePsd} = this.state;
        return (
            <div ref="loginform" className={classnames("col span_4_of_6 float_none margin_auto large_bottom_margin no_right_padding", this.props.location.state? "registed_wrap": "large_top_padding")}>
                <p className="registed_tips">{locale.RegistedTipsLabel}</p>
                <TextInput 
                    type="email"
                    datatype="email"
                    ref="email"
                    name="email" 
                    size="40" 
                    placeholder={locale.emailPlaceholder}
                    onKeyDown={(e)=>this._onEnterKey(e)}
                    value={emailValue}
                    onChange={e=>this.setState({emailValue: e.target.value.trim(),alertType: AlertType.NoneAlert,tips: ''})}
                    isFocus={true}
                    header={locale.emailPlaceholder}
                    visibleHeader={!!emailValue}
                    autoComplete={AUTOCOMPLETE_TYPE.on}
                />
                <TextInput 
                    type={visiblePsd? "text": "password"}
                    datatype="password"
                    ref="password"
                    name="password" 
                    size="40" 
                    placeholder={locale.passwordPlaceholder}
                    onKeyDown={(e)=>this._onEnterKey(e)} 
                    value={passwordValue}
                    onChange={e=>this.setState({passwordValue: e.target.value.trim(),alertType: AlertType.NoneAlert,tips: ''})}
                    header={locale.passwordPlaceholder}
                    visibleHeader={!!passwordValue}
                    autoComplete={AUTOCOMPLETE_TYPE.on}
                    className="visible_psd_wrap"
                >
                    <i className={classnames("visible_psd", visiblePsd? "ficon_eye_closed" : "ficon_eye")} onClick={e=>this.setState({visiblePsd: !this.state.visiblePsd})}></i>
                </TextInput>
                <LandingButton 
                    className="g_btn btn_large login_btn" 
                    loading={pendingCmds.isPending(LoginAccountCmd)? LOADING_STATUS.Loading:LOADING_STATUS.NoLoading} 
                    onClick={(e) =>this.submit(e)}
                    id="login_account"
                >
                    {locale.btnLabel}
                </LandingButton>
                <span className="login_desc">
                    <label className="keep_login">
                        <input 
                            type="checkbox"
                            name="remember"
                            defaultChecked={this.state.keeplognin}
                            onChange={this.clickCheckBox.bind(this)}
                        />
                        {locale.rememberMe}
                    </label>
                    <NavLink to={{pathname: "/forgot", state: {email: this.getEmail()}}} className="forgotpassword_link">{locale.forgetPassword}</NavLink>
                </span>
            </div>
        );
    }

    renderQRCodeLogin(){

    }

    submit(e){
        e.preventDefault();

        let arr = ReactDOM.findDOMNode(this.refs.loginform).querySelectorAll('input[name]');

        for (var i = 0; i< arr.length; i++) {
            var elem = arr[i];
            var validResult = ValidationUtils.validateData({
                "value": elem.value,
                "datatype": elem.getAttribute('datatype'),
                "name": elem.getAttribute('name')
            }, gLocaleSettings.VALIDATOR_MESSAGES);

            if (!validResult.valid) {
                this.setState({alertType: AlertType.AlertWarning, tips: validResult.errors[0].message});
                return null;
            }
        }

        LoginAccountCmd(arr[0].value.trim(), arr[1].value.trim(), this.state.keeplognin);
    }

    getEmail=()=>{
        const {emailValue} = this.state;
        if (ValidationUtils.validateData({value: emailValue, datatype: 'email'}, gLocaleSettings.VALIDATOR_MESSAGES).valid) return emailValue;
        return '';
    }

    clickCheckBox(){
        this.setState({keeplognin: !this.state.keeplognin});
    }

    _onEnterKey(e){
        if (e.keyCode === KeyCode.ENTER) {
            let elem = ReactDOM.findDOMNode(this).querySelector('button[id="login_account"]');
            elem.click();
        }
    }

    render(){
        const {locale, tabCurKey, alertType, tips} = this.state;

        return (
            <IndexLayoutComponent
                indexBackground="login_layout"
                navClass="login_nav"
                indexMenu={IndexMenu.SIGNIN}
            >
                <div className="page_contents">
                    <div className="span_4_of_6 col float_none margin_auto no_right_padding">
                        <IndexAlertComponent alertType={alertType} msg={tips} />
                    </div>

                    <div className="card align_center span_4_of_6 col float_none margin_auto large_bottom_margin right_padding large_bottom_padding">
                        <h1> {locale.title}</h1>
                        {this.renderNavTabs()}
                        {tabCurKey===LoginTab.EMAIL&&this.renderEmailLogin()}
                        {tabCurKey===LoginTab.QRCODE&&this.renderQRCodeLogin()}
                    </div>                     
                </div>
            </IndexLayoutComponent>
        );
    }
}
