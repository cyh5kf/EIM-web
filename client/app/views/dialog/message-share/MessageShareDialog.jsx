import React from 'react';
import {findDOMNode} from 'react-dom';
import _ from 'underscore';
import Dialog from '../../../components/dialog/Dialog';
import UsersSelector from '../../view-components/users-selector/UsersSelector';
import ChannelsStore from '../../../core/stores/ChannelsStore';
import EnumSessionType from '../../../core/enums/EnumSessionType';
import EnumSearchUserType from '../../../core/enums/EnumSearchUserType';
import ReactPropTypes from '../../../core/ReactPropTypes';
import {MessageSchema} from '../../../core/schemas/MessageSchemas';

import '../../view-components/center-dialog-style.less';
import './MessageShareDialog.less';

import AttatchTextMessage from '../../message-list-view/AttatchTextMessage';


const TARGET_USER_TYPES = [EnumSearchUserType.User, EnumSearchUserType.Channel];
class ChannelSelector extends UsersSelector {
    static propTypes = {
        ...UsersSelector.propTypes        
    };
    renderOption = (data) => {        
        return (
            <span className={`${data.userType === EnumSearchUserType.User ? 'user-item' : 'group-item'}`}>
                <span className="item-name">{data.name}</span>
                <span className="item-tip">{(!data.firstname && !data.lastname) ? "":(data.firstname + data.lastname)}</span>
            </span>
        );
    }
}

export default class MessageShareDialog extends Dialog {
    static propTypes = {
        ...Dialog.propTypes,        
        message: ReactPropTypes.ofSchema(MessageSchema).isRequired
    };

    static defaultProps = {
        ...Dialog.defaultProps,
        closeOnMaskClick: true,        
        className: 'dlg-messageshare'
    };

    static open(message,onClose) {
        Dialog.openDialog(MessageShareDialog, {
            onClose,
            message
        });
    }

    handleUserSelected = (data) => {        
        const lastUser = _.last(data);
        this.setState({
            selectInputDatasource: lastUser ? [lastUser] : []
        });
    }

    onShare=()=>{
        //SendShareMsgCmd
    }

    componentWillMount() {
        super.componentWillMount(...arguments);

        let immutableSessions =  ChannelsStore.getChannelDataList();  
        this.setState({
            selectInputDatasource:[],
            defaultDatasource: immutableSessions.filter(channelData => channelData.sessiontype === EnumSessionType.Channel).sortBy(channel => channel.displayname).toJS().map(channel => ({
                userType: EnumSearchUserType.Channel,
                id: channel.sessionid,
                name: channel.displayname
            }))
        })
    }

    _getPopupContainer = () => findDOMNode(this.refs['popup-container']);

    renderHeader() {
        return (
            <div className="center-dialog-header">
                <h3 className="hearder-title">Share message</h3>
                <i className="btn-close icon icon-createsnippet-button-action-close"></i>
            </div>
        );
    }
    renderFooter() {
        return (
            <div className="center-dialog-footer">
                 <ChannelSelector selectedUser={this.state.selectInputDatasource} onSelectedUserChange={this.handleUserSelected} userTypes={TARGET_USER_TYPES}
                                            alwaysShowPopup={false} getPopupContainer={this._getPopupContainer}                                          
                                            defaultDatasource={this.state.defaultDatasource}
                                            autoFocus={true}/>
                <span ref="popup-container" className="user-list-container"/> 
                <span className="btn-container">
                    <i className="btn-common cancel">Cancel</i>
                    <i className="btn-common confirm" onClick={this.onShare}>Share</i>
                </span>
            </div>
        );
    }

    renderContent() {        
        //const {message: {text, sessionid, senderavatar, sendername, senderuid, sendtime}} = this.props;
        const message = this.props.message;        
    
        return (
            <div className="center-dialog-content">
                <textarea  autoFocus ref="messageInput" autoCorrect="off" autoComplete="off" 
                    spellCheck="true" className="form-control messageinput" id="message-share-input"                    
                    placeholder={"Add a message,if you'd like."}></textarea>
                <div className="share-dialog-attachment-container">
                    <div className="attachment-group">
                        <AttatchTextMessage message={message} />                       
                    </div>
                </div>
            </div>
        );
    }
}
