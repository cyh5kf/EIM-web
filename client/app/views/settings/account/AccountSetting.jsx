import React from 'react';
import _ from 'underscore';
import {Link} from 'react-router';
import Select from '../../../components/rc-select/Select';
import exposeLocale from '../../../components/exposeLocale';
import LoginStore from '../../../core/stores/LoginStore';
import {settingAccountCmd} from '../../../core/commands/UserEditorCommands';
import ValidationUtils from '../../../utils/ValidationUtils';
import UserEditorStore from '../../../core/stores/UserEditorStore';
import StringUtils from '../../../utils/StringUtils';
import SetupItem from '../../../components/setupitem/SettingItem';
import SetupItems from '../../../components/setupitem/SetupItems';
import ValidatorInput from '../../../components/textinput/ValidatorInput';
import TimeZoneLists from '../../../core/enums/EnumTimeZoneList';
import LButton from '../../../components/button/LoadingButton';
import AlertType from '../../../core/enums/EnumAlertType';
import AccountSettingType from '../../../core/enums/EnumAccountSetingType';

function validValues (obj){
    return ValidationUtils.validUserInfo(obj, gLocaleSettings.VALIDATOR_MESSAGES);
}

@exposeLocale()
export default class AccountSetting extends React.Component{
    constructor(props) {
        super(props);
        this.timeZoneList = TimeZoneLists.dataList();
        this.state = {
            timezone:LoginStore.getTimeZone(),
            username:LoginStore.getUserName(),
            usernamevalid: true,
            usernametips: '',
            passwordtips: '',
            passwordvalid: true,
            emailtips: '',
            emailvalid: true
        };
    }

    componentWillMount(){
        UserEditorStore.addEventListener('SETTING_ACCOUNT', this.onSettingAccountCallback);
    }

    componentWillUnmount(){
        UserEditorStore.removeEventListener('SETTING_ACCOUNT', this.onSettingAccountCallback);
    }

    onSettingAccountCallback=(req)=>{
        if (req.ret) {
            this.props.setAlertContent(AlertType.AlertSuccess, this.props.locale.mainReqMessage);
            
        }else{
            this.props.setAlertContent(AlertType.AlertError, req.error || this.props.locale.mainReqErrorMessage);
        }
    }

    timeZoneCallback=(obj)=>{
        this.setState({timezone: obj.id});
    }

    settingAccount=(type)=>{
        type = parseInt(type,10);
        switch (type){
            case AccountSettingType.SetUserName:
                var username = this.refs.username.state.value.trim();
                var validResult = validValues({'username': username});
                if (validResult.valid) {
                    settingAccountCmd({
                        'type': AccountSettingType.SetUserName,
                        'username': username,
                        'cid': LoginStore.getCid(),
                        'uid': LoginStore.getUID()
                    });
                }else{
                    this.setState({usernamevalid: validResult.valid, usernametips: validResult.errors[0].message});
                }
                break;
            case AccountSettingType.SetPassword:
                var alterCurPassword = this.refs.alterCurPassword.value.trim();
                var alterNewPassword = this.refs.alterNewPassword.state.value.trim();

                var newValidResult = validValues({'password': alterNewPassword});
                if (newValidResult.valid) {
                    settingAccountCmd({
                        'type': AccountSettingType.SetPassword,
                        'currentpswd': alterCurPassword,
                        'newpswd': alterNewPassword,
                        'cid': LoginStore.getCid(),
                        'uid': LoginStore.getUID()
                    });
                }else{
                    this.setState({
                        passwordvalid: newValidResult.valid,
                        passwordtips: newValidResult.errors[0].message
                    });
                }
                break;
            case AccountSettingType.SetEmail:
                var curPassword = this.refs.curPassword.value.trim();
                var alterEmail = this.refs.alterEmail.state.value.trim();
                var emailValidResult = validValues({'email': alterEmail});
                if (emailValidResult.valid) {
                    settingAccountCmd({
                        'type': AccountSettingType.SetEmail,
                        'email': alterEmail,
                        'currentpswd': curPassword,
                        'cid': LoginStore.getCid(),
                        'uid': LoginStore.getUID()
                    });
                }else{
                    this.setState({
                        emailvalid: emailValidResult.valid,
                        emailtips: emailValidResult.errors[0].message
                    });
                }
                break;
            case AccountSettingType.SetTimeZone:
                settingAccountCmd({
                    'type': AccountSettingType.SetTimeZone,
                    'timezone': this.state.timezone,
                    'cid': LoginStore.getCid(),
                    'uid': LoginStore.getUID()
                });
                break;
        }
    }

