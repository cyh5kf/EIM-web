import React from 'react';
import Button from '../../../components/button/Button';
import LoadingButton from '../../../components/button/LoadingButton';
import exposeLocale from '../../../components/exposeLocale';
import MessagePopup from '../../../components/alert/MessagePopup';
import PureRenderComponent from '../../../components/PureRenderComponent';

@exposeLocale(['SIGNOUT_ACCOUNT'])
export default class DeactivateAccount extends PureRenderComponent{
    static contextTypes = {
        router: React.PropTypes.object.isRequired
    }
    constructor(props){
        super(...arguments);
        this.state = {signOutStatus:true}
    }

    signoutAccount = () =>{
        this.setState({signOutStatus:false})
    }

    signoutContent =(locale)=>{
        return (<div className="manage-page signoutAccountBox">
                    <div className="manage-team-directory-header">
                        <h1>
                            <i className="ficon_sign_out"/>
                            {locale.title}
                        </h1>
                    </div>
                    <div className="content">
                        <h4 className="signoutDesc">{locale.signoutDesc}</h4>
                        <div className="signoutInfoDesc">{locale.signoutInfoDesc}</div>
                        <ul className="resetedOptions">
                            <li>{locale.resetedOption1}</li>
                            <li>{locale.resetedOption5}</li>
                        </ul>
                        <div className="resetPasswordLabel" dangerouslySetInnerHTML={{__html: locale.resetPasswordLabel}}></div>
                        <div className="signoutLine">
                            <div className="confirmPassLabel">{locale.confirmPassLabel}</div>
                            <div className="inputPasswLine">
                                <div className="floatLeft">
                                    <input type="password" className="inputPassword"/>
                                </div>
                                <div className="floatLeft">
                                    <Button className="signoutSessions button-loading btn_warning" onClick={this.signoutAccount}>{locale.signoutButton}</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>);
    }

    signoutResultContent=(locale)=>{
        return (
            <div className="manage-page signoutResultBox">
                <div className="manage-team-directory-header">
                    <h1>{locale.resetAccountHead}</h1>
                </div>
                <div className="poupMessageBox">
                    <MessagePopup className="success"><i className="ficon_button ficon_check_circle_o"></i>{locale.resetAccountMsg}</MessagePopup>
                </div>
                <div className="signout_body">
                    <div className="resetAccountTitle">{locale.resetAccountTitle}</div>
                    <div className="resetAccountDesc">{locale.resetAccountDesc}</div>
                    <div className="resetIntroduce">{locale.resetIntroduce}</div>
                    <div className="sendMsgLinkLine">
                        <LoadingButton><i className="ficon_share_email"></i>{locale.sendMagicLink}</LoadingButton>
                    </div>
                </div>
            </div>
        );
    }

    render(){
        let locale = this.state.locale;
        let contents = this.state.signOutStatus?this.signoutContent(locale):this.signoutResultContent(locale);
        return (
            contents
        );
    }
}
