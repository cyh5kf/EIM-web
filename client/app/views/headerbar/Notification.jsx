import React from 'react';
import ReactDOM from 'react-dom';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Popper from '../../components/popper/Popper';
import Menu, { SubMenu, Item as RcMenuItem, Divider } from 'rc-menu';
import PureRenderComponent from '../../components/PureRenderComponent';
import ReactPropTypes from '../../core/ReactPropTypes';
import exposeLocale from '../../components/exposeLocale';
import './Notification.less';
import 'rc-menu/assets/index.css';

const MENU_SNOOZE = '1',
    MENU_NOT_DISTURB = '2',
    MENU_PREFERENCE = '3';

class NotificationView extends PureRenderComponent {
    static propTypes = {
        notificationSetting: ReactPropTypes.ofLocale(['NOTIFICATION_SETTING_MENU']).isRequired
    }

    state = {
        dialogType: null
    }

    render () {
        let notification = this.props.notificationSetting;
        const titleRight = (<span>
                                {notification.adjustTime}
                                <i className="eficon-ic_next_pressed pull-right"></i>
                            </span>);
        return (
            <div className="notification">
                <div className="notification-logo" ref="notificationLogo">
                    <i className="eficon-unnotification"/>
                </div>
                {<div className="notification-dropdown">
                    <DropdownButton id={`_dropdown-${1}`} title="">
                        <MenuItem eventKey={MENU_SNOOZE} header>
                            <div className="btn-item">{notification.snooze}</div>
                        </MenuItem>
                        <MenuItem>
                            <div className="btn-item-1">{notification.twentyMinutes}</div>
                        </MenuItem>
                        <MenuItem>
                            <div className="btn-item-1">{notification.oneHours}</div>
                        </MenuItem>
                        <MenuItem>
                            <div className="btn-item-1">{notification.twoHours}</div>
                        </MenuItem>
                        <MenuItem>
                            <div className="btn-item-1">{notification.fourHours}</div>
                        </MenuItem>
                        <MenuItem>
                            <div className="btn-item-1">{notification.eightHours}</div>
                        </MenuItem>
                        <MenuItem>
                            <div className="btn-item-1">{notification.twentyFourHours}</div>
                        </MenuItem>
                        <MenuItem divider></MenuItem>
                        <MenuItem eventKey={MENU_NOT_DISTURB}>
                            <div className="btn-item" data-index={0} onClick={this.openUserProfilePanel}>{notification.notDisturb}</div>
                        </MenuItem>
                        <MenuItem eventKey={MENU_PREFERENCE}>
                            <div className="btn-item" data-index={0} onClick={this.openUserProfilePanel}>{notification.preferences}</div>
                        </MenuItem>
                    </DropdownButton>
                </div>}

                {false && <Popper target={() => ReactDOM.findDOMNode(this.refs.notificationLogo)}
                    placement={'bottom-start'}
                    onRootClose={this.onHideMenu}
                    className="">
                    <Menu
                        className="notification-popper"
                        defaultActiveFirst
                    >
                        <RcMenuItem>
                            <div className="header">
                                <div className="text">
                                    <div className="text-1">{notification.notDisturbON}</div>
                                    <div className="text-2">Notifications snoozed for 2h</div>
                                </div>
                                <div className="ico">
                                    <i className="eficon-unnotification"/>
                                </div>
                            </div>
                        </RcMenuItem>
                        <RcMenuItem>
                            {notification.turnOff}
                        </RcMenuItem>
                        <SubMenu title={titleRight} key="1" className="adjust-time-item">
                            <RcMenuItem key="1-1">{notification.twentyMinutes}</RcMenuItem>
                            <RcMenuItem key="1-2">{notification.oneHours}</RcMenuItem>
                            <RcMenuItem key="1-3">{notification.twoHours}</RcMenuItem>
                            <RcMenuItem key="1-4">{notification.fourHours}</RcMenuItem>
                            <RcMenuItem key="1-5">{notification.eightHours}</RcMenuItem>
                            <RcMenuItem key="1-6">{notification.twentyFourHours}</RcMenuItem>
                        </SubMenu>
                        <Divider className="divider"/>
                        <RcMenuItem>
                            {notification.notDisturb}
                        </RcMenuItem>
                        <RcMenuItem>
                            {notification.preferences}
                        </RcMenuItem>
                    </Menu>
                </Popper>}
            </div>
        );
    }
}

@exposeLocale(['NOTIFICATION_SETTING_MENU'])
export default class NotificationComposer extends PureRenderComponent {
    render() {
        return <NotificationView notificationSetting={this.state.locale}/>;
    }
}