    initTips(type){
        // this.setState(toggleTips(type, '', false));
    }

    toggleValidaterStates(validResult){
        this.setState(validResult);
    }

    render(){
        let locale = this.props.locale;
        let timezone = this.state.timezone+"";
        let timeZoneList = this.timeZoneList;
        let currentTimeZone = _.find(timeZoneList,ztime=>ztime.id===timezone);
        if(!currentTimeZone){
            currentTimeZone = {};
            console.error("cannot find timezone " + timezone);
        }
        return (
            <ul className="main-panel">
                <SetupItems
                    title={locale.mainUserName}
                >
                    <div className="username_input_container">

                        <ValidatorInput 
                            name="username"
                            autoComplete="off"
                            type="text"
                            datatype="username"
                            initValue={this.state.username}
                            tips={this.state.usernametips}
                            valid={this.state.usernamevalid}
                            placeholder={locale.mainNewUsernameHolder}
                            className="username_input"
                            onToggleValidaterStates={(validResult)=>this.toggleValidaterStates(validResult)}
                            ref="username"
                        />

                        <button type="submit" className="g_btn btn_large" onClick={e=>this.settingAccount(AccountSettingType.SetUserName)}>
                            <span className="ladda-label">{locale.mainSave}</span>
                        </button>
                        <p className="small_top_margin small_bottom_margin input_note">{locale.usernameDesc}  <span className="input_note">{locale.userNote}</span>
                        </p>
                    </div>
                    <p className="input_note">{StringUtils.formatAsReact(locale.usernameNotice, text=><b>{text}</b>)}</p>
                
                </SetupItems>

                <SetupItems
                    title={locale.mainPassword}
                >
                    <div className="password_input_container col span_1_of_2">
                        <p className="small_bottom_margin">
                            <label htmlFor="old_password">{locale.currentPasswordLabel}</label>
                            <input 
                                id="old_password" 
                                name="old_password" 
                                type="password" 
                                datatype="password"
                                placeholder={locale.mainNowPassHolder}
                                autoComplete="off"
                                ref="alterCurPassword"
                            />
                        </p>
                        <p className="small_bottom_margin"> 
                            <label htmlFor="password">{locale.newPasswordLabel}</label>
                            <ValidatorInput 
                                name="password" 
                                type="password" 
                                datatype="password"
                                placeholder={locale.mainNewPassHolder}
                                tips={this.state.passwordtips}
                                valid={this.state.passwordvalid}
                                onToggleValidaterStates={(validResult)=>this.toggleValidaterStates(validResult)}
                                autoComplete="off"
                                ref="alterNewPassword"
                            />
                        </p>
                        <p className="no_bottom_margin">
                            <LButton type="submit" className="g_btn ladda-button" onClick={e=>this.settingAccount(AccountSettingType.SetPassword)}>
                                {locale.savePasswordLabel}
                            </LButton>
                        </p>
                    </div>
                    <div className="clear_both"></div>
                    <p className="resetPassword">
                        <span className="small_right_margin">{locale.resetPasswordTitle}</span>
                        <button type="submit" className="btn btn_small btn_outline">{locale.resetPasswordBtnLabel}</button>
                    </p>
                </SetupItems>

                <SetupItems
                    title={locale.mainTimezone}
                    subtitle={(
                        <span className="messages">
                            <span>{locale.mainTimezoneDesc}</span>
                            <span className="text nowTimeZone">
                                {StringUtils.format(locale.mainTimezoneLabel, currentTimeZone.name)}
                            </span>
                        </span>
                    )}
                    
                    showItem={location.hash==='#timezone'}
                >
                    <div className="oneRow">
                        <div className="timeZoneSelect">
                            <Select showSearch={false} selectedDatasource={timeZoneList.find(item => Number(item.id) === Number(timezone))} datasource={timeZoneList} onSelectedDatasourceChange={this.timeZoneCallback}/>
                        </div>
                        <div className="saveTimeButton">
                            <LButton onClick={e=>this.settingAccount(AccountSettingType.SetTimeZone)}>{locale.saveTimeBtnLabel}</LButton>
                        </div>
                    </div>
                </SetupItems>

                <SetupItems
                    title={locale.mainEmailAddress}
                    subtitle={(
                        <span className="emailDescTxt">
                            {locale.mainEmailLabel}
                            <b>{LoginStore.getUserEmail()}</b>
                        </span>
                    )}
                    showItem={location.hash==='#editEmail'}
                >
                    <div className="password_input_container email_container mission_global span_1_of_2">
                        <p className="small_bottom_margin">
                            <label htmlFor="old_passwords">{locale.currentPasswordLabel}</label>
                            <input 
                                id="old_passwords" 
                                name="old_passwords" 
                                type="password" 
                                placeholder={locale.mainNowPassHolder}
                                autoComplete="off"
                                ref="curPassword"
                            />
                        </p>
                        <p className="small_bottom_margin">
                            <label htmlFor="new_email">{locale.mainNewEmailHolder}</label>
                            <ValidatorInput 
                                id="email" 
                                name="email" 
                                type="email"
                                datatype="email"
                                placeholder={locale.mainNewEmailHolder}
                                autoComplete="off"
                                ref="alterEmail"
                                tips={this.state.emailtips}
                                valid={this.state.emailvalid}
                                onToggleValidaterStates={(validResult)=>this.toggleValidaterStates(validResult)}
                            />
                        </p>
                        <LButton onClick={e=>this.settingAccount(AccountSettingType.SetEmail)}>{locale.updateEmailBtnLabel}</LButton>
                    </div>
                </SetupItems>

                <SetupItem
                    title={locale.mainLogoffOthers}
                    itemType={5}
                    showItem={true}
                    className="no_right_padding"
                    closeTips={this.initTips.bind(this)}
                >
                    <div className="signout_session_line mission_global">
                        <div className="sign_descp">{locale.mainLogoffDesc}</div>
                        <div className="signout_button_box">
                            <Link to="/settings/manage-account/signout"><LButton className="g_btn signout_session btn_warning"><i className="ficon_sign_out"></i> {locale.mainLogoutLabel}</LButton></Link>
                        </div>
                    </div>
                    
                </SetupItem>

                <SetupItem
                    title={locale.mainInactiveAccount}
                    itemType={6}
                    showItem={true}
                    className="no_right_padding"
                    closeTips={this.initTips.bind(this)}
                >
                    <div className="signout_session_line mission_global">
                        <div className="sign_descp" dangerouslySetInnerHTML={{__html: StringUtils.format(locale.mainInactiveDesc, LoginStore.getCompanyName())}}></div>
                        <div className="signout_button_box">
                            <button className="accordion_expand g_btn btn_outline inacitve_button">{locale.mainInactiveLabel}</button>
                        </div>
                    </div>
                    <div className="note_messsge_desc">
                        {StringUtils.formatAsReact(locale.noteMessageDesc,text=><b>{text}</b>, changeEmailDesc=><a className="bold">{changeEmailDesc}</a>, changeUserDesc=><a className="bold">{changeUserDesc}</a>)}
                    </div>
                </SetupItem>
            </ul>
        );
    }
}
