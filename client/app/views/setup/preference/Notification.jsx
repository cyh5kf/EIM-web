import React from 'react';
import _ from 'underscore';
import {ReactPropTypes} from '../../../utils/schema';
import {UserInfoSchema} from '../../../core/schemas/SettingSchemas';
import toast from '../../../components/popups/toast'
import Notify from '../../../core/notification/Notify';
import SettingsPage from '../../settings/SettingsPage';
import SettingUtils from '../../settings/SettingUtils';
import StringUtils from '../../../utils/StringUtils';
import LoginStore from '../../../core/stores/LoginStore';
import Select from '../../../components/rc-select/Select';
import exposeLocale from '../../../components/exposeLocale';
import soundsList from '../../../core/enums/EnumSoundsList';
import timeOptList from '../../../core/enums/EnumTimeOptList';
import timeZoneList from '../../../core/enums/EnumTimeZoneList';
import soundPlayer from '../../../components/notification/soundPlayer';
import SavedLoading from '../../../components/loading/SavingLoading';
import {PREFERENCE_NOTIFY_TYPE,SEND_NOTIFY_TYPE,PREFERENCE_RESULT} from '../../../core/enums/EnumSetting';
import defaultAvatar from '../../../../static/favicon.png';

@exposeLocale()
export default class Notification extends React.Component{

    static propTypes = {
		userSetting: ReactPropTypes.ofSchema(UserInfoSchema).isRequired
	};

    constructor(props){
        super(props);
        let user = this.props.userSetting;
        let timezone = LoginStore.getTimeZone()+"";
        let currentTimezone = _.find(timeZoneList.dataList(),ztime=>ztime.id===timezone);
        if(!currentTimezone){
            currentTimezone = timeZoneList.dataList()[0];
            console.error('cannot get timezone of ' + timezone);
        }
        let sendNotificaObj = SettingUtils.sendNotificaObject(this.props.locale);
        let param = this.setDefaultParam(user);
        this.state = _.extend({show:true,
            allowClickNotify:true,
            allowClickSounds:true,
            showNotification: false,
            showNotInterrpt:false,
            currentTimezone: currentTimezone,
            soundsList:soundsList,
            sendNotificaObj:sendNotificaObj,
            timeOptionList:timeOptList.dataList
        },param);
    }

    open(){
        this.setState({show:true});
    }

    close(){
        this.setState({show:false});
    }

    componentWillReceiveProps(nextProps){
        let user = nextProps.userSetting;
        this.setState(this.setDefaultParam(user));
    }

    setDefaultParam(user){
        let notifysound = user.browsermsgnotifysound;
        let msgnotifysound = (notifysound&&notifysound!=='xxx.mp3')?notifysound:'None';
        return {disablenotify:user.disablenotify,
            disablenotifystart:user.disablenotifystart,
            disablenotifyend: user.disablenotifyend,
            muteallsounds:user.muteallsounds,
            notifyshowmsg:user.notifyshowmsg,
            highlightwords:user.highlightwords,
            browsermsgnotifytype:user.browsermsgnotifytype,
            browsermsgnotifysound:msgnotifysound};
    }

    startTimeCallback=(obj)=>{
        let setting = {disablenotifystart:obj.id};
        let loading = this.refs['disableNotifyLoading'];
        this.setState(setting);
        loading.load();
        setting.uid = this.props.userSetting.uid;
        this.props.parent.updateUserSetting(setting,PREFERENCE_NOTIFY_TYPE.Disablenotifystart,loading,this.updateCallback);
    }
    
    endTimeCallback=(obj)=>{
        let setting = {disablenotifyend:obj.id};
        let loading = this.refs['disableNotifyLoading'];
        loading.load();
        this.setState(setting);
        setting.uid = this.props.userSetting.uid;
        this.props.parent.updateUserSetting(setting,PREFERENCE_NOTIFY_TYPE.Disablenotifyend,loading,this.updateCallback);
    }

    changeHighlightVal=(e)=>{
        let val = e.target.value;
        let loading = this.refs['hightlightwordsLoading'];
        let setting = {highlightwords:val};
        loading.load();
        this.setState(setting);
        setting.uid = this.props.userSetting.uid;
        this.props.parent.updateUserSetting(setting,PREFERENCE_NOTIFY_TYPE.Highlightwords,loading,this.updateCallback);
    }

