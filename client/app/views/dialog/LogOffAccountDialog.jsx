import React from 'react';
import Dialog from '../../components/dialog/Dialog';
import classnames from '../../utils/ClassNameUtils';
import RenderToBody from '../../components/RenderToBody';
// import LoginActionsCreators from '../../core/actions/LoginActionsCreators';
import {LogoutAccountCmd} from '../../core/commands/LoginCommands';
import Animator from '../../components/AnimatorInAndOut';

export default class LogOffAccountDialog extends Dialog{
    static defaultProps = {
        ...Dialog.defaultProps,
        name: 'dlg-logOff'
    }
    constructor(props) {
        super(props);
        this.state={show:true};
    }

    _logOutAccount(e){
        e.preventDefault();
        LogoutAccountCmd(this.props.uid, this.props.token);
    }

    render(){
        // var showBox = this.state.show?'':'hidden';
        return (
            <RenderToBody>
                <Animator className={classnames("dialog-mask",this.props.name,this.props.className)}>

                    {!!this.state.show && <div className="dialog-entity">
                                <div className="eim-deprecated btn_close" onClick={this.close.bind(this)}></div>
                                <div className="excalmatory eim-deprecated eim-no"></div>
                                <div className="exitConfirmMessage">{this.props.locale.title}</div>
                                <div className="exitConfirmDesc">{this.props.locale.exitConfirmDesc}</div>
                                <div className="footer">
                                    <button className="cancelCreate" onClick={this.close.bind(this)}>{this.props.locale.cancelbutton}</button>
                                    <button className="create" onClick={this._logOutAccount.bind(this)}>{this.props.locale.createbutton}</button>
                                </div>
                            </div>}
                </Animator>
            </RenderToBody>
        );
    }
}
