import React from 'react';
import _ from 'underscore';
import toast from '../../../components/popups/toast'
import classnames from '../../../utils/ClassNameUtils';
import exposeLocale from '../../../components/exposeLocale';
import notifyTypeList from '../../../core/enums/EnumNotifyType';
import Select from '../../../components/rc-select/Select';
import {ACCOUNT_NOTIFY_TYPE,EMAILNOTIFY_TYPE,MARK_MSG_READ_TYPE} from '../../../core/enums/EnumSetting';
import EnumVoicesList from '../../../core/enums/EnumVoicesList';
import SaveButton,{LOADING_STATUS} from '../../../components/button/LoadingButton';
import SavedLoading,{LOADING_STATUS as LoadButtonStatus} from '../../../components/loading/SavingLoading';
import soundPlayer from '../../../components/notification/soundPlayer';
import AccountNotifyItem from '../../../components/setupitem/AccountNotifyItem';
import SettingStore, {SETTING_EVENTS} from '../../../core/stores/SettingStore';
import {getUserSettingCmd, updateUserSettingCmd} from '../../../core/commands/SettingCommands';

@exposeLocale()
export default class Notification extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            show:true,
            wordsLoading:LoadButtonStatus.HideLoad,
            markAsReadLoading:LoadButtonStatus.HideLoad,
            noticePushData:notifyTypeList(),
            noticeVoiceData:EnumVoicesList.dataList
        };
    }

    componentDidMount() {
        getUserSettingCmd();
    }

    componentWillMount() {
        SettingStore.addEventListener(SETTING_EVENTS.USER, this.getAccountData);
    }

    componentWillUnmount() {
        SettingStore.removeEventListener(SETTING_EVENTS.USER, this.getAccountData);
    }

    open(){
        this.setState({show:true});
    }
    
    close(){
        this.setState({show:false});
    }

    getAccountData=()=>{
        var data = SettingStore.getUserSetting();
        let param = this.setDefaultParam(data);
        this.setState(_.extend(this.state,param));
    }

    updateUserSetting(setting,operation,loadingNode){
        let that = this;
        updateUserSettingCmd(setting).then((response)=>{
            that.updateCallback(operation,loadingNode,true);
        }).catch((error)=>{
            let account = that.state.accountInfo;
            that.setState(that.setDefaultParam(account));
            that.updateCallback(operation,loadingNode,false);
        });
    }

    setDefaultParam(account){
        let notifysound = account.browsermsgnotifysound;
        let msgnotifysound = (notifysound&&notifysound!=='xxx.mp3')?notifysound:'None';
        return {
            uid:account.uid,
            accountInfo:account,
            browsermsgnotifytype:account.browsermsgnotifytype+"",
            browsermsgnotifysound:msgnotifysound,
            emailnotify:account.emailnotify,
            highlightwords:account.highlightwords,
            markmsgreadtype:account.markmsgreadtype
        };
    }

    listenVoiceClick=(music)=>{
        soundPlayer(music);
    }

    onAttentInputChanged=(e)=>{
        this.setState({highlightwords:e.target.value,wordsLoading:LoadButtonStatus.HideLoad});
    }

    onMarkAsRadChecked=(e,val)=>{
        this.setState({markmsgreadtype:val,markAsReadLoading:LoadButtonStatus.HideLoad});
    }

    pushNoticeCallback=(data)=>{
        let setting = {browserMsgNotifyType:Number(data.id)};
        let loading = this.refs['pushNoticeLoading'];
        loading.load();
        this.setState({browsermsgnotifytype:data.id});
        this.updateUserSetting(_.extend(setting,{uid:this.state.uid}),ACCOUNT_NOTIFY_TYPE.Browsermsgnotifytype,loading);
    }

    usedVoiceCallback=(data)=>{
        let setting = {browserMsgNotifySound:data.id};
        let loading = this.refs['notifyVoiceLoading'];
        this.listenVoiceClick(data.id);
        loading.load();
        this.setState({browsermsgnotifysound:data.id});
        this.updateUserSetting(_.extend(setting,{uid:this.state.uid}),ACCOUNT_NOTIFY_TYPE.Browsermsgnotifysound,loading);
    }

    onPushEmaRadioChecked=(e,val)=>{
        let setting = {emailNotify:val};
        let loading = this.refs['sendEmailLoading'];
        loading.load();
        this.setState({emailnotify:val});
        this.updateUserSetting(_.extend(setting,{uid:this.state.uid}),ACCOUNT_NOTIFY_TYPE.Emailnotify,loading);
    }

    saveHightWords=(e)=>{
        let that = this;
        let setting = {highlightWords:that.state.highlightwords};
        that.setState({wordsLoading:LOADING_STATUS.Loading});
        setTimeout(()=>{
            that.updateUserSetting(_.extend(setting,{uid:that.state.uid}),ACCOUNT_NOTIFY_TYPE.Highlightwords,null);
        },1300);
        
    }

    saveAsReadClick=(e)=>{
        let that = this;
        let setting = {markMsgReadType:that.state.markmsgreadtype};
        that.setState({markAsReadLoading:LOADING_STATUS.Loading});
        setTimeout(()=>{
            that.updateUserSetting(_.extend(setting,{uid:that.state.uid}),ACCOUNT_NOTIFY_TYPE.Markmsgreadtype,null);
        },1300);
    }

    updateCallback=(propid,loading,result)=>{
        let that = this,locale = this.props.locale;
        switch(propid){
            case ACCOUNT_NOTIFY_TYPE.Browsermsgnotifytype: 
            case ACCOUNT_NOTIFY_TYPE.Browsermsgnotifysound: 
            case ACCOUNT_NOTIFY_TYPE.Emailnotify: {
                if (result){
                    loading.loaded();
                    loading.hideLoad();
                }
                else{
                    loading.quickHideLoad();
                }
                break;
            }
            case ACCOUNT_NOTIFY_TYPE.Highlightwords: {
                that.setState({wordsLoading:result?LoadButtonStatus.Loaded:LoadButtonStatus.hideLoad});
                break;
            }
            case ACCOUNT_NOTIFY_TYPE.Markmsgreadtype: {
                that.setState({markAsReadLoading:result?LoadButtonStatus.Loaded:LoadButtonStatus.hideLoad});
                break;
            }
        }

        if (!result){
            toast(locale.errorMsg);
        }
    }

    render(){
        var locale = this.props.locale;
        var showClass = this.state.show?'':'hidden';
        var noticePushData = this.state.noticePushData;
        var noticeVoiceData = this.state.noticeVoiceData;
        return (<div className={classnames("displayBox","notification",showClass)}>
                    <div className="notificationDesc noticeTipLabel">{locale.noticeTipLabel}</div>
                    <div className="sendNoticeLabel">{locale.noticePushLabel}</div>
                    <div className="pushNoticeCase">
                        <div className="pushNoticeLine pushNoticeOptions">
                            <div className="pushLabel">{locale.noticePushToMe}</div>
                            <div className="selectLine">
                                <Select className="notifyTypeSelect" showSearch={false} selectedDatasource={noticePushData.find(item => item.id === this.state.browsermsgnotifytype)} datasource={noticePushData} onSelectedDatasourceChange={this.pushNoticeCallback}/>
                            </div>
                            <SavedLoading ref="pushNoticeLoading" className="pushNoticeLoading"/>
                        </div>
                        <div className="pushNoticeLine second usedVoice">
                            <div className="usedVoiceLabel">{locale.noticeUsedVoice}</div>
                            <div className="selectLine">
                                <Select className="notifySoundSelect" showSearch={false} selectedDatasource={noticeVoiceData.find(item => item.id === this.state.browsermsgnotifysound)} datasource={noticeVoiceData} onSelectedDatasourceChange={this.usedVoiceCallback}/>
                            </div>
                            <SavedLoading ref="notifyVoiceLoading" className="notifyVoiceLoading"/>
                        </div>
                        <div className="listenVoice" onClick={e=>this.listenVoiceClick(this.state.browsermsgnotifysound)}>
                            <SaveButton className="green"><i className="ficon_volume_up"></i>{locale.noticeTryListen}</SaveButton>
                        </div>
                        <div className="clearFloat"></div>
                    </div>
                    <div className="sendNoticeLabel additionSetting">{locale.additionSetting}</div>
                    <ul className="addtionalSettings">
                        <AccountNotifyItem className="" label={locale.noticeEmailLabel} desc={locale.noticeEmailDesc}>
                            <div className="sendEmailNotify">
                                <div className="noticeEmailLine">
                                    <div className="sendEmailTome">{locale.noticeSendEmaToMe}<SavedLoading ref="sendEmailLoading" className="sendEmailLoading"/></div>
                                    <ul className="optionList">
                                        <li className={this.state.emailnotify===EMAILNOTIFY_TYPE.FifteenMinPush?'selected':''}>
                                            <div className="eim-radio" onClick={e=>this.onPushEmaRadioChecked(e,EMAILNOTIFY_TYPE.FifteenMinPush)}></div>{locale.notice15MinPush}
                                        </li><li className={this.state.emailnotify===EMAILNOTIFY_TYPE.OneHourPush?'selected':''}>
                                            <div className="eim-radio" onClick={e=>this.onPushEmaRadioChecked(e,EMAILNOTIFY_TYPE.OneHourPush)}></div>{locale.notice1HourPush}
                                        </li><li className={this.state.emailnotify===EMAILNOTIFY_TYPE.NotPush?'selected':''}>
                                            <div className="eim-radio" onClick={e=>this.onPushEmaRadioChecked(e,EMAILNOTIFY_TYPE.NotPush)}></div>{locale.noticeNotSend}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </AccountNotifyItem>
                        <AccountNotifyItem label={locale.attentionWordLabel} desc={locale.attentionWordDesc}>
                            <div className="messageSettingOptions">
                                <div className="inputBoxLine">
                                    <textarea className="remindWordSetting" onChange={this.onAttentInputChanged} defaultValue={this.state.highlightwords}/>
                                </div>
                                <div className="highLightWordsTxt">{locale.attentionPlaceholder}</div>
                                <div className="buttonBoxLine" onClick={this.saveHightWords}><SaveButton className="saveNotice green" loading={this.state.wordsLoading}>{this.state.wordsLoading===2?locale.noticeSaved:locale.noticeSave}</SaveButton></div>
                            </div>
                        </AccountNotifyItem>
                        <AccountNotifyItem label={locale.markAsRead} desc={locale.markAsReadDesc}>
                            <ul className="optionList markAsReadBox">
                                <li className={this.state.markmsgreadtype===MARK_MSG_READ_TYPE.ScrollToOldUnreadMsg?'selected':''}>
                                    <div className="eim-radio" onClick={e=>this.onMarkAsRadChecked(e,MARK_MSG_READ_TYPE.ScrollToOldUnreadMsg)}></div>{locale.markAsReadOption.option1}
                                </li><li className={this.state.markmsgreadtype===MARK_MSG_READ_TYPE.DoNotScrollToUnreadMsg?'selected':''}>
                                    <div className="eim-radio" onClick={e=>this.onMarkAsRadChecked(e,MARK_MSG_READ_TYPE.DoNotScrollToUnreadMsg)}></div>{locale.markAsReadOption.option2}
                                </li><li className={this.state.markmsgreadtype===MARK_MSG_READ_TYPE.DoNotScrToUnreadAndMarkMsg?'selected':''}>
                                    <div className="eim-radio" onClick={e=>this.onMarkAsRadChecked(e,MARK_MSG_READ_TYPE.DoNotScrToUnreadAndMarkMsg)}></div>{locale.markAsReadOption.option3}
                                </li>
                            </ul>
                            <div className="buttonBoxLine" onClick={this.saveAsReadClick}><SaveButton className="green" loading={this.state.markAsReadLoading}>{this.state.markAsReadLoading===2?locale.noticeSaved:locale.saveSetting}</SaveButton></div>
                        </AccountNotifyItem>
                    </ul>
                </div>);
    }
}
