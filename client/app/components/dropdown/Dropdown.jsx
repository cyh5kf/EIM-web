import React, {PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import PureRenderComponent from '../PureRenderComponent';
import Popper from '../popper/Popper';
import warning from '../../utils/warning';

// 提供一个按钮, 点击时弹出指定弹出框
export default class Dropdown extends PureRenderComponent {
    static propTypes = {
        anchorElement: PropTypes.node,
        children: PropTypes.node.isRequired, // popover content
        popoverPlacement: Popper.propTypes.placement,

        onSelect: PropTypes.func, // 传递弹出框的 onSelect 函数 (如果有), 并在触发时关闭弹出框
        className: PropTypes.string
    }
    static defaultProps = {
        placement: Popper.defaultProps.placement
    }

    getPopperTarget = () => findDOMNode(this)

    handlePopperRootClose = () => this.setState({showPopper: false})

    handleAnchorClick = () => this.setState({
        showPopper: !this.state.showPopper
    })

    handlePopperOnSelect = (...args) => {
        this.props.onSelect(...args);
        this.setState({
            showPopper: false
        });
    }

    componentWillMount() {
        this.setState({
            showPopper: false
        });
    }

    render() {
        let {anchorElement, popoverPlacement, children, onSelect, className = ''} = this.props,
            {showPopper} = this.state;

        if (onSelect) {
            children = React.Children.map(children, child => {
                if (__DEV__ && child.props.onSelect && child.props.onSelect !== child.type.defaultProps.onSelect) {
                    warning('Dropdown: 子组件已有 onSelect 属性, 将被覆盖!');
                }
                return React.cloneElement(child, {
                    onSelect: this.handlePopperOnSelect
                });
            });
        }

        return (
            <div className={`eim-dropdown ${className} ${showPopper ? 'open' : ''}`}  onClick={this.handleAnchorClick}>
                {anchorElement}

                {showPopper && (
                    <Popper target={this.getPopperTarget} placement={popoverPlacement} onRootClose={this.handlePopperRootClose}>
                        {children}
                    </Popper>
                )}
            </div>
        );
    }
}
