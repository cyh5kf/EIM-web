import React from 'react';
// import ReactDOM from 'react-dom';
import exposeLocale from '../../../components/exposeLocale';
import PureRenderComponent from '../../../components/PureRenderComponent';
import IndexLayoutComponent from '../../index/IndexLayoutComponent';
import ResetPasswordView from './ResetPasswordView';
import PasswordAuthCodeView from './PasswordAuthCodeView';
import ForgotPasswordView from './ForgotPasswordView';
import ForgotPasswordStore, {ResetPasswordStep,RESET_PASSWORD_EVENTS} from '../../../core/stores/ForgotPasswordStore';
import ReactPropTypes from '../../../core/ReactPropTypes';

@exposeLocale(['LOGIN_FORGET_PASSWORD'])
export default class ForgotPasswordComposer extends PureRenderComponent {
    constructor(props) {
        super(props);
        this.state = {
            step: ResetPasswordStep.EMAIL
        };
    }

    static propTypes = {
        location: ReactPropTypes.object
    };

    componentWillMount(){
        ForgotPasswordStore.addEventListener(RESET_PASSWORD_EVENTS.CHANGE, this.toggleStep);
    }

    componentWillUnmount(){
        ForgotPasswordStore.removeEventListener(RESET_PASSWORD_EVENTS.CHANGE, this.toggleStep);
    }

    toggleStep = (step)=>{
        this.setState({step: step});
    }

    renderContent(){
        const {locale, step}=this.state;
        switch (step){
            case ResetPasswordStep.NEW_PASSWORD:
                return <ResetPasswordView locale={locale} />;
            case ResetPasswordStep.AUTH_CODE:
                return <PasswordAuthCodeView locale={locale} />;
            case ResetPasswordStep.EMAIL:
                return <ForgotPasswordView locale={locale} email={this.props.location.state.email} />;
        }
    }

    render(){
        return (
            <IndexLayoutComponent
                indexBackground="login_layout"
                navClass="login_nav"
            >
                {this.renderContent()}
            </IndexLayoutComponent>
        );
    }
}
