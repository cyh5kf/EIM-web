import React from 'react';
import PureRenderComponent from '../../../components/PureRenderComponent';
import EnumLoginStatus from '../../../core/enums/EnumLoginStatus';
import ReactPropTypes from '../../../core/ReactPropTypes';

import './OnlineStatusIndicator.less';

export default class OnlineStatusIndicator extends PureRenderComponent {
    static propTypes = {
        onlineStatus: ReactPropTypes.ofEnum(EnumLoginStatus).isRequired
    }

    render() {
        const isOnline = this.props.onlineStatus === EnumLoginStatus.WebOnline;
        if (isOnline) {
            return  <i className="online-status-indicator online"/>;
        } else {
            return <i className="online-status-indicator offline"/>;
        }
    }
}
