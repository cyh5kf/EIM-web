import React, {PropTypes} from 'react';
import PureRenderComponent from '../../components/PureRenderComponent';
import Button from '../../components/button/Button';

import './NavTabs.less';

const ITEM_TYPE = PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.node.isRequired,
    className: PropTypes.string
}).isRequired;

export default class NavTabs extends PureRenderComponent {
    static propTypes = {
        items: PropTypes.arrayOf(ITEM_TYPE).isRequired,
        itemsRight: PropTypes.arrayOf(ITEM_TYPE),
        activeKey: PropTypes.string,
        onSelect: PropTypes.func,
        navStyle: PropTypes.oneOf(['tabs', 'bottom-bordered'])
    }
    static defaultProps = {
        navStyle: 'bottom-bordered'
    }
    handleTabClick = e => {
        const key = e.target.dataset.key;
        this.props.onSelect && this.props.onSelect(key);
    }
    render() {
        const {items, itemsRight, activeKey, navStyle} = this.props,
            renderItem = item => (
                <Button key={item.key} className={`nav-tab-item ${item.className || ''} ${activeKey === item.key ? 'active' : ''}`}
                        data-key={item.key} onClick={this.handleTabClick}>{item.label}</Button>
            );
        return (
            <div className={`navigator-tabs clear-float ${navStyle}-style`}>
                {items.map(renderItem)}
                {!!itemsRight && <div className="item-separator"></div>}
                {!!itemsRight && itemsRight.map(renderItem)}
            </div>
        );
    }
}
