import React from 'react';
import StringUtils from '../../../utils/StringUtils';

export default class MessageRichTextHolder extends React.Component {

    constructor(...args){
        super(...arguments);
    }

    formatSendTime(sendTimesecond){
        let message = '',times='';
        if (sendTimesecond){
            let locale = this.props.locale;
            let sendTime = Math.floor(Number(sendTimesecond)/1000);
            let nowTime = Math.floor(new Date().getTime()/1000);
            let splitTime = nowTime-sendTime;
            if (splitTime>60*60*24*30*12){
                times = Math.ceil(splitTime/60/60/24/30/12)+ locale.timeTextList.years;
            }
            else if (splitTime>60*60*24*30){
                times = Math.floor(splitTime/60/60/24/30)+ locale.timeTextList.months;
            }
            else if (splitTime>60*60*24){
                times = Math.floor(splitTime/60/60/24)+ locale.timeTextList.days;
            }
            else if (splitTime>60*60){
                times = Math.floor(splitTime/60/60)+ locale.timeTextList.hours;
            }
            else if (splitTime>60){
                times = Math.floor(splitTime/60)+ locale.timeTextList.minutes;
            }
            else if (splitTime<60){
                times = splitTime+ locale.timeTextList.seconds;
            }
            message = StringUtils.format(locale.richTextTimeMsg,times);
        }
        return message;
    }

    render(){
        let message = this.props.file;
        let sendTimeMessage = this.formatSendTime(message.msgsrvtime);
        return (<div className="message-item-content rich-text-info-box">
                    <div className="header">
                        <div className="floatLeft txt-icon">
                            <i className="ficon_file_text_post"></i>
                        </div>
                        <div className="floatLeft title-line">
                            <label className="title">{message.title}</label>
                            <div className="desc">{sendTimeMessage}</div>
                        </div>
                    </div>
                    {message.content&&<div className="rich-content" dangerouslySetInnerHTML={{__html: message.content}}></div>}
                </div>);
    }
}
