import React, {PropTypes} from 'react';
import Composer from '../components/composer/Composer';
//import Loading from '../components/loading/Loading';
import Menubar from './menubar/Menubar';
import HeaderBarComposer from './headerbar/HeaderBarComposer';
import ChannelsStore from './../core/stores/ChannelsStore';
import RightPanelComposer from './right-panel/RightPanelComposer';
import gGlobalEventBus, {GLOBAL_EVENTS} from '../core/dispatcher/GlobalEventBus';
import JumpToMsgCmd from '../core/commands/messages/JumpToMsgCmd';
import {QueryTeamMembersCmd} from '../core/commands/TeamMembersCommands';
import {SwitchRightPanelCmd} from '../core/commands/RightPanelConfigCommands';
import TeamMembersStore from '../core/stores/TeamMembersStore';
import gSocketManager, {SOCKET_EVENTS} from '../core/gSocketManager';
import Notify from '../core/notification/Notify';
import soundPlayer from '../components/notification/soundPlayer';
import StringUtils from '../utils/StringUtils';
import TimeZoneUtils from '../utils/TimeZoneUtils';
import SettingStore, {SETTING_EVENTS} from '../core/stores/SettingStore';
import LoginStore from '../core/stores/LoginStore';
import gUiMessageQueue, {MESSAGE_QUEUE_EVENTS} from  '../core/stores/UiMessageQueue';
import {SEND_NOTIFY_TYPE,PREFERENCE_RESULT} from '../core/enums/EnumSetting';
import EnumEventType from '../core/enums/EnumEventType';
import {getUserSettingCmd} from '../core/commands/SettingCommands';
import Alert  from '../components/alert/Alert';
import exposeLocale from '../components/exposeLocale';
import EnumSessionType from '../core/enums/EnumSessionType';
import EnumRightPanelType from '../core/enums/EnumRightPanelType';
import exposePendingCmds from './view-components/exposePendingCmds';
import exposeUserInfo from './view-components/exposeUserInfo';
import defaultAvatar from '../../static/favicon.png';
import './ApplicationMainComposer.less';
import './ApplicationMainComposer.less';
import './notificationAlert.less';

@exposeLocale(['MAIN_COMPOSER'])
@exposePendingCmds([JumpToMsgCmd])
@exposeUserInfo
export default class ApplicationMainComposer extends Composer{
    static propTypes = {
        location: PropTypes.object.isRequired
    }

    constructor(props){
        super(props);
        this.state ={
            dialog:null
            , showRealname:false};
        this.alertOptions = {
            position:{
                bottom: 280,
                left: 0
            },
            show:false,
            className:'notificationAlert',
            placement: 'bottom right',
            time: 2000,
            transition: 'scale'
        };
    }

    componentWillMount(){
        const {params: {sessionid, sessiontype, msgsrvtime, msguuid}} = this.props;
        if (sessionid && sessiontype && msgsrvtime && msguuid) {
            JumpToMsgCmd({sessionid, sessiontype, msguuid, msgsrvtime});
        }
        QueryTeamMembersCmd();
        getUserSettingCmd();
        this._updateSocketState();

        gGlobalEventBus.addEventListener(GLOBAL_EVENTS.ON_SHOW_FILE_FILTER, this._onShowFileFilter);
        gUiMessageQueue.addEventListener(MESSAGE_QUEUE_EVENTS.ON_MESSAGE, this.onNotification);
        gUiMessageQueue.addEventListener(MESSAGE_QUEUE_EVENTS.ON_SHOW_MESSAGE_NUM, this.onShowMessageNum);

        gGlobalEventBus.addEventListener(GLOBAL_EVENTS.ON_SHOW_FILE_DETAIL, this.onShowFileDetail);

        ChannelsStore.bindWebSocketEvents();
        LoginStore.bindWebsocketEvents();
        SettingStore.bindWebsocketEvents();
        TeamMembersStore.bindWebsocketEvents();
        gSocketManager.addEventListener(SOCKET_EVENTS.ON_CONNECTED_CHANGE, this._updateSocketState);
        gSocketManager.openWebSocket();

        this._updateUserData = this.updateUserData.bind(this);
        SettingStore.addEventListener(SETTING_EVENTS.USER, this._updateUserData);
    }

    componentDidMount(){
        
    }

    componentWillUnmount(){
        gGlobalEventBus.removeEventListener(GLOBAL_EVENTS.ON_SHOW_FILE_FILTER, this._onShowFileFilter);
        SettingStore.removeEventListener(SETTING_EVENTS.USER, this._updateUserData);
        gUiMessageQueue.removeEventListener(MESSAGE_QUEUE_EVENTS.ON_MESSAGE, this.onNotification);
        gUiMessageQueue.removeEventListener(MESSAGE_QUEUE_EVENTS.ON_SHOW_MESSAGE_NUM, this.onShowMessageNum);   
        gGlobalEventBus.removeEventListener(GLOBAL_EVENTS.ON_SHOW_FILE_DETAIL, this.onShowFileDetail);

        ChannelsStore.dispose();
        LoginStore.unbindWebsocketEvents();
        SettingStore.unbindWebsocketEvents();
        TeamMembersStore.unbindWebsocketEvents();
        gSocketManager.removeEventListener(SOCKET_EVENTS.ON_CONNECTED_CHANGE, this._updateSocketState);
        gSocketManager.closeWebSocket();
    }

