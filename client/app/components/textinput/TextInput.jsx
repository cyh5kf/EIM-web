import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';
import classnames from '../../utils/ClassNameUtils';
import ReactPropTypes from '../../core/ReactPropTypes';
import PureRenderComponent from '../PureRenderComponent';

import "./textInput.less";

export const AUTOCOMPLETE_TYPE={
    on: 1,
    off: 2
}

export default class TextInput extends PureRenderComponent {
    constructor (props){
        super(props);
    }

    static propTypes={
        isFocus: ReactPropTypes.bool,  // 是否需要获取焦点
        className: ReactPropTypes.string,  // 组件样式类名
        message: ReactPropTypes.string,
        children: ReactPropTypes.node,
        autoComplete: ReactPropTypes.ofEnum(AUTOCOMPLETE_TYPE),  // 是否自动完成
        name: ReactPropTypes.string.isRequired,
        isError: ReactPropTypes.bool,  //是否是错误状态
        header: ReactPropTypes.string,  //组件标题
        visibleHeader: ReactPropTypes.bool  //是否显示标题
    };

    static defaultProps = {
        isFocus: false,
        autoComplete: AUTOCOMPLETE_TYPE.off
    };

    componentDidMount(){
        if (this.props.isFocus) ReactDOM.findDOMNode(this).querySelector('input[name]').focus();
    }

    render() {
        const {
            className,
            autoComplete,
            children,
            header,
            message,
            isError,
            visibleHeader,
            ...props
        } = this.props;

        let autocompleteContent=null;
        
        if (autoComplete === AUTOCOMPLETE_TYPE.off) {
            autocompleteContent = (<input className="hidden" />);  //禁止表单autocomplete兼容chrome的写法
        }

        return (
            <div className={classnames('textinput_wrap', className, isError? "textinput_wrap_error":'')}>
                {!!header && <label className={classnames("textinput_header", visibleHeader? '': 'textinput_visible')}>{header}</label>}
                <div className="textinput_content">
                    {autocompleteContent}
                    <input
                        {..._.omit(props,'isFocus')}
                        autoComplete={autoComplete === AUTOCOMPLETE_TYPE.on? 'on': 'off'}
                    />
                    {children}
                </div>
                {!!message && <p className="textinput_message">{message}</p>}
            </div>

        );
    }
}



