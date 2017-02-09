import React from 'react';
import exposeLocale from '../exposeLocale';

@exposeLocale(['DIALOGS', 'dlg-groupSetting'])
export default class GroupSettingItem extends React.Component {
    constructor(props) {
        super(props);
        this.state={showItem: false};
    }

    static propTypes = {
        children: React.PropTypes.node,
        closeTips: React.PropTypes.func
    }

    openContentBox(){
        this.setState({showItem:true});
    }

    closeContentBox(){
        this.setState({showItem:false});
    }

    render(){
        let locale = this.state.locale;
        let showItem = this.state.showItem;
        let showClass = showItem?'selected':'';
        return (<li className={showClass} >
                    <div className="optionTitle">{this.props.label}</div>
                    <div className="optionDesc">{this.props.desc}</div>
                    <button className="updateInvite" onClick={this.openContentBox.bind(this)}>{locale.updateLabel}</button>
                    {showItem&&this.props.children}
                </li>);
    }
}