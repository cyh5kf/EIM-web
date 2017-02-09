import React from 'react';
import ReactDOM from 'react-dom';
import classnames from '../../utils/ClassNameUtils';
import exposeLocale from '../../components/exposeLocale';
import IndexLayoutComponent from './IndexLayoutComponent';
import Overlay from 'react-bootstrap/lib/Overlay';
import Popover from 'react-bootstrap/lib/Popover';
import ValidationUtils from '../../utils/ValidationUtils';
import UserRegisterStore,{RegisterEvents} from '../../core/stores/UserRegisterStore';
import {browserHistory} from 'react-router';
import StringUtils from '../../utils/StringUtils';
import {CheckEmailCmd, SendAuthCodeCmd} from '../../core/commands/RegisterCommands';

import "./index.less";

/*lw.todo: 新界面暂时只用单一背景图，后面有可能会改成多图显示*/
// function backgroundClass(randomCount){
//     switch (randomCount){
//         case 0:
//             return 'marsandbeyond';
//         case 1:
//             return 'neutrinoinahaystack';
//         case 2:
//             return 'waterislife';
//         default:
//             return 'openforbusiness';
//         // case 4:
//         //     return 'brewbetter';
//         // default:
//         //     return 'decodingdna';
//     }
// }


@exposeLocale(['INDEX'])
export default class Index extends React.Component{
    constructor(props){
        super(props);
        this.indexBackground = "marsandbeyond"; //backgroundClass(parseInt(4*Math.random()));
        this.state={visibleToolTip: false, tipsMessage: '', curInput: null};
    }

    componentWillMount(){
        UserRegisterStore.addEventListener(RegisterEvents.CHECK_EMAIL_SUCCESS, this.checkEmailSuccess);
        UserRegisterStore.addEventListener(RegisterEvents.EVENT_FAILURE, this.submitFailure);
        UserRegisterStore.addEventListener(RegisterEvents.NEXT_STEP, this.goNextStep);
        UserRegisterStore.addEventListener(RegisterEvents.EMAIL_REGISTED, this.registedEmail);
    }

    componentWillUnmount(){
        UserRegisterStore.removeEventListener(RegisterEvents.CHECK_EMAIL_SUCCESS, this.checkEmailSuccess);
        UserRegisterStore.removeEventListener(RegisterEvents.EVENT_FAILURE, this.submitFailure);
        UserRegisterStore.removeEventListener(RegisterEvents.NEXT_STEP, this.goNextStep);
        UserRegisterStore.removeEventListener(RegisterEvents.EMAIL_REGISTED, this.registedEmail);
    }

    checkEmailSuccess = email =>{
        SendAuthCodeCmd(email);
    }

    submitFailure = msg =>{
        this.setState({visibleToolTip: true, tipsMessage: msg});
    }

    goNextStep = curStep =>{
        browserHistory.push('/create/'+ UserRegisterStore.getNextStep(curStep));
    }

    registedEmail = email =>{
        browserHistory.push({pathname: "/signin", state: {email: email}});
    }

    submit(e, targetInput){
        var validResult=ValidationUtils.validateData({
            value: targetInput.value.trim(),
            datatype: 'email'
        },gLocaleSettings.VALIDATOR_MESSAGES);
        if (validResult.valid) {
            CheckEmailCmd(targetInput.value.trim());
        }else{
            this.setState({visibleToolTip: true, tipsMessage: validResult.errors[0].message, curInput: targetInput});
        }
    }

    hiddenTips(e){
        if(this.state.visibleToolTip){
            this.setState({visibleToolTip: false, tipsMessage: ''});
        }
    }

    getTarget(){
        return ReactDOM.findDOMNode(this.state.curInput);
    }

    render(){
        const {locale} = this.state;
        
        return (
            <IndexLayoutComponent
                indexBackground={this.indexBackground}
                navClass="index_nav"
            >
                <section className="signup_a">
                    <div className="cta_ad">
                        <h1 className="cta_story_header no_wrap">
                            {locale.title}
                        </h1>
                        <h4 className="cta_subheader">
                            {locale.subtitle}
                        </h4>
                        <div className="cta_container">
                            <div className="cta_form align_middle" >
                                <span>
                                    <input className="hidden"/>
                                    <input ref="emailForm" onChange={(e)=>this.hiddenTips(e)}  autoComplete="off" name="email" type="email" placeholder={locale.form.emailplaceholder} className={classnames("input_email small_right_margin", this.state.visibleToolTip && 'input_email_true')}/>
                                </span>

                                <button className="g_btn align_top" onClick={e=>this.submit(e, this.refs.emailForm)}>
                                    {locale.form.createBtnLabel}
                                </button>
                            </div>
                            <span className="cta_footer">
                                {StringUtils.formatAsReact(locale.form.message, signIn=><a href="/signin">{signIn}</a>)}
                            </span>
                        </div>
                    </div>
                </section>
                <Overlay 
                    target={() => this.getTarget()}
                    show={this.state.visibleToolTip}
                    onHide={() => this.setState({ visibleToolTip: false })}
                    placement="top"
                    container={this}
                >
                    <Popover className="email_tooltip" id="tooltip">
                        <span className="tooltip_message">{this.state.tipsMessage}</span>
                    </Popover>
                </Overlay>
            </IndexLayoutComponent>
            
        );
    }
}