    changeNotifyValue=(_index,val)=>{
        let setting = null,loading = null;
        switch(_index){
            case PREFERENCE_NOTIFY_TYPE.Browsermsgnotifytype:
                setting={browsermsgnotifytype:val};
                loading = this.refs['sendNotifyLoading'];
            break;
            case PREFERENCE_NOTIFY_TYPE.Browsermsgnotifysound:
                if (this.state.allowClickSounds){
                    setting={browsermsgnotifysound:val,allowClickSounds:false};
                    loading = this.refs['soundsLoading'];
                    soundPlayer(val);
                }
            break;
            case PREFERENCE_NOTIFY_TYPE.Notifyshowmsg:
                val = val===PREFERENCE_RESULT.Yes?PREFERENCE_RESULT.No:PREFERENCE_RESULT.Yes;
                setting={notifyshowmsg:val};
                loading = this.refs['notifyMsgLoading'];
            break;
            case PREFERENCE_NOTIFY_TYPE.Disablenotify:
                val = val===PREFERENCE_RESULT.Yes?PREFERENCE_RESULT.No:PREFERENCE_RESULT.Yes;
                setting={disablenotify:val};
                loading = this.refs['disableNotifyLoading'];
            break;
            case PREFERENCE_NOTIFY_TYPE.Muteallsounds:
                val = val===PREFERENCE_RESULT.Yes?PREFERENCE_RESULT.No:PREFERENCE_RESULT.Yes;
                setting={muteallsounds:val};
                loading = this.refs['mutesoundsLoading'];
            break;
        }
        if (setting&&loading){
            loading.load();
            this.setState(setting);
            setting.uid = this.props.userSetting.uid;
            this.props.parent.updateUserSetting(setting,_index,loading,this.updateCallback);
        }
    }

    updateCallback=(propid,loading,result)=>{
        let locale = this.props.locale;
        if (result&&loading){
            loading.loaded();
            loading.hideLoad();
        }
        else{
            loading.quickHideLoad();
            toast(locale.errorMsg);
        }

        if (propid===PREFERENCE_NOTIFY_TYPE.Browsermsgnotifysound){
            setTimeout(()=>{
                this.setState({allowClickSounds:true});
            },300);
        }
    }

    toggleInterruptBox=()=>{
        let showNotInterrpt = this.state.showNotInterrpt;
        this.setState({showNotInterrpt:!showNotInterrpt});
    }

    toggleNotificationBox=()=>{
        let showNotification = this.state.showNotification;
        this.setState({showNotification:!showNotification});
    }

    listenVoiceClick=(sound)=>{
        soundPlayer(sound);
    }

    testNotification=(e)=>{
        if (this.state.allowClickNotify){
            this.setState({allowClickNotify:false});
            const ntfTitle = StringUtils.format(gLocaleSettings.NOTIFICATION.test_title, "Mission");
            if (this.state.muteallsounds===PREFERENCE_RESULT.No){
                soundPlayer(this.state.browsermsgnotifysound);
            }
            Notify.post(ntfTitle, "", defaultAvatar, null);
            setTimeout(()=>{
                this.setState({allowClickNotify:true});
            },300);
        }
    }

