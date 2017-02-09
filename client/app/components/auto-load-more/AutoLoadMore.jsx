import React, {PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import _ from 'underscore';
import PureRenderComponent from '../PureRenderComponent';
import Loading from '../loading/Loading';

function hasNodeAppear(node, error = 0) {
    const pos =  node.getBoundingClientRect(),
        parentPos = node.parentElement.getBoundingClientRect();

    return pos.width && pos.height && // 节点必须有有效尺寸
        (pos.top + error) >= parentPos.top &&
        (pos.left + error) >= parentPos.left &&
        (pos.bottom - error) <= parentPos.bottom &&
        (pos.right - error) <= parentPos.right;
}

export default class AutoLoadMore extends PureRenderComponent {
    static propTypes = {
        onLoadData: PropTypes.func,
        loadingData: PropTypes.bool,
        noMoreData: PropTypes.bool,

        children: PropTypes.node,
        className: PropTypes.string
    }
    static defaultProps = {
        onLoadData: _.noop,
        loadingData: false,
        noMoreData: true
    }

    checkAutoLoad() {
        const {loadingData, noMoreData, onLoadData} = this.props;
        if (!loadingData && !noMoreData && hasNodeAppear(findDOMNode(this))) {
            onLoadData();
        }
    }

    handleScroll = () => {
        this.checkAutoLoad();
    }

    componentDidMount() {
        this.checkAutoLoad();
    }

    componentDidUpdate() {
        this.checkAutoLoad();
    }

    render() {
        const {loadingData, noMoreData, children, className = ''} = this.props;
        return (
            <div className={`auto-load-more ${className} ${noMoreData ? 'no-more-data' : ''} ${loadingData ? 'loading-data' : ''}`} onScroll={this.handleScroll}>
                {children}
                {loadingData && <Loading delay={0}/>}
            </div>
        );
    }
}
