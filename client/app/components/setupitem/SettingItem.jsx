import React from 'react';
import exposeLocale from '../exposeLocale';
import classnames from '../../utils/ClassNameUtils';
import _ from 'underscore';

@exposeLocale(['COMMON'])
export default class SettingItem extends React.Component {
    constructor(props) {
        super(props);
        this.state={showItem: props.showItem?props.showItem: false};
    }

    static propTypes = {
        className: React.PropTypes.string,
        children: React.PropTypes.node,
        closeTips: React.PropTypes.func,
        itemType: React.PropTypes.number,
        openPanel: React.PropTypes.func,
        onSubmit: React.PropTypes.func,
        fixLabel: React.PropTypes.string,
        title: React.PropTypes.string,
        subtitle: React.PropTypes.node,
        showItem: React.PropTypes.bool,
        oneToMulti: React.PropTypes.bool // 当只有一行内容（及children的length为1）,但想让footer和content分行显现，就用该属性。
    }

    expandItems(showItem){
        if (this.props.children) {
            this.setState({showItem: showItem});
            if(this.props.closeTips)this.props.closeTips(this.props.itemType);
        }else{
            this.props.openPanel();
        }
    }

    render(){
        const {locale} = this.state;
        let button = null, content = null;
        let isOpen = this.props.children && this.state.showItem;
        let openClass = isOpen?'opened':'';
        if (isOpen) {
            content = (
                <div className={classnames('setupItemContentWrap', (_.isArray(this.props.children) || this.props.oneToMulti)?'MultiSetupItemContentWrap':null)}>
                    {this.props.children}
                </div>
            );
        }else{
            button = (
                <button
                    className={classnames("fixBtn", this.props.fixLabel? "otherOperateBtn": null)}
                    onClick={this.expandItems.bind(this, true)}
                >
                    {this.props.fixLabel? this.props.fixLabel: locale.fixLabel}
                </button>
            );
        }

        return (
            <li className={classnames("settingItem", this.props.className,openClass)}>
                <div className="setupItemHeaderWrap">
                    <span className="setupItemHeader">
                        <h4 className="setupItemTitle">{this.props.title}</h4>
                        <p className="setupItemSubtitle">{this.props.subtitle}</p>
                    </span>
                    {button}
                </div>
                {content}
            </li>
        );
    }
}