    render(){
        var that = this;
        var locale = this.props.locale;
        var showNotInterrpt = this.state.showNotInterrpt;
        var notInterrptCss = showNotInterrpt?" open":" closed";
        var showNotification = this.state.showNotification;
        var notificationCss = showNotification?" open":" closed";
        var soundList = this.state.soundsList;
        var disablenotify = this.state.disablenotify;
        var checked = disablenotify===PREFERENCE_RESULT.Yes;
        var showClass = this.state.show?'':'hidden';
        var timeOptionList = this.state.timeOptionList;
        var isAllowNotify = window.Notification && Notification.permission !== "denied";
        var disabledTimeLabel = StringUtils.format(locale.disabledTimeLabel,this.state.disablenotifystart,this.state.disablenotifyend,this.state.currentTimezone.name);
        var browsermsgnotifysound = this.state.browsermsgnotifysound;
        var notifysoundResult = this.state.muteallsounds?locale.soundsMuted:soundList[browsermsgnotifysound];
        var muteSoundsCss = this.state.muteallsounds===PREFERENCE_RESULT.Yes?" selected":"";
        var disableSound = this.state.muteallsounds===PREFERENCE_RESULT.Yes?" mute-disabled":"";
        var soundNode = _.map(soundList,function(val,key){
            return (<li key={"sound_"+key} data-index={key} className={browsermsgnotifysound===key?'selected':''}>
                        <div className="eim-radio" onClick={e=>that.changeNotifyValue(PREFERENCE_NOTIFY_TYPE.Browsermsgnotifysound,key)}></div><span>{val}</span>
                        {key!=='None'&&<span className="soundVedio ficon_volume_up" onClick={e=>that.listenVoiceClick(key)}></span>}
                    </li>);
        });
        return (<div className={"displayBox notification "+showClass}>
                    <div className={"notificaSetBox notificationLine"+notificationCss}>
                        <div className="summaryInfoBox" onClick={this.toggleNotificationBox}>
                            <h2 className="notificaSetting summaryTitle"><span className="eim-notificasetting ficon_Bell_o"></span>{locale.notificaSetting}
                            <i className="ficon_caret_down drop-icon"></i>
                            <i className="ficon_caret_right drop-icon"></i>
                            </h2>
                            <div className="notification_summary">
                                <span className="small_right_margin">
                                    <b className="black">{locale.notification_summary.sendNotification}</b> <span dangerouslySetInnerHTML={{__html:this.state.sendNotificaObj[this.state.browsermsgnotifytype]}}></span>
                                </span>
                                <span className="small_right_margin">
                                    <b className="black">{locale.notification_summary.voiceLabel}</b> {notifysoundResult}
                                </span>
                                <span className="small_right_margin">
                                    <b className="black">{locale.notification_summary.showNoticeLabel}</b> {this.state.notifyshowmsg?locale.showText:locale.hideText}
                                </span>
                            </div>
                        </div>
                        <div className={"notificationsBox informationModel"}>
                            {isAllowNotify&&<div className="sendNotificationLine">
                                <div className="optionLabel notificationLabel">{locale.sendNotification}<SavedLoading ref="sendNotifyLoading" className="sendNotifyLoading"/></div>
                                <ul className="optionList">
                                    <li className={this.state.browsermsgnotifytype===SEND_NOTIFY_TYPE.AllMessage?'selected':''}>
                                        <div className="eim-radio" onClick={e=>that.changeNotifyValue(PREFERENCE_NOTIFY_TYPE.Browsermsgnotifytype,SEND_NOTIFY_TYPE.AllMessage)}></div>{locale.noticeAllMsg}
                                    </li><li className={this.state.browsermsgnotifytype===SEND_NOTIFY_TYPE.RemindMyInfo?'selected':''}>
                                        <div className="eim-radio" onClick={e=>that.changeNotifyValue(PREFERENCE_NOTIFY_TYPE.Browsermsgnotifytype,SEND_NOTIFY_TYPE.RemindMyInfo)}></div><span dangerouslySetInnerHTML={{__html:locale.noticeRemindMe}}></span>
                                    </li><li className={this.state.browsermsgnotifytype===SEND_NOTIFY_TYPE.noNotify?'selected':''}>
                                        <div className="eim-radio" onClick={e=>that.changeNotifyValue(PREFERENCE_NOTIFY_TYPE.Browsermsgnotifytype,SEND_NOTIFY_TYPE.noNotify)}></div><span dangerouslySetInnerHTML={{__html:locale.noticeNothing}}></span>
                                    </li>
                                </ul>
                                <div className="sendNotificationMsg"><span dangerouslySetInnerHTML={{__html:locale.sendNotificationMsg}}></span><a onClick={e=>SettingsPage.openSettingsPage("manage-account/notifications")} target="_blank">{locale.notifyLinkText}</a></div>
                            </div>
                            }
                            {!isAllowNotify&&<div className="sendNotificationLine">
                                <div className="disabledNotifyTitle">通知功能目前已停用</div>
                                <div className="disabledNotifyDesc">你已经在你的浏览器中禁用通知提醒功能，你可以在浏览器的设置中修改此设置。</div>
                            </div>}
                            <div className="optionLabel">{locale.voiceLabel}<SavedLoading ref="soundsLoading" className="soundsLoading"/></div>
                            <ul className={"soundsList optionList"+disableSound}>
                                {soundNode}
                            </ul>

                            <div className="muteAllSounds">
                                <div className="text">
                                    <div className={"icon eim-checkBox"+muteSoundsCss} onClick={e=>that.changeNotifyValue(PREFERENCE_NOTIFY_TYPE.Muteallsounds,this.state.muteallsounds)}></div>{locale.muteSoundsLabel}
                                    <SavedLoading ref="mutesoundsLoading" className="mutesoundsLoading"/>
                                </div>
                                <div className="desc">{locale.muteSoundsDesc}</div>
                            </div>

                            <div className="optionLabel">{locale.showNoticeLabel}<SavedLoading ref="notifyMsgLoading"/></div>
                            <ul className="optionList">
                                <li className={this.state.notifyshowmsg===PREFERENCE_RESULT.Yes?'selected':''}>
                                    <div className="icon eim-checkBox" onClick={e=>that.changeNotifyValue(PREFERENCE_NOTIFY_TYPE.Notifyshowmsg,this.state.notifyshowmsg)}></div>{locale.showNoticeMsg}
                                </li>
                                <div className="showNoticeDesc">{locale.showNoticeDesc}</div>
                            </ul>
                            <button className="notificationButton sendTestNotifica" onClick={this.testNotification}><i className="ficon_Bell_o"></i>{locale.testNotificaLabel}</button>

                            <div className="optionLabel">{locale.attentionLabel}<SavedLoading ref="hightlightwordsLoading"/></div>
                            <div className="contactDesc">{locale.attentionDesc}</div>
                            <div className="setContactLine">
                                <input type="text" className="setContactMsg" value={this.state.highlightwords} onChange={that.changeHighlightVal} placeholder={locale.attentionPlaceholder}/>
                            </div>
                        </div>
                    </div>

                    <div className={"notInterruptBox notificationLine"+notInterrptCss}>
                        <div className="summaryInfoBox" onClick={this.toggleInterruptBox}>
                            <div className="notInterrupt summaryTitle">
                                <div className="eim-notificasetting ficon_snooze_outline"></div>
                                {locale.notInterruptLabel}
                                <i className="ficon_caret_down drop-icon"></i>
                                <i className="ficon_caret_right drop-icon"></i>
                            </div>
                            <div className="notification_summary">
                                <span className="small_right_margin" dangerouslySetInnerHTML={{__html:disabledTimeLabel}}></span>
                            </div>
                        </div>
                        <div className="settingContent notDisturbBox informationModel">
                            <div className="contactDesc" dangerouslySetInnerHTML={{__html:locale.notInterruptDesc}}></div>
                            <div className="inactiveNotice"><input type="checkBox" className="icon" defaultChecked={checked} onClick={e=>that.changeNotifyValue(PREFERENCE_NOTIFY_TYPE.Disablenotify,disablenotify)}/>{locale.forbidNoticeLabel}<SavedLoading ref="disableNotifyLoading" className="disableNotifyLoading"/></div>
                            <div className="timeLimitLine">
                                <div className={`startTime ${checked?'':'disable'}`}>
                                    <Select showSearch={false} selectedDatasource={timeOptionList.find(item => item.id === this.state.disablenotifystart)} datasource={timeOptionList} onSelectedDatasourceChange={this.startTimeCallback}/>
                                </div>
                                <div className="timeText">{locale.toLabel}</div>
                                <div className={`endTime ${checked?'':'disable'}`}>
                                    <Select showSearch={false} selectedDatasource={timeOptionList.find(item => item.id === this.state.disablenotifyend)} datasource={timeOptionList} onSelectedDatasourceChange={this.endTimeCallback}/>
                                </div>
                                <div className="currentTimezone">{this.state.currentTimezone.name}</div>
                                <div className="changeTimezone">{locale.bracketLeft}<a className="link" onClick={e=>SettingsPage.openSettingsPage('manage-account/settings#timezone')} target="_blank">{locale.changeLabel}</a>{locale.bracketRight}</div>
                                <div className="clearFloat"></div>
                            </div>
                        </div>
                    </div>
                </div>);
    }
}

