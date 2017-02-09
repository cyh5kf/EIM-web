import React from 'react';
import PureRenderComponent from '../../../components/PureRenderComponent';
import MemberUserInfoView from './MemberUserInfoView';
import {VerifyLinkCmd,CheckEmailCmd} from '../../../core/commands/RegisterCommands';
import BrowserUtils from '../../../utils/BrowserUtils';
import UserRegisterStore,{RegisterEvents} from '../../../core/stores/UserRegisterStore';
import IndexLayoutComponent from '../../index/IndexLayoutComponent';
import {browserHistory} from 'react-router';

const VerifyStatus = {
    NONE_VERIFY: 1,
    VERIFY_SUCCESS: 2,
    VERIFY_FAILURE: 3
};

export default class InvitationRegisterComposer extends PureRenderComponent {
    constructor(props) {
        super(props);
        this.state = {
            verifyStatus: VerifyStatus.NONE_VERIFY,
            verifyError: ''
        };
        UserRegisterStore.saveUriParam(BrowserUtils.parseURLPara());
    }

    componentDidMount(){
        CheckEmailCmd(UserRegisterStore.getEmail());
    }

    componentWillMount(){
        UserRegisterStore.addEventListener(RegisterEvents.EVENT_FAILURE, this.sendFailure);
        UserRegisterStore.addEventListener(RegisterEvents.CHECK_EMAIL_SUCCESS, this.checkEmailSuccess);

        UserRegisterStore.addEventListener(RegisterEvents.EMAIL_REGISTED, this.registedEmail);
        UserRegisterStore.addEventListener(RegisterEvents.VERIFY_LINK, this.verifyLinkCallback);
    }

    componentWillUnmount(){
        UserRegisterStore.removeEventListener(RegisterEvents.VERIFY_LINK, this.verifyLinkCallback);
        UserRegisterStore.removeEventListener(RegisterEvents.EVENT_FAILURE, this.sendFailure);
        UserRegisterStore.removeEventListener(RegisterEvents.CHECK_EMAIL_SUCCESS, this.checkEmailSuccess);
        UserRegisterStore.removeEventListener(RegisterEvents.EMAIL_REGISTED, this.registedEmail);
    }

    checkEmailSuccess = email =>{
        VerifyLinkCmd(email, UserRegisterStore.getToken());
    }

    registedEmail = email =>{
        browserHistory.push({pathname: "/signin", state: {email: email}});
    }

    sendFailure=msg => {
        this.setState({verifyStatus: VerifyStatus.VERIFY_FAILURE, verifyError: msg});
    }

    verifyLinkCallback=result=>{
        // result.verify = true; //lw.todo: test
        if (result.verify) {
            this.setState({verifyStatus: VerifyStatus.VERIFY_SUCCESS});
        }else{
            this.setState({verifyStatus: VerifyStatus.VERIFY_FAILURE,verifyError: result.message});
        }
    }

    render(){
        const {verifyStatus} = this.state;

        switch (verifyStatus){
            case VerifyStatus.VERIFY_SUCCESS:
                return (
                    <div className="signup_wrapper">
                        <MemberUserInfoView />
                    </div>
                );
            case VerifyStatus.VERIFY_FAILURE:
                return (
                    <IndexLayoutComponent
                        indexBackground="login_layout"
                        navClass="login_nav"
                    >
                        <div className="page_contents">
                            <div className="card card1 align_center span_4_of_6 col float_none margin_auto large_bottom_margin right_padding large_bottom_padding">
                                <h1>{this.state.verifyError}</h1>
                            </div>
                        </div>
                    </IndexLayoutComponent>
                );
            default:
                return null;

        }
    }
}