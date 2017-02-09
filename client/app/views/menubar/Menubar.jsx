import React, {PropTypes} from 'react';
import {Link} from 'react-router'
import PureRenderComponent from '../../components/PureRenderComponent';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Dialog from '../../components/dialog/Dialog';
import CreateNewSessionDialog from '../dialog/CreateNewSessionDialog';
import NewGroupChatDialog from '../channels/newchat/NewGroupChatDialog';
import InviteMemberDialog from '../dialog/invite-group-member/InviteMemberDialog';
import exposeLocale from '../../components/exposeLocale';


import './menubar.less';

export const PAGE_TYPE = {
    CHATTING:"chatting",
    MAIL:"mail",
    APP:"app",
    CONTACTS:"contacts",
    ME:"me"
};

const
    MENU_KEY_NEW_SINGLE_CHAT = '1',
    MENU_KEY_NEW_GROUP_CHAT = '2',
    MENU_KEY_NEW_MACRO_MAIL_CHAT = '3',
    MENU_KEY_INVITE_MEMBERS = '4';

@exposeLocale(['MENU_BAR'])
export default class Menubar extends PureRenderComponent {
    static propTypes = {
        location: PropTypes.object.isRequired // 传递router路径, 以使其在router变化时能够更新渲染
    }
    handleAddDropdownSelect = key => {
        switch (key) {
            case MENU_KEY_NEW_SINGLE_CHAT:
                Dialog.openDialog(CreateNewSessionDialog);
                break;
            case MENU_KEY_NEW_GROUP_CHAT:
                Dialog.openDialog(NewGroupChatDialog, {
                    hiddenFooter: true
                });
                break;
            case MENU_KEY_NEW_MACRO_MAIL_CHAT:
                window.alert('TODO...');
                break;
            case MENU_KEY_INVITE_MEMBERS:
                Dialog.openDialog(InviteMemberDialog);
                break;
        }
    }

    render(){
        const {locale} = this.state;

        return (
            <nav className="menubar">
                <ul className="list-unstyled menu-list">
                    <li className="menu-action">
                        <Link to={"/main/"+PAGE_TYPE.CHATTING} className="menu-icon icon-chatting" activeClassName="active"/>
                    </li>
                    {/*<li className="menu-action">
                        <Link to={"/main/"+PAGE_TYPE.MAIL} className="menu-icon icon-mail" activeClassName="active"/>
                    </li>*/}
                    {/*<li className="menu-action">
                        <Link to={"/main/"+PAGE_TYPE.APP} className="menu-icon icon-app" activeClassName="active"/>
                    </li>*/}
                    <li className="menu-action">
                        <Link to={"/main/"+PAGE_TYPE.CONTACTS} className="menu-icon icon-contacts" activeClassName="active"/>
                    </li>
                    {/*<li className="menu-action">
                        <Link to={"/main/"+PAGE_TYPE.ME} className="menu-icon icon-me" activeClassName="active"/>
                    </li>*/}
                </ul>

                <div className="bottom-menu-list">
                    <div className="menu-action">
                        <DropdownButton onSelect={this.handleAddDropdownSelect} title="+" id="menu-bar-add-dropdown" noCaret dropup>
                            <MenuItem eventKey={MENU_KEY_NEW_SINGLE_CHAT}>{locale.addBtnActions.newMessageChat}</MenuItem>
                            <MenuItem eventKey={MENU_KEY_NEW_GROUP_CHAT}>{locale.addBtnActions.newGroupChat}</MenuItem>
                            <MenuItem eventKey={MENU_KEY_NEW_MACRO_MAIL_CHAT}>{locale.addBtnActions.newMicroMailChat}</MenuItem>
                            <MenuItem eventKey={MENU_KEY_INVITE_MEMBERS}>{locale.addBtnActions.inviteMembers}</MenuItem>
                        </DropdownButton>
                    </div>
                    <div className="menu-action logo-label">{locale.logoLabel}</div>
                </div>
            </nav>
        );
    }
}
