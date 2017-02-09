import React, {PropTypes} from 'react';
import Loading from '../loading/Loading';
import PureRenderComponent from '../PureRenderComponent';
import {showStyle} from '../../utils/JSXRenderUtils';
import './LoadMoreButton.less';

export default class LoadMoreButton extends PureRenderComponent {
    static propTypes = {
        className: PropTypes.string,
        loading: PropTypes.bool,
        text: PropTypes.string.isRequired,
        onClick:PropTypes.func
    };

    static defaultProps = {
        className: '',
        loading:false
    };

    onClick(callback){
        if(callback){
            callback();
        }
    }

    render() {
        const {loading,text,className,onClick} = this.props;
        return (
            <div className={`button-load-more ${className}`}>
                <div className="loadingObj" style={showStyle(loading)}>
                    <Loading delay={0} type='spokes' color='#e3e3e3' width="22" height="22" />
                </div>
                <div className="buttonObj" style={showStyle(!loading)} onClick={this.onClick.bind(this,onClick)}>
                    {text}
                </div>
            </div>
        );
    }
}
