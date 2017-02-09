import React from  'react';
//import Clipboard from 'clipboard';
//import {findDOMNode} from 'react-dom';
import Menu, {MenuItem} from '../../../components/rc-menu/Menu';
import PureRenderComponent from '../../../components/PureRenderComponent';
import ReactPropTypes from '../../../core/ReactPropTypes';
import {MessageSchema} from '../../../core/schemas/MessageSchemas';
import DeleteMsgCmd from '../../../core/commands/messages/DeleteMsgCmd';
import StarMessageCmd from '../../../core/commands/messages/StarMessageCmd';
import SetUnreadMsgCmd from './../../../core/commands/messages/SetUnreadMsgCmd';
import {getLocale} from '../../../components/exposeLocale';
import confirm from '../../../components/popups/confirm';
import EnumEventType from '../../../core/enums/EnumEventType';
import {UserProfileSchema} from '../../../core/schemas/LoginSchemas';
import FileShareDialog from '../../dialog/message-share/FileShareDialog';

const
    KEY_FORWARD_MSG = '1',
    KEY_FAVOR_MSG = '2',
    KEY_MARK_UNREAD = '3',
    KEY_MARK_READ = '4',
    //KEY_COPY_LINK = '5',
    KEY_EDIT_MSG = '6',
    KEY_DEL_MSG = '7',
    KEY_DOWNLOAD_FILE = '8',
    KEY_RENAME_FILE = '9',
    KEY_UNDO_FAVOR_MSG = '10';

export default class MessageActionMenus extends PureRenderComponent {
    static propTypes = {
        unreadstart: ReactPropTypes.bool.isRequired,
        message: ReactPropTypes.ofSchema(MessageSchema).isRequired,
        userInfo: ReactPropTypes.ofSchema(UserProfileSchema).isRequired,
        locale: ReactPropTypes.ofLocale(['MESSAGE_COMPOSER']).isRequired,
        onSelect: ReactPropTypes.func.isRequired,
        onEdit: ReactPropTypes.func.isRequired
    }

    //componentDidMount(){
    //    const copyLinkNode = findDOMNode(this).querySelector('[data-clipboard-text]');
    //    new Clipboard(copyLinkNode);
    //}

    handleMenuSelect = ({key}) => {
        const {message} = this.props;
        switch (key) {
            case KEY_FORWARD_MSG:
                if (message.eventtype === EnumEventType.TextMsg) {
                    window.alert('TODO...');
                } else if (message.eventtype === EnumEventType.FileMsg) {
                    FileShareDialog.open(message);
                }
                break;

            case KEY_FAVOR_MSG:
            case KEY_UNDO_FAVOR_MSG:
                if (!StarMessageCmd.isPending(message.msguuid)) {
                    StarMessageCmd({
                        sessionid: message.sessionid,
                        sessiontype: message.sessiontype,
                        msguuid: message.msguuid,
                        msgsrvtime: message.msgsrvtime,
                        isstarred: key === KEY_FAVOR_MSG
                    });
                }
                break;

            case KEY_MARK_UNREAD:
                SetUnreadMsgCmd(message.sessionid, message.msguuid);
                break;

            case KEY_MARK_READ:
                SetUnreadMsgCmd(message.sessionid, null);
                break;

            case KEY_EDIT_MSG:
                this.props.onEdit();
                break;

            case KEY_DEL_MSG: {
                const appLocale = getLocale();
                confirm({
                    title: appLocale.DIALOGS.DLG_DELETE_MSG.delMsgTitle,
                    content: appLocale.DIALOGS.DLG_DELETE_MSG.delMsgTip,
                    buttons: [{
                        className: 'button-simple',
                        label: appLocale.COMMON.cancelLabel,
                        onClick(dialog) {
                            dialog.close();
                        }
                    }, {
                        className: 'button-red',
                        label: appLocale.DIALOGS.DLG_DELETE_MSG.delMsgBtnConfirm,
                        onClick(dialog) {
                            DeleteMsgCmd({
                                sessionid: message.sessionid,
                                sessiontype: message.sessiontype,
                                msguuid: message.msguuid,
                                msgsrvtime: message.msgsrvtime
                            });
                            dialog.close();
                        }
                    }]
                });
                break;
            }

            case KEY_DOWNLOAD_FILE: {
                const downloadUrl = message.fileurl.replace(/(\/perm\W)/, '/download$1');
                window.open(downloadUrl, '_blank');
                break;
            }

            case KEY_RENAME_FILE:
                window.alert('TODO...');
                break;

            default:
                window.alert('TODO...');
        }
        this.props.onSelect();
    }

    render() {
        const {locale, userInfo, unreadstart, message: {senderuid, eventtype, isstarred}} = this.props,
            isOwnMsg = userInfo.uid === senderuid,
            isTextMsg = eventtype === EnumEventType.TextMsg,
            isFileMsg = eventtype === EnumEventType.FileMsg,
            actionsLocale = locale.MESSAGES.itemActions,
            getMenuLocale = menuKey => {
                switch (menuKey) {
                    case KEY_FORWARD_MSG:
                        return actionsLocale.forwardMsg;
                    case KEY_FAVOR_MSG:
                        return actionsLocale.favorMsg;
                    case KEY_UNDO_FAVOR_MSG:
                        return '[Remove from Favorites]';
                    case KEY_MARK_UNREAD:
                        return actionsLocale.markUnread;
                    case KEY_MARK_READ:
                        return actionsLocale.markAsRead;
                    case KEY_EDIT_MSG:
                        return actionsLocale.editMessage;
                    case KEY_DEL_MSG:
                        return actionsLocale.deleteMessage;
                    case KEY_DOWNLOAD_FILE:
                        return actionsLocale.downloadMsg;
                    case KEY_RENAME_FILE:
                        return actionsLocale.rename;
                }
            };
        let menusConfig = [];
        const keyToggleMsgFavor = isstarred ? KEY_UNDO_FAVOR_MSG : KEY_FAVOR_MSG;
        if (isOwnMsg) {
            if (isTextMsg) {
                menusConfig = [ KEY_FORWARD_MSG, keyToggleMsgFavor, KEY_DEL_MSG ];
            } else if (isFileMsg) {
                menusConfig = [ KEY_FORWARD_MSG, keyToggleMsgFavor, KEY_DOWNLOAD_FILE, KEY_RENAME_FILE, KEY_DEL_MSG ];
            }
        } else {
            if (isTextMsg) {
                menusConfig = [ KEY_FORWARD_MSG, keyToggleMsgFavor, unreadstart ? KEY_MARK_READ : KEY_MARK_UNREAD ];
            } else if (isFileMsg) {
                menusConfig = [ KEY_FORWARD_MSG, keyToggleMsgFavor, KEY_DOWNLOAD_FILE, unreadstart ? KEY_MARK_READ : KEY_MARK_UNREAD ];
            }
        }

        return (
            <Menu onSelect={this.handleMenuSelect}>
                {menusConfig.map(menuKey => <MenuItem key={menuKey}>{getMenuLocale(menuKey)}</MenuItem>)}
            </Menu>
        );
    }
}
