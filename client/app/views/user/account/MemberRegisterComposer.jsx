import React from 'react';
import {browserHistory} from 'react-router';
import UserRegisterStore, {RegisterEvents} from '../../../core/stores/UserRegisterStore';
import ReactPropTypes from '../../../core/ReactPropTypes';
import PureRenderComponent from '../../../components/PureRenderComponent';

import "../Signup.less";

export default class MemberRegisterComposer extends PureRenderComponent{
    constructor(props){
        super(props);
    }

    static propTypes = {
        children: ReactPropTypes.node
    };

    componentWillMount(){
        UserRegisterStore.addEventListener(RegisterEvents.NEXT_STEP, this.goNextStep);
    }

    componentWillUnmount(){
        UserRegisterStore.removeEventListener(RegisterEvents.NEXT_STEP, this.goNextStep);
    }

    goNextStep=curStep=>{
        browserHistory.push('/create/'+ UserRegisterStore.getNextStep(curStep));
    }


    render(){

        return (
            <div className="signup_wrapper">
                {this.props.children}
            </div>
        );
    }
}
