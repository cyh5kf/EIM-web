import React from 'react';
import {findDOMNode} from 'react-dom';
import moment from 'moment';
import Dialog from '../../../components/dialog/Dialog';
import exposeLocale from '../../../components/exposeLocale';
import UsersSelector from '../../view-components/users-selector/UsersSelector';
import EnumSearchUserType from '../../../core/enums/EnumSearchUserType';
import ReactPropTypes from '../../../core/ReactPropTypes';
import {MessageSchema} from '../../../core/schemas/MessageSchemas';
import ChannelsStore from '../../../core/stores/ChannelsStore';
import EnumSessionType from '../../../core/enums/EnumSessionType';
import {isPicture} from '../../../utils/FileExtensionUtils';
import ShareFileMessageCmd from '../../../core/commands/messages/ShareFileMessageCmd';
import {getTargetUidByChannelId} from '../../../core/core-utils/ChannelUtils';
import {FileMsgSchema} from '../../../core/schemas/SearchStoreSchemas';
import './FileShareDialog.less';
import * as schema from '../../../utils/schema';
import StringUtils from '../../../utils/StringUtils';
import LoginStore from '../../../core/stores/LoginStore';
import {getChannelIdByUserId} from '../../../core/core-utils/ChannelUtils';
import PublishP2PCmd from '../../../core/commands/channel/PublishP2PCmd';
import {fileTypeByUrl} from '../../../utils/FileExtensionUtils';

import '../../view-components/center-dialog-style.less';

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

@exposeLocale(['DIALOGS', 'dlg-fileshare'])
export default class FileShareDialog extends Dialog {
    static propTypes = {
        ...Dialog.propTypes,              
        fileMsg: ReactPropTypes.ofSchema(MessageSchema).isRequired
    };

    static defaultProps = {
        ...Dialog.defaultProps,
        closeOnMaskClick: true,
        className: 'dlg-fileshare'
    };
    static openMessage(msg,onClose) {
        let tMsg = {
            senderName: msg.sendername,
            msgTime: msg.msgsrvtime,
            msgId: msg.msguuid,
            sessionId: msg.sessionid,
            sessionType:  msg.sessiontype,
            
            senderUid: msg.senderuid,
            resourceid: msg.resourceid,
            filetype: msg.filetype,
            filesize: msg.filesize,
            fileName: msg.filename,
            fileUrl: msg.fileurl,
            imgwidth: msg.imgwidth?msg.imgwidth:0,
            imgheight: msg.imgheight?msg.imgheight:0
            
        };
        let fileMsg = schema.createImmutableSchemaData(FileMsgSchema, tMsg)
        Dialog.openDialog(FileShareDialog, {
            onClose,
            fileMsg
        });
    }

    static open(fileMsg,onClose) {
        Dialog.openDialog(FileShareDialog, {
            onClose,
            fileMsg
        });
    }

    handleUserSelected = (channel) => {    
        this.setState({selectedChannel: channel});            
    }

     _handleOnSendMessage = () => {
         this.onClose();        
    }

    onShare=()=>{
        //SendShareMsgCmd   
        if(!this.state.selectedChannel){
            return;
        }    
        const selected = this.state.selectedChannel;
        const {fileMsg: {resourceid,fileUrl,filetype, fileName, filesize,imgwidth,imgheight,msgTime}} = this.props;

        const pureFilename = StringUtils.htmlToText(fileName);
        const isPic = isPicture(filetype);

        let channelid = getChannelIdByUserId(selected.id);
        const channel = ChannelsStore.getChannel(channelid);
        if(Number(selected.userType)===0 && !channel){
             PublishP2PCmd(selected.id)
                .then(() => {
                     ShareFileMessageCmd({
                        toid: selected.id,
                        isP2P: Number(selected.userType) === 0,
                        resourceid:resourceid,
                        filetype:filetype,
                        filename:pureFilename,
                        filedesc:"",
                        filesize:filesize,
                        fileurl:fileUrl,
                        gmtcreate:msgTime,
                        imgwidth:isPic?imgwidth:0,
                        imgheight:isPic?imgheight:0

                    }).then(this._handleOnSendMessage);   
                });        
        }
        else{
             ShareFileMessageCmd({
                toid: selected.id,
                isP2P: Number(selected.userType) === 0,
                resourceid:resourceid,
                filetype:filetype,
                filename:pureFilename,
                filedesc:"",
                filesize:filesize,
                fileurl:fileUrl,
                gmtcreate:msgTime,
                imgwidth:isPic?imgwidth:0,
                imgheight:isPic?imgheight:0

            }).then(this._handleOnSendMessage);   
        }
                       
    }

