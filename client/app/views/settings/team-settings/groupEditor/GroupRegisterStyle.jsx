import React from 'react';
import _ from 'underscore';
import toast from '../../../../components/popups/toast';
import SaveButton from '../../../../components/button/LoadingButton';
import exposeLocale from '../../../../components/exposeLocale';

@exposeLocale(['DIALOGS', 'dlg-accountInfo'])
export default class GroupRegisterStyle extends React.Component{

    constructor(props) {
        super(props);
        let company = this.props.companyDetails;
        this.state = {show:true,
            signupmode:company.signupmode,
            emaildomain:company.emaildomain,
            disabled:''
        };
    }
    
    componentDidMount(){

    }

    componentWillReceiveProps(nextProps) {
        this.setState({company:_.clone(nextProps.companyDetails,true)});
    }

    registerOptionClick(signupmode){
        this.setState({signupmode:signupmode});
        this.props.parent.setSaveBtnState(1, 0);//按钮状态变成 恢复正常
    }
    
    microEmailChange(e){
        let emaildomain = e.target.value;
        this.setState({emaildomain:emaildomain});
    }

    saveRegisterStyleClick(){
        event.preventDefault();
        let locale = this.props.locale;
        let signupmode = this.state.signupmode;
        let emaildomain = this.state.emaildomain;
        if (!this.validateEmailDomain(signupmode,emaildomain)){
            toast(locale.inputEmailDomainMsg);
        }
        else{
            let setting = {
                signupmode:signupmode,
                emaildomain:emaildomain
            };
            this.props.parent.updateCompanySetting(setting,1);
        }
    }

    validateEmailDomain(signupmode,emaildomain){
        let result = true;
        if (signupmode===2){
            let emailDomianArr = emaildomain.split(",");
            if (emailDomianArr&&emailDomianArr.length>0){
                for (var i = 0; i < emailDomianArr.length; i++) {
                    var val = emailDomianArr[i];
                    if (!/[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)/.test(val)){
                        result = false;
                        break;
                    }
                }
            }
            else{
                result = false;
            }
        }
        return result;
    }
    
    render(){
        let locale1 = this.state.locale;
        let locale = this.props.locale;
        let btnState = this.props.btnState || 0; ////0 正常,1 loading, 2 saved
        let signupmode = this.state.signupmode;
        return (<div className="settingContent registerStyle">
                    <ul className="optionList">
                        <li data-value="1" className={signupmode===1?'selected':''}><div className="eim-radio" onClick={this.registerOptionClick.bind(this,1)}></div>{locale.regStyleOption1}</li>
                        <li data-value="2" className={signupmode===2?'selected':''}>
                            <div className="eim-radio multiLine" onClick={this.registerOptionClick.bind(this,2)}></div>
                            <div className="registerLabel">{locale.regStyleOption2}</div>
                        </li>
                        <p className="small_bottom_margin">
                            <textarea type="text" disabled={signupmode===1?'disabled':''} className="email_style" onChange={this.microEmailChange.bind(this)} value={this.state.emaildomain}/>
                        </p>
                    </ul>
                    <div className="buttonBoxLine" onClick={this.saveRegisterStyleClick.bind(this)}>
                        <SaveButton className="green" loading={btnState}>
                            {btnState===2?locale1.noticeSaved:locale1.saveSetting}
                        </SaveButton>
                    </div>
                    <div className="clearfix"></div>
                </div>);
    }
    
}

GroupRegisterStyle.propTypes = {
    parent: React.PropTypes.object,
    companyDetails: React.PropTypes.object,
    updateCompanySetting: React.PropTypes.func,
    locale: React.PropTypes.object,
    btnState: React.PropTypes.number
};

