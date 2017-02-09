import React, {PropTypes} from 'react';
import ReactLoading from 'react-loading';
import _ from 'underscore';

import PureRenderComponent from '../PureRenderComponent';

import './Loading.less';

//export default class Loading extends PureRenderComponent {
//    render() {
//        return (
//            <div className="loading-indicator">
//                <div className="inner-loading-container">
//                    <div className="loading-dot dot-1"></div>
//                    <div className="loading-dot dot-2"></div>
//                    <div className="loading-dot dot-3"></div>
//                </div>
//            </div>
//        );
//    }
//}

const toPixel = val => {
    if (_.isNumber(val) || !val.endsWith('px')) {
        return val.toString() + 'px';
    } else {
        return val;
    }
};

export default class Loading extends PureRenderComponent {
    static propTypes = {
        color: PropTypes.string,
        delay: PropTypes.number,
        height: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string
        ]),
        type: PropTypes.string,
        width: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string
        ]),


        children: PropTypes.node,
        className: PropTypes.string
    };
    static defaultProps = {
        type: 'bubbles',
        color: '#BCBEBE',
        delay: 500,
        width: 30,
        height: undefined // = width
    };

    componentWillMount() {
        const {delay} = this.props;
        if (delay) {
            this.setState({delayed: true});
            this._timer = setTimeout(() => {
                this.setState({delayed: false});
            }, delay);
        } else {
            this.setState({
                delay: false
            });
        }
    }

    componentWillUnmount() {
        this._timer && clearTimeout(this._timer);
    }

    render() {
        const {children, className, width, height = width} = this.props,
            {delayed} = this.state;
        return (
            <div className={`loading-indicator ${delayed ? 'delayed' : ''} ${className || ''}`}>
                <ReactLoading {...this.props} width={toPixel(width)} height={toPixel(height)} delay={0}/>
                {children}
            </div>
        );
    }
}
