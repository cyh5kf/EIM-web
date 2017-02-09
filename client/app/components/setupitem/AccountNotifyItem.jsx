import React from 'react';
import exposeLocale from '../exposeLocale';
import ClassNameUtils from '../../utils/ClassNameUtils';

@exposeLocale(['DIALOGS', 'dlg-accountInfo'])
export default class GroupSettingItem extends React.Component {
    constructor(props) {
        super(props);
        this.state={showItem: false};
    }

    static propTypes = {
        children: React.PropTypes.node,
        closeTips: React.PropTypes.func
    }

    toggleItemBox(){
        this.setState({showItem:!this.state.showItem});
    }

    closeContentBox(){
        this.setState({showItem:false});
    }

    render(){
        let locale = this.state.locale;
        let showItem = this.state.showItem;
        let showClass = showItem?'expanded':'';
        let buttonTxt = showItem?locale.closeLabel:locale.expandLabel;
        return (<li className={ClassNameUtils('operationBox',showClass)} >
                    <div className="secNoticeLabel">{this.props.label}</div>
                    <div className="notificationDesc">{this.props.desc}</div>
                    <button className="updateInvite" onClick={this.toggleItemBox.bind(this)}>{buttonTxt}</button>
                    {showItem&&this.props.children}
                </li>);
    }
}