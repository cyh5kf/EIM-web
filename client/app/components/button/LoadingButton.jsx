import React, {PropTypes} from 'react';
import Loading from '../loading/Loading';
import PureRenderComponent from '../PureRenderComponent';
import './Button.less';
export const LOADING_STATUS = {
    NoLoading: 0,
    Loading: 1,
    Loaded: 2
}

export default class LoadingButton extends PureRenderComponent {
    static propTypes = {
        className: PropTypes.string,
        children: PropTypes.node
        // 同时接受任意 button 元素可以接受的属性
    };
    static defaultProps = {
        className: 'button-simple',
        loading: LOADING_STATUS.NoLoading
    };

    render() {
        const {loading,children,className,...props} = this.props;
        let loadingCss = loading&&loading===LOADING_STATUS.Loading?'loading':'';
        return (
            <button className={`button button-loading ${className} ${loadingCss}`} {...props}>
                {loading===LOADING_STATUS.Loading && <Loading delay={0} type='spokes' color='#e3e3e3' width="22" height="22"/>}
                {loading===LOADING_STATUS.Loaded && <i className="ficon_check_circle_o"/>}
                {children}
            </button>
        );
    }
}
