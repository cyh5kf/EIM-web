import React from  'react';
import moment from 'moment';

import PureRenderComponent from '../../components/PureRenderComponent';
import EnumEventType from '../../core/enums/EnumEventType';
import {ReactPropTypes} from '../../utils/schema';
import {TextMsgListSchema, FileMsgListSchema, TextMsgSchema} from '../../core/schemas/SearchStoreSchemas';
import JumpToMsgCmd from '../../core/commands/messages/JumpToMsgCmd';
import TimeZoneUtils from '../../utils/TimeZoneUtils';
import EnumSessionType from '../../core/enums/EnumSessionType';
import FileFilterItem from '../filemanger/FileFilterItem';
import './SearchResultView.less';

const _jumpToMsg = msg => JumpToMsgCmd({
    sessionid: msg.sessionId,
    sessiontype: msg.sessionType,
    msguuid: msg.msgId,
    msgsrvtime: msg.msgTime
});
const ItemsPerPage = 20;

class TextMsgItem extends PureRenderComponent {
    static propTypes = {
        msg: ReactPropTypes.ofSchema(TextMsgSchema).isRequired
    };
    jumpToMsg = () => _jumpToMsg(this.props.msg);
    render() {
        const locale = this.props.locale;
        const {msg} = this.props,
            mMsgTime = moment(msg.msgTime);

        const istoday = TimeZoneUtils.isToday(msg.msgTime);

        return (
            <div className="text-msg-item">
                <div className="msg-info">
                    <div className="session-logo">
                                {(msg.sessionType===EnumSessionType.P2P) && <i className="status-indicator"/>}
                    </div>
                    <div className="msg-detail">
                        <div className="msg-header">
                            <div className="msg-session-name">{msg.get('sessionName') || msg.get('senderName')}</div>
                            <div className="right-container">
                                <span className="jump-to-msg" onClick={this.jumpToMsg}>{locale.jumpTo} </span>
                                <span className="msg-date">{istoday?(mMsgTime.format('h:mm')+ (mMsgTime.hour() >= 12 ? 'PM' : 'AM')): mMsgTime.format('MMMDo')}</span>
                            </div>
                        </div>       
                        <div className="msg-content">
                            <span className="msg-sender-name">{msg.get('senderName')}: </span>  
                            <span dangerouslySetInnerHTML={{__html: msg.get('msgData')}}></span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const FILTER_INDEX = {
    MSG:0,
    MAIL:1,
    FILE:2
}

class ButtonList extends PureRenderComponent {
    static propTypes = {        
        msgCount: ReactPropTypes.number.isRequired,
        mailCount: ReactPropTypes.number.isRequired,
        fileCount: ReactPropTypes.number.isRequired
    };

    

    state = {
        filterIndex: FILTER_INDEX.FILE
    };

    onButtonClick=(index)=>{
        this.setState({filterIndex:index});

        if(index === FILTER_INDEX.MSG){
            this.props.switchMsgType(EnumEventType.TextMsg);
        }
        else if(index === FILTER_INDEX.FILE){
            this.props.switchMsgType(EnumEventType.FileMsg);
        }
    }

    render(){
        const {filterIndex} = this.state;
        const {locale, msgCount, mailCount, fileCount} = this.props;

        return (
            <div className="filter-button-list">
                        <div className={"disp-inblock bottom-btn"+(filterIndex===FILTER_INDEX.MSG?" active":"")} onClick={() => this.onButtonClick(FILTER_INDEX.MSG)}>
                            <span className="disp-block title">{locale.textMsg}</span>
                            <span className={"disp-block count" + (msgCount>0?" withdata":"")}>{'('+msgCount+')'}</span>
                        </div>
                        <div className={"disp-inblock bottom-btn"+(filterIndex===FILTER_INDEX.MAIL?" active":"")} onClick={() => this.onButtonClick(FILTER_INDEX.MAIL)}>
                            <span className="disp-block title">{locale.mail}</span>
                            <span className={"disp-block count" + (mailCount>0?" withdata":"")}>{'('+mailCount+')'}</span>
                        </div>
                        <div className={"disp-inblock bottom-btn"+(filterIndex===FILTER_INDEX.FILE?" active":"")} onClick={() => this.onButtonClick(FILTER_INDEX.FILE)} >
                            <span className="disp-block title">{locale.fileMsg}</span>
                            <span className={"disp-block count" + (fileCount>0?" withdata":"")}>{'('+fileCount+')'}</span>
                        </div>
            </div>                          
        );
    }
}

let currentPage = 0;
let countPage = 0;

export default class SearchResultView extends PureRenderComponent {
    static propTypes = {
        textMessages: ReactPropTypes.ofSchema(TextMsgListSchema).isRequired,
        fileMessages: ReactPropTypes.ofSchema(FileMsgListSchema).isRequired,
        onShowFileDetail: ReactPropTypes.func.isRequired
    };

    state = {
        displayingMsgType: EnumEventType.FileMsg
    };

    switchMsgType = msgType => this.setState({displayingMsgType: msgType});

    componentWillReceiveProps(nextProps) {
        const {textMessages, fileMessages} = this.props,
            {textMessages: nextTexts, fileMessages: nextFiles} = nextProps;
        if (textMessages !== nextTexts || fileMessages !== nextFiles) {
            if ((nextTexts && nextTexts.size) && (!nextFiles || !nextFiles.size)) {
                this.switchMsgType(EnumEventType.TextMsg);
            } else if ((!nextTexts || !nextTexts.size) && (nextFiles && nextFiles.size)) {
                this.switchMsgType(EnumEventType.FileMsg);
            }else if(textMessages === nextTexts && (nextFiles && nextFiles.size)){
                //仅搜索结果变化，展示文件搜索结果
                this.switchMsgType(EnumEventType.FileMsg);
            }
        }
    }

    onSwitchPrePage=()=>{
        if(currentPage > 1){
            this.props.onSwitchIndex((currentPage - 2)*20, this.state.displayingMsgType);
        }
    }
    onSwitchNextPage=()=>{
        if(currentPage < countPage){
            this.props.onSwitchIndex(currentPage*20, this.state.displayingMsgType);
        }
    }

    onJumpToMsg = (msg) => _jumpToMsg(msg);

    render(){
        const locale = this.props.locale;
        const {textMessages, fileMessages, textsResultCount, textsCurStart, filesResultCount, filesCurStart} = this.props,
            showTextMsg = this.state.displayingMsgType === EnumEventType.TextMsg,
            msgs = showTextMsg ? textMessages : fileMessages,
            MsgItemComponent = showTextMsg ? TextMsgItem : FileFilterItem;

        if(showTextMsg){
            countPage =  Math.ceil(textsResultCount/ItemsPerPage);
            currentPage = 1 + textsCurStart/ItemsPerPage;
        }else{
            countPage =  Math.ceil(filesResultCount/ItemsPerPage);
            currentPage = 1 + filesCurStart/ItemsPerPage;
        }

        return (
            <div className="search-messages-result-panel disp-block" >
                <ButtonList locale={locale} switchMsgType={this.switchMsgType} msgCount={this.props.textsResultCount} mailCount={0} fileCount={this.props.filesResultCount} />
                <div className="msg-list scroll-y-content">
                    {msgs.map((msg, idx) => <MsgItemComponent key={idx} msg={msg} locale={locale} onJumpToMsg={this.onJumpToMsg} onShowFileDetail={this.props.onShowFileDetail}/>)}
                    <div className="loadmore-container">
                        <span className={"btn btn-pre-page"+ (currentPage===1?" disabled":"")} onClick={this.onSwitchPrePage}>{"<-"}</span>
                        <span className="page-text">{"PAGE "+(countPage>0?currentPage:0) + " OF "+ countPage}</span>
                        <span className={"btn btn-next-page"+ ((currentPage===countPage || countPage < 1)?" disabled":"")} onClick={this.onSwitchNextPage}>{"->"}</span>
                    </div>
                </div>
            </div>
        );
    }
}

