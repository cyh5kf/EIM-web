import React from 'react';
import {browserHistory} from "react-router";
import LoginStore from '../core/stores/LoginStore';
import UserEditorStore from '../core/stores/UserEditorStore';

export default class ApplicationMainWindow extends React.Component{
    componentWillMount(){
        LoginStore.addEventListener('LOGINED', this._onLogined);
        LoginStore.addEventListener('LOGOUTED', this._onLogout);
        UserEditorStore.addEventListener('DEACTIVE_ACCOUNT_SUCCESS', this._deactiveAccount);
    }

    componentWillUnmount(){
        LoginStore.removeEventListener('LOGINED', this._onLogined);
        LoginStore.removeEventListener('LOGOUTED', this._onLogout);
        UserEditorStore.removeEventListener('DEACTIVE_ACCOUNT_SUCCESS', this._deactiveAccount);
    }

    _onLogined=()=>{
        browserHistory.push('/main');
    }

    _onLogout=()=>{
        browserHistory.push('/');
    }

    _deactiveAccount=(e)=>{
        browserHistory.push('/deactive');
    }

    render(){
        return React.Children.only(this.props.children);
    }
}
