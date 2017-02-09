import React from 'react';
import {findDOMNode} from 'react-dom';
import FullScreenDialog from '../../components/dialog/FullScreenDialog';
import exposeLocale from '../../components/exposeLocale';
import Dialog from '../../components/dialog/Dialog';
import Button from '../../components/button/Button';
import StringUtils from '../../utils/StringUtils';
import UsersSelector from '../view-components/users-selector/UsersSelector';
import AddUserFromGroupCommand from '../../core/commands/channel/AddUserFromGroupCommand';
import {ChannelSchema} from '../../core/schemas/ChannelSchemas';
import ChannelName from '../view-components/channel-name/ChannelName';
import ReactPropTypes from '../../core/ReactPropTypes';

class CustomUsersSelector extends UsersSelector {
    renderOptionInfo = data => {
        return [
            <div key="ui" className="user-info">
                <b className="user-realname" >{data.firstname}{data.lastname}</b>
                <div className="user-name">@{data.name}</div>
            </div>,
            <i key="icon" className="ficon ficon_plus_circle"/>
        ];
    }
}

@exposeLocale()
export default class InviteChannelMembersDialog extends FullScreenDialog {
    static propTypes = {
        ...FullScreenDialog.propTypes,
        targetChannel: ReactPropTypes.ofSchema(ChannelSchema).isRequired
    };
    static defaultProps = {
        ...FullScreenDialog.defaultProps,
        className: 'dlg-inviteChannelMembers dlg-userSelectors',
        closeOnMaskClick: true
    };

    onSelectedUserChange = (users) => {
        this.setState({selectedUsers:users});
    }

    _onInviteChannelMembers = () => {
        let uids = this.state.selectedUsers.map(user => user.id);
        if(uids.length > 0){
            var opt ={members:uids, gid:this.props.targetChannel.sessionid};
            AddUserFromGroupCommand({options:opt})
                .then(() => this.close());
        }
    }

    static open(targetChannel) {
        Dialog.openDialog(InviteChannelMembersDialog, {
            targetChannel
        });
    }

    componentWillMount() {
        super.componentWillMount(...arguments);
        this.setState({
            selectedUsers: []
        });
    }

    filterUsers = users => {
        const {targetChannel: {members}} = this.props,
            memberUids = members.map(member => member.uid);

        return users.filter(user => memberUids.indexOf(user.id) === -1);
    }

    _getPopupContainer = () => findDOMNode(this.refs['popup-container']);
    renderContent(){
        let {locale, selectedUsers} = this.state;
        return [
            <div key="title" className="dlg-title">
                {StringUtils.formatAsReact(locale.DIALOGS.DLG_INVITE_CHANNEL_MEMBERS.title, () => <ChannelName channelData={this.props.targetChannel}/>)}
            </div>,
            <div key="toolbar" className="search-toolbar">
                <CustomUsersSelector ref="user-selector" selectedUser={selectedUsers} onSelectedUserChange={this.onSelectedUserChange}
                                     filterResultsDatasource={this.filterUsers}
                                     placeholder={locale.COMMON.search}
                                     alwaysShowPopup autoFocus
                                     getPopupContainer={this._getPopupContainer}/>
                <Button className={`submit-btn button ${selectedUsers.length ? 'button-green' : 'button-gray'}`} onClick={this._onInviteChannelMembers}>
                    {locale.DIALOGS.DLG_INVITE_CHANNEL_MEMBERS.btnInvite}
                </Button>
            </div>,
            <div key="tip" className="new-session-tip">{locale.DIALOGS.DLG_INVITE_CHANNEL_MEMBERS.useTip}</div>,
            <div key="pop" ref="popup-container" className="popup-container"></div>
        ];
    }
}
