import React from 'react';
import {findDOMNode} from 'react-dom';
import Dialog from '../../../components/dialog/Dialog';
import exposeLocale from '../../../components/exposeLocale';
import StringUtils from '../../../utils/StringUtils';
import UsersSelector from '../../view-components/users-selector/UsersSelector';
import ChannelsStore from '../../../core/stores/ChannelsStore';
import EnumSessionType from '../../../core/enums/EnumSessionType';
import EnumSearchUserType from '../../../core/enums/EnumSearchUserType';
import SwitchChannelCmd from '../../../core/commands/channel/SwitchChannelCmd';
import {getChannelIdByUserId} from '../../../core/core-utils/ChannelUtils';
import ReactPropTypes from '../../../core/ReactPropTypes';

import './ChannelQuickSwitcherDialog.less';

const TARGET_USER_TYPES = [EnumSearchUserType.User, EnumSearchUserType.Channel];

class QuickSwitcherUsersSelector extends UsersSelector {
    static propTypes = {
        ...UsersSelector.propTypes,
        quickSwitcherLocale: ReactPropTypes.object.isRequired
    };
    renderOption = (data) => {
        const isUser = data.userType === EnumSearchUserType.User;
        return (
            <span className={`${isUser ? 'user-item' : 'group-item'}`}>
                <span className="item-name">{isUser ? (data.firstname + data.lastname) : data.name}</span>
                <span className="item-tip">{isUser ? data.name : ''}</span>
            </span>
        );
    }
}

@exposeLocale(['DIALOGS', 'dlg-quickSwitcher'])
export default class ChannelQuickSwitcherDialog extends Dialog {
    static defaultProps = {
        ...Dialog.defaultProps,
        closeOnMaskClick: true,
        className: 'dlg-quickSwitcher'
    };
    static open(onClose) {
        Dialog.openDialog(ChannelQuickSwitcherDialog, {
            onClose
        });
    }

    handleUserSelected = selectedUsers => {
        if (selectedUsers.length) {
            const {id, userType} = selectedUsers[0];
            const channelId = userType === EnumSearchUserType.User ? getChannelIdByUserId(id) : id;
            SwitchChannelCmd({
                sessionid: channelId,
                sessiontype: userType,
                openIfNotExist: true
            }).then(() => this.close());
        }
    }

    renderHeader() { return null; }
    renderFooter() { return null; }

    componentWillMount() {
        super.componentWillMount(...arguments);

        let immutableSessions =  ChannelsStore.getChannelDataList();        
        this.setState({
            defaultDatasource: immutableSessions.filter(channelData => channelData.sessiontype === EnumSessionType.Channel).sortBy(channel => channel.displayname).toJS().map(channel => ({
                userType: EnumSearchUserType.Channel,
                id: channel.sessionid,
                name: channel.displayname
            }))
        })
    }

    _getPopupContainer = () => findDOMNode(this.refs['popup-container']);
    renderContent() {
        const {locale, defaultDatasource} = this.state,
            jumpKeyTip = StringUtils.formatAsReact(
                locale.jumpKeyTip,
                updownText => <b>{updownText}</b>,
                enterText => <b className="tip-left-margin">{enterText}</b>,
                escText => <b className="tip-left-margin">{escText}</b>
            );

        return (
            <span>
                <div className="jump-session-tip">
                    {locale.jumpToSession}
                    <span className="floatRight">{jumpKeyTip}</span>
                </div>
                <QuickSwitcherUsersSelector onSelectedUserChange={this.handleUserSelected} userTypes={TARGET_USER_TYPES}
                                            alwaysShowPopup={true} getPopupContainer={this._getPopupContainer}
                                            quickSwitcherLocale={locale}
                                            defaultDatasource={defaultDatasource}
                                            autoFocus={true}/>
                <span ref="popup-container" className="user-list-container"/>
            </span>
        );
    }
}