    onShowFileDetail=(filemsg)=>{
        SwitchRightPanelCmd(EnumRightPanelType.FILE);

        //sessiondetail可能还没有加载完成，这里做延时
        setTimeout(function() {            
                gGlobalEventBus.emit('onSessionFileDetail', filemsg);
            }, 50);         
    }

    onSwitchPanelByIndex=(index, subIndex)=>{
        SwitchRightPanelCmd(index, {
            subIndex: subIndex
        });
    }

    showAlert(msg, tip){
        this.refs.alertRef.show(msg, {
          time: 6000,
          tip: tip,
          type: 'info'
        });
    }

    _openMessage =(channelId)=> {
        window.focus();
        ChannelsStore.switchChannel(channelId);
    }

    onShowMessageNum = (messageInfo)=>{
        this.showAlert(StringUtils.format(this.state.locale.NEW_MESSAGE_FROM, messageInfo.topic),
        StringUtils.format(this.state.locale.NEW_MESSAGE_NUM, messageInfo.num));
    }

    onNotification=(event)=>{
        let userSetting = SettingStore.getUserSetting();
        if (!this.validateNotifyTime(userSetting)){
            let notifytype = userSetting.browsermsgnotifytype;
            let highlightwords = userSetting.highlightwords;
            let from = event.sendername, ntfBody = '';
            let isP2P = event.sessiontype===EnumSessionType.P2P;
            let topic = isP2P?event.topic:'#'+event.topic;
            let ntfTitle = StringUtils.format(gLocaleSettings.NOTIFICATION.title, topic);
            if (event.eventtype===EnumEventType.TextMsg){
                let text = event.text;
                let uid = LoginStore.getUID();
                let patternTxt = "<@U"+uid+">";
                let isMentionMe = text.indexOf(patternTxt) !== -1;
                let haveHightWords = this.checkHightLightWrods(highlightwords,text);
                if ((notifytype === SEND_NOTIFY_TYPE.AllMessage) ||
                    (notifytype === SEND_NOTIFY_TYPE.RemindMyInfo && (isP2P || haveHightWords || isMentionMe))) {
                    if (isMentionMe){
                        text = text.replace(patternTxt,"");
                    }
                    text = text.length > 80? text.substring(0, 80) +'...':text;
                    ntfBody = text;
                    if (!isP2P){
                        ntfBody = StringUtils.format(gLocaleSettings.NOTIFICATION.body, from, text);
                    }
                    if (userSetting.muteallsounds===PREFERENCE_RESULT.No){
                        soundPlayer(userSetting.browsermsgnotifysound);
                    }
                    Notify.post(ntfTitle, ntfBody, defaultAvatar, () => this._openMessage(event.from));
                }
            }
            else{
                if ((notifytype === SEND_NOTIFY_TYPE.AllMessage)||
                    (notifytype === SEND_NOTIFY_TYPE.RemindMyInfo && isP2P)){
                    ntfBody = StringUtils.format(gLocaleSettings.NOTIFICATION.fileBody, from || '', event.filename || '');
                    if (userSetting.muteallsounds===PREFERENCE_RESULT.No){
                        soundPlayer(userSetting.browsermsgnotifysound);
                    }
                    Notify.post(ntfTitle, ntfBody, defaultAvatar, () => this._openMessage(event.from));
                }
            }
        }
    }

    validateNotifyTime=(user)=>{
        let date = new Date().getTime();
        let startTime = TimeZoneUtils.formatToTodayTime(user.disablenotifystart);
        let endTime = TimeZoneUtils.formatToTodayTime(user.disablenotifyend);
        if (startTime>endTime){
            endTime = TimeZoneUtils.addDays(endTime,1);
        }
        return user.disablenotify===1&&date>startTime&&date<endTime;
    }

    checkHightLightWrods=(highlightwords,text)=>{
        var result = false;
        if (highlightwords&&text){
            text = " " +text.toLowerCase().replace(/\b[^]\b/g," ")+ " ";
            var arr = highlightwords.toLowerCase().split(",");
            for (var i=0;i<arr.length;i++){
                if (text.indexOf(" "+arr[i]+" ")>-1){
                    result = true;
                    break;
                }
            }
        }
        return result;
    }

    updateUserData=()=>{
        var data = SettingStore.getUserSetting();
        this.setState({showRealname:(data.changeusernamepolicy===1)});
    }

    _updateSocketState = () => this.setState({
        socketConnected: gSocketManager.isConnected()
    })

    _onShowFileFilter=(uid)=>{
        SwitchRightPanelCmd(EnumRightPanelType.FILE);

        gGlobalEventBus.emit('onDoFileFilter', uid);
    }
    
    render(){
        const {userInfo/*, socketConnected, locale*/} = this.state;
        let  alertContainer = <Alert ref='alertRef' {...this.alertOptions} />
        return (
            <div className="app-container">
                <HeaderBarComposer />
                <Menubar location={this.props.location}/>
                <div className="subpage-container">
                    {this.props.children}
                    <RightPanelComposer userInfo={userInfo}/>
                </div>                                
                {this.state.dialog}
                {alertContainer}
                {/*!socketConnected && (
                    <Loading className="global-connected-loading" type="spokes" width={100} height={120} delay={1000}>
                        {locale.NOT_CONNECTED_TIP}
                    </Loading>
                )*/}
            </div>
        );
    }
}

