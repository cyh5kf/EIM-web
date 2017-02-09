import React from  'react';
import ReactPropTypes from '../../core/ReactPropTypes';
import {FileMsgListSchema} from '../../core/schemas/SearchStoreSchemas';
import PureRenderComponent from '../../components/PureRenderComponent';
import JumpToMsgCmd from '../../core/commands/messages/JumpToMsgCmd';
import FileFilterItem from './FileFilterItem';

const _jumpToMsg = msg => JumpToMsgCmd({
    sessionid: msg.sessionId,
    sessiontype: msg.sessionType,
    msguuid: msg.msgId,
    msgsrvtime: msg.msgTime
});

export default class ShareFileListView extends PureRenderComponent{
    static propTypes = {        
        dataSource: ReactPropTypes.ofSchema(FileMsgListSchema).isRequired,                onLoadMore:ReactPropTypes.func.isRequired,
        fullLoaded:ReactPropTypes.bool.isRequired
    };

     constructor(props){
        super(props);
    }

    onJumpToMsg = (msg) => _jumpToMsg(msg);

    render(){
        let that = this;
        var files = this.props.dataSource;        
        let needMore = (files && files.size > 0 && !this.props.fullLoaded)
        
        return (
            <div className="content show">
                <div className="ul-listview ul-sharefile">
                    {files.map(function (file, idx) {                        
                        return <FileFilterItem key={idx} msg={file} onJumpToMsg={that.onJumpToMsg} onShowFileDetail={that.props.onShowFileDetail} />
                    })}
                    {needMore && 
                        <div className="loadmore-container">
                            <div className="disp-inblock panel-loadmore" onClick={this.props.onLoadMore}>                                
                                <span>{this.props.locale.loadmore}</span>
                            </div>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

