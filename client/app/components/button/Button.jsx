import React, {PropTypes} from 'react';
import _ from 'underscore';
import Loading from '../loading/Loading';

import './Button.less';

export default class Button extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        loading: PropTypes.bool,
        children: PropTypes.node
        // 同时接受任意 button 元素可以接受的属性
    };
    static defaultProps = {
        className: 'button-simple',
        loading: false
    };

    render() {
        const {className, loading, children} = this.props;
        return (
            <button className={`button text-ellipsis ${className}`} {..._.omit(this.props, ['className', 'loading', 'children'])}>
                {loading && <Loading delay={0}/>}
                {children}
            </button>
        );
    }
}
