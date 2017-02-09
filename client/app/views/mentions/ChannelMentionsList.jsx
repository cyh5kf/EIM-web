import React,{PropTypes} from 'react';
import moment from 'moment';
import TimeZoneUtils from '../../utils/TimeZoneUtils';
import exposeLocale from '../../components/exposeLocale';
import SwitchChannelCmd from '../../core/commands/channel/SwitchChannelCmd';
import ChannelsStore from '../../core/stores/ChannelsStore';
import JumpToMsgCmd from '../../core/commands/messages/JumpToMsgCmd';
import MentionStore from '../../core/stores/MentionStore';
import ReactPropTypes from '../../core/ReactPropTypes';
import {MentionMsgListSchema} from '../../core/schemas/MessageSchemas';
import LoginStore from '../../core/stores/LoginStore';
import MentionMessageItem from './MentionMessageItem';


class ChannelMentions extends React.Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        dataSource: ReactPropTypes.ofSchema(MentionMsgListSchema),
        parent: PropTypes.instanceOf(React.Component).isRequired,
        sessionid: PropTypes.string
    };

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.dataSource !== nextProps.dataSource;
    }

    switchChannel(channelData) {
        SwitchChannelCmd({sessionid: channelData.sessionid});
    }

    jumpToMsg(e, message) {
        JumpToMsgCmd({
            sessionid: message.sessionid,
            sessiontype: message.sessiontype,
            msgsrvtime: message.msgsrvtime,
            msguuid: message.msguuid
        });
    }


    renderMessageListItem(message, locale, jumpToMsg) {
        var jumpLabel = locale.jumpLabel;
        return (
            <div className="message-item-wrapper" key={message.msguuid}>
                <hr className="spacer"/>
                <div className="mention_message">
                    <a className="msg_right_link" onClick={jumpToMsg}>{jumpLabel}</a>
                    <MentionMessageItem userInfo={LoginStore.getUserInfo()} message={message} locale={locale}/>
                </div>
            </div>);
    }

    render() {

        let {locale,channelData,dataSource}=this.props;
        let content = [];
        let channelIcon = null;
        let that = this;

        if(!channelData){
            channelData = {};
            console.error('channelData is null')
        }

        if (channelData.ispublic) {
            channelIcon = <span className="normal">#</span>
        }
        else {
            channelIcon = <span className="normal ficon_Lock_o"></span>
        }

        dataSource.forEach(function (record) {
            content.push(that.renderMessageListItem(record, locale, e=>that.jumpToMsg(e, record)));
        });

        return (
            <div className="channel_mention_wrap">
                <hr className="spacer"/>
                <h3 className="small_bottom_margin">
                    <a className="channel_link" onClick={e=>this.switchChannel(channelData)}>
                        {channelIcon}
                        {channelData.displayname}
                    </a>
                </h3>
                {content}
            </div>);
    }
}





@exposeLocale(['COMMON'])
export default class ChannelMentionsList extends React.Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        parent: PropTypes.instanceOf(React.Component).isRequired,
        dataSource: ReactPropTypes.ofSchema(MentionMsgListSchema),
        date: PropTypes.string
    };

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.dataSource !== nextProps.dataSource;
    }


    renderTimeLine(locale, timeline) {
        var timeLineFormatString = null;
        var day = moment(timeline);
        if (TimeZoneUtils.isToday(day)) {
            timeLineFormatString = locale.today;
        } else {
            timeLineFormatString = TimeZoneUtils.formatToTimeLine(day);
        }
        return (
            <div key={timeline} className="mention-timeline text-center" ref="timeline-{timeline}">
                <div className="hr_1"></div>
                <span className="format-string">{timeLineFormatString}</span>
            </div>
        );
    }


    render() {

        let content = [];
        let {parent}=this.props;
        let {locale}=this.state;

        MentionStore.groupByChannel(this.props.dataSource).forEach(function (record, key) {
            let channelData = ChannelsStore.getChannelData(key);
            content.push(<ChannelMentions dataSource={record} locale={locale} parent={parent} key={key} channelData={channelData}/>);
        });

        return (
            <div className="mention_day_container_div">
                {this.renderTimeLine(locale, this.props.date)}
                {content}
            </div>
        );
    }
}