    onClose=()=>{
        this.close();
    }

    filterChannels = users => {        
        let uid = LoginStore.getUID();        

        return users.filter(user => !(user.userType===EnumSearchUserType.Channel && user.members.every(member =>member.uid !== uid)));        
    }

    componentWillMount() {
        super.componentWillMount(...arguments);

        const fileMsg = this.props.fileMsg;
        let targetId = fileMsg.sessionId;        
        if(Number(fileMsg.sessionType) === 0){
            targetId = getTargetUidByChannelId(fileMsg.sessionId);
        }        

        const channelData = ChannelsStore.getChannelData(fileMsg.sessionId);
        //fcj.todo: 这里可能取不到，因为channelsStore里没有存所有的channel信息
        const targetName = channelData?channelData.displayname:'';

        let selected={
            id:targetId,
            name:targetName,
            userType:fileMsg.sessionType
        };
       
        let immutableSessions =  ChannelsStore.getChannelDataList();  
        this.setState({
            selectedChannel:selected,
            defaultDatasource: immutableSessions.filter(channelData => channelData.sessiontype === EnumSessionType.Channel).sortBy(channel => channel.displayname).toJS().map(channel => ({
                userType: EnumSearchUserType.Channel,
                id: channel.sessionid,
                name: channel.displayname
            }))
        })
    }

    _getPopupContainer = () => findDOMNode(this.refs['popup-container']);

    renderHeader() {
        const locale = this.state.locale;
        return (
            <div className="center-dialog-header">
                <h4 className="hearder-title">{locale.sharefileTitle}</h4>
                <i className="btn-close eficon-37" onClick={this.onClose}></i>
            </div>
        );
    }
    renderFooter() {
        const {locale} = this.state; 
        return (
            <div className="center-dialog-footer">                 
                <span ref="popup-container" className="user-list-container"/> 
                <span className="btn-container">
                    <span className="btn-common cancel" onClick={this.onClose}>{locale.cancel}</span>
                    <span className="btn-common confirm" onClick={this.onShare}>{locale.share}</span>
                </span>
            </div>
        );
    }

    renderContent() {        
        const {fileMsg: {fileUrl, fileName, senderName, msgTime}} = this.props;   

        const {defaultDatasource, locale} = this.state;     
        
        const fileType = (
				<i className={"file-item-type "+ fileTypeByUrl(fileUrl)} />
			);

        const mMsgTime = moment(Number(msgTime));    

        return (
            <div className="center-dialog-content">
                <div className="file-info">
                    {fileType}
                    <span className="file-item-info">
                        <span className ="file-name"><span dangerouslySetInnerHTML={{__html: fileName}}></span></span>
                        <span className="file-info-1">
                            <span className ="file-author">{senderName}</span>
                            <span className ="file-time">{mMsgTime.format('YY/MM/DD h:mm')}{mMsgTime.hour() >= 12 ? 'PM' : 'AM'}</span>
                        </span>
                    </span>
                </div>
                <div className="share-dialog-attachment-container">
                    <div className="select-label disp-block">{locale.shareIn}</div>
                    <div className="select-container  disp-block">
                        <ChannelSelector  multiple={false} selectedUser={this.state.selectedChannel} onSelectedUserChange={this.handleUserSelected} filterResultsDatasource={this.filterChannels} userTypes={TARGET_USER_TYPES}
                                            alwaysShowPopup={false} getPopupContainer={this._getPopupContainer}                                          
                                            defaultDatasource={defaultDatasource}
                                            autoFocus={true}
                                            placeholder="Search"
                                            />
                    </div>
                </div>
            </div>
        );
    }
}
