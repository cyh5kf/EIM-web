import React from 'react';
import {findDOMNode} from 'react-dom';
import _ from 'underscore';
import Dialog from '../../../components/dialog/Dialog';
import exposeLocale from '../../../components/exposeLocale';
import UsersChatSelector from '../../view-components/users-chat-selector/UsersChatSelector';
import classnames from '../../../utils/ClassNameUtils';
import exposePendingCmds from '../../view-components/exposePendingCmds';
import CreateChannelCmd from '../../../core/commands/channel/CreateChannelCmd';
import LoginStore from '../../../core/stores/LoginStore';

import "./NewGroupChatDialog.less";

@exposeLocale(['NEW_CHAT'])
@exposePendingCmds([CreateChannelCmd])
export default class NewGroupChatDialog extends Dialog {
    constructor(props) {
        super(...arguments);
        this.state = {
            show:props.defaultShow,
            selectInputDatasource:[]
        };
    }

    className="new_group_chat";

    componentWillMount(){
        super.componentWillMount(...arguments);
    }

    componentWillUnmount(){
        super.componentWillUnmount(...arguments);
    }

    renderHeaderTitle(){
        return this.state.locale.title;
    }

    onSelectDataChanged = (data) => {
        this.setState({selectInputDatasource:data});
    }

    handleConfirm = () => {
        const {selectInputDatasource} = this.state;
        if (selectInputDatasource.length> 0) {
            let uids = [];
            selectInputDatasource.forEach(function (session) {
                uids.push(session.id);
            });

            CreateChannelCmd({uids: uids}).then(() => this.close());
        }
    }

    filterCurAccount = datasource => {
        return _.filter(datasource, data=>{
            return data.id !== LoginStore.getUID();
        });
    }

    renderContent(){
        const {selectInputDatasource, locale,pendingCmds} = this.state;
        return (
            <div className={classnames("select_input_wrap eim_global", selectInputDatasource.length>0? '' : 'empty_select_input_wrap')}>
                <div className="new_chat_content_wrap" ref="new_chat_content">
                    <UsersChatSelector 
                        selectedUser={selectInputDatasource} 
                        onSelectedUserChange={this.onSelectDataChanged} 
                        placeholder={locale.sendInvPlaceholder} 
                        alwaysShowPopup={true}
                        getPopupContainer={()=>findDOMNode(this.refs.newChatDropdown)}
                        filterResultsDatasource={this.filterCurAccount}
                    />
                    <button className="g_btn new_chat_btn" disabled={pendingCmds.isPending(CreateChannelCmd)} onClick={this.handleConfirm}>{locale.goBtnLabel}</button>
                </div>
                <div ref="newChatDropdown" className="new_chat_dropdown_wrap"></div>
            </div>
        );
    }
    
}