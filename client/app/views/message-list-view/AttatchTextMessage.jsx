import React from 'react';
//import ReactDOM from 'react-dom';
import {ReactPropTypes} from '../../utils/schema';
import {MessageSchema} from '../../core/schemas/MessageSchemas';
//import moment from 'moment';

import './AttatchTextMessage.less';
import defAvatarImg from '../../../static/images/default_user_avatar.png';

import MessageHelper from './MessageHelper';

export default class AttatchTextMessage extends React.Component{
	static propTypes = {
		message: ReactPropTypes.ofSchema(MessageSchema).isRequired
	};

	render(){

		const {message: {senderavatar, senderuid}} = this.props;
        const message = this.props.message;

		//const mMsgTime = moment(Number(sendtime));

		let avatar = null;

        let msgContent = MessageHelper.parse(message);
        if(senderavatar === ""){
                avatar = <img className="sender-avatar"  width="16" height="16" data-uid={senderuid} src={defAvatarImg} />;
            }
            else{
                avatar =  <img className="sender-avatar"  width="16" height="16" data-uid ={senderuid} src={senderavatar}/>;
            }	

		return (
			<div className="inline-attachment">			 
			 	<div className="msg-inline-attachment-border"></div>                                                				
				<div className="msg-inline-attachment-content disp-inblock">
					<div className="attachment-source">
						<span className="attachment-source-icon">
							{avatar}
						</span>
						<a className="attachment-source-name">
							{message.sendername}
						</a>
					</div>
					<div className="content disp-block scroll-y" ref="messagecontent">
						<div className="content-wrap" dangerouslySetInnerHTML={{__html: msgContent}} />
					</div> 
					<div className="attachment-footer">
						<span className="msg-in">Posted in </span>
						<span className="msg-channel">#eim</span>
						<span className="divider">|</span>
						<span className="msg-time">Today at 11:39 AM</span>
					</div>
				</div>	
			</div>	
		);
	}
}
