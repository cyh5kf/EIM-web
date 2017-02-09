import React from 'react';
import TimeZoneUtils from '../../utils/TimeZoneUtils';
import PureRenderComponent from '../../components/PureRenderComponent';
import ReactPropTypes from '../../core/ReactPropTypes';
import MessageHelper from '../message-list-view/MessageHelper';
import {MessageSchema, MentionMsgSchema} from '../../core/schemas/MessageSchemas';
import {UserProfileSchema} from '../../core/schemas/LoginSchemas';

import './mentions-item.less';

export default class MentionMessageItem extends PureRenderComponent {
    static propTypes = {
        message:ReactPropTypes.ofSchemas([MessageSchema, MentionMsgSchema]),
        userInfo: ReactPropTypes.ofSchema(UserProfileSchema).isRequired
    };

    constructor(props) {
        super(props);
        this.state = {};
    }


    componentWillReceiveProps(nextProps) {

    }



    renderUserAvatar(message){
        var style = {};
        if(message.senderavatar){
             style = {
                backgroundImage:`url(${message.senderavatar})`
            };
        }
        return (<div className="msg-sender-logo" style={style} data-senderuid={message.senderuid}></div>);
    }


    render(){
        var {message,userInfo} = this.props;
        return (
            <div className={`mentions-message-item`} data-msguuid={message.msguuid}>
                <div className="sender-avatar">
                    {this.renderUserAvatar(message)}
                </div>
                <div className="message-content">
                    <div>
                        <div className="sender-name">{message.sendername}</div>
                        <div className="msg-time">{TimeZoneUtils.timeToLocale(message.msgsrvtime,'h:mA')}</div>
                    </div>
                    <div className="message-text">
                        <span dangerouslySetInnerHTML={{__html: MessageHelper.parse(message,userInfo)}}/>
                    </div>
                </div>
            </div>
        );
    }

}
