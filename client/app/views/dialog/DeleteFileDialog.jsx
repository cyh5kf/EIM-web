import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Dialog from '../../components/dialog/Dialog';
import RenderToBody from '../../components/RenderToBody';

export default class DeleteFileDialog extends Dialog{
    static defaultProps = {
        ...Dialog.defaultProps,
        name: 'dlg-deleteFile'
    }
    constructor(props) {
        super(props);
        this.state={show:true,locale:gLocaleSettings.DIALOGS['dlg-deleteFile']};
    }

    render(){
        var locale = this.state.locale;
        return (
            <RenderToBody>
                <ReactCSSTransitionGroup transitionName="dialog" transitionAppear={true} transitionEnter={true}
                                         transitionAppearTimeout={300} transitionEnterTimeout={300} transitionLeaveTimeout={300}>
                    {this.state.show &&
                        <div className="dialog-mask dlg-logoffAccount">
                            <div className="dialog-entity">
                                <div className="eim-deprecated btn_close" onClick={this.close.bind(this)}></div>
                                <div className="excalmatory eim-deprecated eim-wrong"></div>
                                <div className="exitConfirmMessage">{locale.title}</div>
                                <div className="exitConfirmDesc">{locale.confirmnote}</div>
                                <div className="footer">
                                    <button className="cancelCreate" onClick={this.close.bind(this)}>{locale.cancelLabel}</button>
                                    <button className="create">{locale.confirmLabel}</button>
                                </div>
                            </div>
                        </div>}
                </ReactCSSTransitionGroup>
            </RenderToBody>
        );
    }
}
