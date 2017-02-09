import React from 'react';
import ReactDOM from 'react-dom';
import Overlay from 'react-bootstrap/lib/Overlay';
import Popover from 'react-bootstrap/lib/Popover';
import PureRenderComponent from '../../components/PureRenderComponent';
import FavouritesStore from '../../core/stores/FavouritesStore';
import EnumEventType from '../../core/enums/EnumEventType';
import EnumSessionType from '../../core/enums/EnumSessionType';
import {fileTypeByUrl, fileSizeToString} from '../../utils/FileExtensionUtils';
import JumpToMsgCmd from '../../core/commands/messages/JumpToMsgCmd';
import StarMessageCmd from '../../core/commands/messages/StarMessageCmd'
import MessageHelper from '../message-list-view/MessageHelper';
import SwitchChannelCmd from '../../core/commands/channel/SwitchChannelCmd';
import './favourites.less';

const TooltipType = {
    Hide: 0, // 不展示
    Open: 1 //展示提示
};

export default class FavouritesMessageItem extends PureRenderComponent {
    static propTypes = {
    };

    constructor(props) {
        super(props);
        this.state={
            tooltipType:TooltipType.Hide
        };

    }


    componentWillReceiveProps(nextProps) {

    }

    renderUserAvatar =(avatar)=>{
        var style = {};
        if(avatar){
            style = {
                backgroundImage:`url(${avatar})`
            };
        }
        return (<div className="sender-avatar" style={style}></div>);
    }

    renderStarredContent=(eventType,eventData,message)=> {

        switch (eventType){
            case EnumEventType.TextMsg:
                var messageData = FavouritesStore.getMessageTextData(message);
                return (
                    <div className="message-text">
                        <span dangerouslySetInnerHTML={{__html: MessageHelper.parse(messageData)}} />
                    </div>
                );
            case EnumEventType.FileMsg:
                var fileUrl = fileTypeByUrl(eventData.fileMsg.file.fileUrl);
                var fileSize = fileSizeToString(eventData.fileMsg.file.fileSize);
                var fileName = eventData.fileMsg.file.fileName;
                if(fileUrl === 'image') {
                    let style = {};
                    let fileUrl = eventData.fileMsg.file.fileUrl;
                    if(fileUrl){
                        style = {
                            backgroundImage:`url(${fileUrl})`
                        };
                    }
                    return (<div className="message-image" style={style}></div>);
                }  else {
                    return (
                        <div>
                            <div className="fill"></div>
                            <div className="message-file">
                                <div className="file_content">
                                    <i className={"file_img "+ fileUrl} />
                                    <div className="file_info">
                                        <div className="file_name">{fileName}</div>
                                        <div className="file_size_type">
                                            <span className="file_size">{fileSize}&nbsp;</span>
                                            <span className="file_type">{fileUrl}&nbsp;File</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }

            default:
                return null;
        }

    }

    switchChannel(channelData) {
        SwitchChannelCmd({sessionid: channelData});
    }

    renderStarredChannel=(sessionType,starredInfo)=> {
        switch (sessionType){
            case EnumSessionType.Channel:
                return (
                    <p className="post_in_channel">
                        Posted in
                        <a onClick={e=>this.switchChannel(starredInfo.msg.sessionId)}>#{starredInfo.msg.groupInfo.groupName}</a>
                    </p>
                );
            default:
                return null;
        }
    }

    jumpToMsg(message) {
        JumpToMsgCmd({
            sessionid: message.msg.sessionId,
            sessiontype: message.msg.sessionType,
            msgsrvtime: message.msg.msgSrvTime,
            msguuid: message.msg.msgUuid
        });
    }

    cancelCollect(message) {
        StarMessageCmd({
            sessionid: message.msg.sessionId,
            sessiontype: message.msg.sessionType,
            msguuid: message.msg.msgUuid,
            msgsrvtime: message.msg.msgSrvTime,
            isstarred: false
        });

    }

    getTooltipTarget=()=>{
        return ReactDOM.findDOMNode(this.refs.collect);
    }


    render(){
        const {starredInfo, locale} = this.props;
        let userName = starredInfo.msg.userInfo.userName,
            avatar = starredInfo.msg.userInfo.avatar,
            starredTime = FavouritesStore.getStarredTime(starredInfo.starredTime),
            eventType = starredInfo.msg.eventType,
            sessionType = starredInfo.msg.sessionType,
            eventData = starredInfo.msg.eventData,
            message = starredInfo.msg;

        const tooltipType = this.state.tooltipType;
        let  toolTip = null;
        if(tooltipType !== TooltipType.Hide){
            toolTip = (
                <Overlay show={tooltipType !== TooltipType.Hide} placement='bottom' target={this.getTooltipTarget}>
                    <Popover id="tooltip-common">{locale.unfavourites}</Popover>
                </Overlay>
            );
        }

        return (
            <div>
                <div className="favourites-message-item">
                    {this.renderUserAvatar(avatar)}
                    <div className="message-content">
                        <div>
                            <div className="sender-name">{userName}</div>
                            <div className="msg-time">{starredTime}</div>
                        </div>
                        {this.renderStarredContent(eventType,eventData,message)}
                        {this.renderStarredChannel(sessionType,starredInfo)}
                    </div>
                    <div className="collect-jump">
                        <i className="click-collect eficon-header-button-action-collect" ref="collect" onClick={this.cancelCollect.bind(this,starredInfo)}
                           onMouseOver={(e)=>this.setState({tooltipType:TooltipType.Open})} onMouseLeave={(e)=>this.setState({tooltipType:TooltipType.Hide})}></i>
                        <a className="click_jump" onClick={this.jumpToMsg.bind(this,starredInfo)} >Jump</a>
                        {toolTip}
                    </div>
                </div>

            </div>
        );
    }

}
