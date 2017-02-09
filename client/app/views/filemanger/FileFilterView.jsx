import React from  'react';
import ReactDOM from 'react-dom';

import PureRenderComponent from '../../components/PureRenderComponent';
import Loading from 'react-loading';
import ReactPropTypes from '../../core/ReactPropTypes';
import {FileMsgListSchema} from '../../core/schemas/SearchStoreSchemas';
import JumpToMsgCmd from '../../core/commands/messages/JumpToMsgCmd';
import LoginStore from '../../core/stores/LoginStore';
import TeamMembersStore from '../../core/stores/TeamMembersStore';
import GlobalEventBus, {GLOBAL_EVENTS} from '../../core/dispatcher/GlobalEventBus';
import UserCheckPopover from './UserCheckPopover';
import FileFilterItem from './FileFilterItem';
import './FileFilterView.less';

const _jumpToMsg = msg => JumpToMsgCmd({
    sessionid: msg.sessionId,
    sessiontype: msg.sessionType,
    msguuid: msg.msgId,
    msgsrvtime: msg.msgTime
});


class ButtonList extends PureRenderComponent {
    static propTypes = {                
        checkedUid:ReactPropTypes.string.isRequired,
        locale: ReactPropTypes.ofLocale(['DASHBOARD','globalsearch','allfiles']).isRequired
    };

    state = {     
        checkedUid: "",  
        isCheckedAll:true,         
        showUserCheck:false
    };

    componentWillReceiveProps(props){
        if (props.checkedUid !== this.state.checkedUid) {
            if(props.checkedUid !== ''){
                    this.setState({
                        isCheckedAll:false,
                        checkedUid:props.checkedUid
                    });
                }
                else{
                    this.setState({
                        isCheckedAll:true,
                        checkedUid:LoginStore.getUID()
                    });
                }            
        }
        else{
            if(this.state.checkedUid === ''){
                this.setState({
                        isCheckedAll:true,
                        checkedUid:LoginStore.getUID()
                    });
            }
            else{
                this.setState({
                    isCheckedAll:false
                });
            }            
        }
    }

        onSelectAll=()=>{
        if(!this.state.isCheckedAll){
            this.setState({
                isCheckedAll:true
            });

            GlobalEventBus.emit(GLOBAL_EVENTS.ON_SHOW_FILE_FILTER, '');
        }        
    }    
    
    onSelectCurrent=(e)=>{
        if(e.target.getAttribute('data-id') === 'popup-btn'){
            return;
        }
        
        if(this.state.isCheckedAll){
            this.setState({
                isCheckedAll:false
            });
            GlobalEventBus.emit(GLOBAL_EVENTS.ON_SHOW_FILE_FILTER, this.state.checkedUid);
        }        
    }

    onChecked=(uid)=>{
        if(this.state.checkedUid !== uid){
            this.setState({
                isCheckedAll:false
            });
            GlobalEventBus.emit(GLOBAL_EVENTS.ON_SHOW_FILE_FILTER, uid);
        }
    }

    getTarget=()=>{
        return ReactDOM.findDOMNode(this.refs.target); 
    }

    onPopupSelect=()=>{
        this.setState({
            showUserCheck:true
        });
    }

    onHidePopover=()=>{
        this.setState({
            showUserCheck:false
        });
    }

    render(){
        const {checkedUid, isCheckedAll} = this.state;
        const {locale} = this.props;

        let checkedName = locale.justYou;
        if(checkedUid !== LoginStore.getUID()
        && checkedUid !== ""){
            const member = TeamMembersStore.getTeamMemberByUid(checkedUid);
            if(member){
                checkedName = member.username;
            }
        }

        let userCheck=(
            <UserCheckPopover placement="bottom" key="UserCheckPopover"
                target = {this.getTarget}
                show = {this.state.showUserCheck}
                onHidePopover = {this.onHidePopover}
                onChecked={this.onChecked} 
                locale={locale}
                 />
        );

        return (
            <div className="filter-button-list">
                        <div className={"disp-inblock bottom-btn"+(isCheckedAll?" active":"")} onClick={this.onSelectAll}>
                            <span className="disp-block title">{locale.everyone}</span>                            
                        </div>
                        <div className={"disp-inblock bottom-btn"+(!isCheckedAll?" active":"")} onClick={this.onSelectCurrent} ref="target">
                            <span className="disp-block title">
                                {checkedName}
                                <i className="btn-filter-pop eficon-ic_next_pressed" data-id="popup-btn" onClick={this.onPopupSelect}></i>
                            </span>                            
                        </div>
                        {userCheck}
            </div>                          
        );
    }
}

export default class FileFilterView extends PureRenderComponent {
    static propTypes = {        
        fileMessages: ReactPropTypes.ofSchema(FileMsgListSchema).isRequired,
        checkedUid:ReactPropTypes.string.isRequired,
        onLoadMore:ReactPropTypes.func.isRequired,
        filesResultCount:ReactPropTypes.number.isRequired,        
        onShowFileDetail:ReactPropTypes.func.isRequired,
        isLastBatch:ReactPropTypes.bool.isRequired,
        isPending:ReactPropTypes.bool.isRequired,
        locale:ReactPropTypes.object
    };    

    onJumpToMsg = (msg) => _jumpToMsg(msg);


    render(){        
        const {fileMessages,checkedUid, locale, isLastBatch, isPending} = this.props,            
            msgs = fileMessages;                                     
        
        return (
            <div className="file-filter-result-panel disp-block" >
                <ButtonList checkedUid={checkedUid} locale={locale} />
                <div className="msg-list scroll-y-content">
                    {msgs.map((msg, idx) => <FileFilterItem key={idx} msg={msg} locale={locale} onJumpToMsg={this.onJumpToMsg} onShowFileDetail={this.props.onShowFileDetail} />)}
                    <div className="loadmore-container">
                        {!isPending && !isLastBatch && 
                            <div className="disp-inblock panel-loadmore" onClick={this.props.onLoadMore}>                                
                                <span>{locale.loadmore}</span>
                            </div> 
                        }                            
                        {isPending && 
                            <span className="loaddingGif">
                                <Loading type='spokes' color='#e3e3e3'/>
                                <span>{locale.loading}</span>
                            </span>
                        }
                    </div>
                </div>                
            </div>
        );
    }
}

