// 此修饰函数封装类(非继承), 并在render时将所有state以props形式传递到被封装的类中
// 主要用在Composer中使得能够合理运用componentWillReceiveProps (因为Composer中store数据放在state上, 不能利用此接口)

import React from 'react';
import PureRenderComponent from './PureRenderComponent';

export default function wrapFromStateToProps(BaseComponent) {
    return class StateToPropsWrapper extends PureRenderComponent {
        static displayName = `StateToPropsWrapper-${BaseComponent.displayName || BaseComponent.name}`

        static wrappedComponent = BaseComponent

        render() {
            return <BaseComponent {...this.state} {...this.props}/>;
        }
    }
}
