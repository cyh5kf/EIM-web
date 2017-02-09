import React, { PropTypes } from 'react';
import RawPopper from 'popper.js';
import RootCloseWrapper from 'react-overlays/lib/RootCloseWrapper';
import PureRenderComponent from '../PureRenderComponent';
import RenderToBody from '../RenderToBody';

import './Popper.less';

const PLACEMENT_BASE = ['top', 'bottom', 'left', 'right'],
    PLACEMENT_EXTRA = ['start', 'end'],
    AVAILABLE_PLACEMENTS = PLACEMENT_BASE.reduce((result, placementBase) => {
        result.push(placementBase);
        PLACEMENT_EXTRA.forEach(placementExtra => result.push(placementBase + '-' + placementExtra));
        return result;
    }, []);

// 可定位的弹出框
export default class Popper extends PureRenderComponent {
    static propTypes = {
        placement: PropTypes.oneOf(AVAILABLE_PLACEMENTS), // 'top/bottom/left/right' + '/-start/-end'
        target: PropTypes.func.isRequired,
        children: PropTypes.node.isRequired,
        onRootClose: PropTypes.func // 点击弹窗以外的区域时触发, 同 react-bootstrap Overlay.rootClose
    }
    static defaultProps = {
        placement: 'bottom-start'
    }

    constructor(props) {
        super(props);
        this.state = {};
        this.update = this.update.bind(this);
    }

    update() {
        this.popper && this.popper.update();
        this.raf = this.raf || window.requestAnimationFrame(this.update);
    }

    componentDidMount() {
        const {target} = this.props;
        this.popper = new RawPopper(target(), this.refs.popper, {
            placement: this.props.placement || 'bottom-start',
            // 移除 applyStyle 禁用样式应用
            // 移除 keepTogether 组织弹出框与ref定位节点同步导致溢出界面
            modifiersIgnored: ['applyStyle', 'keepTogether']
        })
        this.popper.onUpdate(data => {
            this.setState({data});
        })
        this.update();
    }

    componentWillUnmount() {
        this.popper && this.popper.destroy();
        this.raf && window.cancelAnimationFrame(this.raf);
    }

    getPopperStyle(data) {
        if (!data) { return {}; }
        const left = Math.round(data.offsets.popper.left);
        const top = Math.round(data.offsets.popper.top);
        const transform = `translate3d(${left}px, ${top}px, 0)`;
        return {
            position: data.offsets.popper.position,
            transform,
            WebkitTransform: transform,
            top: 0,
            left: 0
        };
    }

    render() {
        const { children, onRootClose } = this.props,
            content = (
                <div ref='popper' data-placement={this.state.data && this.state.data.placement} className='popper' style={this.getPopperStyle(this.state.data)}>
                    {children}
                </div>
            );
        return (
            <RenderToBody>
                {!onRootClose ? content : <RootCloseWrapper onRootClose={onRootClose}>{content}</RootCloseWrapper>}
            </RenderToBody>
        );
    }
}
