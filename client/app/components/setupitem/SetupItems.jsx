import React from 'react';
import exposeLocale from '../exposeLocale';
import classnames from '../../utils/ClassNameUtils';
// import _ from 'underscore';
import './setupitems.less';

@exposeLocale(['COMMON'])
export default class SetupItems extends React.Component {
    constructor(props) {
        super(props);
        this.state={showItem: props.showItem?props.showItem: false};
    }

    componentWillReceiveProps(nextProps){
        if (nextProps.showItem !== this.props.showItem) {
            this.setState({showItem: nextProps.showItem});
        }
    }

    static propTypes = {
        className: React.PropTypes.string,
        children: React.PropTypes.node,
        // closeTips: React.PropTypes.func,
        // itemType: React.PropTypes.number,
        openPanel: React.PropTypes.func,
        // onSubmit: React.PropTypes.func,
        // fixLabel: React.PropTypes.string,
        title: React.PropTypes.string,
        subtitle: React.PropTypes.node,
        showItem: React.PropTypes.bool,
        oneToMulti: React.PropTypes.bool // 当只有一行内容（及children的length为1）,但想让footer和content分行显现，就用该属性。
    }

    expandItems(showItem){
        if (this.props.children) {
            this.setState({showItem: showItem});
            // if(this.props.closeTips)this.props.closeTips(this.props.itemType);
        }else{
            this.props.openPanel();
        }
    }

    render(){
        const {locale} = this.state;
        // let button = null, content = null;
        let isOpen = this.props.children && this.state.showItem,
            btnLabel = isOpen? locale.closeLabel : locale.expandLabel,
            openClass = isOpen?'open':'';
        let index = this.props.index || 0;
        return (
            <li className={classnames("setupitems mission_global", this.props.className, openClass)}  data-index={index}>
                <button
                    className={classnames("accordion_expand g_btn btn_outline", this.props.fixLabel? "otherOperateBtn": null)}
                    onClick={e=>this.expandItems(!this.state.showItem)}
                >
                    {btnLabel}
                </button>
                <h4><a onClick={e=>this.expandItems(!this.state.showItem)}>{this.props.title}</a></h4>
                <p className="no_bottom_margin">{this.props.subtitle}</p>
                <div className="accordion_subsection">
                    {this.props.children}
                </div>
            </li>
        );
    }
}