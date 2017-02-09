import React from 'react';
import Search from './Search';
import MarkAnRead from './MarkAnRead';
import MessageMedia from './MessageMedia';
import Notification from './Notification';
import SideBarTheme from './SideBarTheme';
import AdvancedOption from './AdvancedOption';
import StringUtils from '../../../utils/StringUtils';
import LoginStore from '../../../core/stores/LoginStore';
import exposeLocale from '../../../components/exposeLocale';
import {createImmutableSchemaData} from '../../../utils/schema';
import {UserInfoSchema} from '../../../core/schemas/SettingSchemas';
import FullScreenDialog from '../../../components/dialog/FullScreenDialog';
import SettingStore, {SETTING_EVENTS} from '../../../core/stores/SettingStore';
import {getUserSettingCmd, updateUserSettingCmd} from '../../../core/commands/SettingCommands';
import "./preference-style.less";

@exposeLocale(['DIALOGS','dlg-preference'])
export default class PreferenceDialog extends FullScreenDialog{

    constructor(){
        super(...arguments);
        this.state = {show:true,_index:1,userSetting:createImmutableSchemaData(UserInfoSchema, null)};
    }

    componentDidMount(){
        getUserSettingCmd();
    }

    componentWillMount() {
        super.componentWillMount();
        SettingStore.addEventListener(SETTING_EVENTS.USER, this.getUserInfoData);
        SettingStore.addEventListener(SETTING_EVENTS.UPDATE_USER, this.getUserInfoData);
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        SettingStore.removeEventListener(SETTING_EVENTS.USER, this.getUserInfoData);
        SettingStore.removeEventListener(SETTING_EVENTS.UPDATE_USER, this.getUserInfoData);
    }
    
    open(){
        this.setState({show:true});
    }

    close(){
        this.setState({show:false});
    }

    switchDisplayBox=(index)=>{
        this.setState({_index:index});
    }

    getUserInfoData=()=>{
        var data = SettingStore.getUserSetting();
        this.setState({userSetting:data});
    }

    updateUserSetting=(setting,operation,loadingNode,updatedCallback)=>{
        let that = this;
        updateUserSettingCmd(setting).then((response)=>{
            updatedCallback(operation,loadingNode,true);
        }).catch((error)=>{
            let account = SettingStore.getUserSetting();
            that.setState({userSetting:account});
            updatedCallback(operation,loadingNode,false);
        });
    }

    fixTimeZone(){
        this.props.fixTimeZone();
        this.close();
    }
    

    renderContent(){
        let locale = this.state.locale;
        let _index = this.state._index;
        let userSetting = this.state.userSetting;
        let companyName = LoginStore.getCompanyName();
        let title = StringUtils.format(locale.title,companyName);
        return ([<div key="header" className="header">
                    {title}
                </div>,
                <div key="contextBox" className="contextBox">
                    <div className="left_side">
                        <ul className="menu">
                            <li className={_index===1?'selected':''} data-index="1" onClick={e=>this.switchDisplayBox(1)}><div>{locale.leftNotification}</div>
                            </li><li className={_index===2?'selected':''} data-index="2" onClick={e=>this.switchDisplayBox(2)}><div>{locale.leftHintAndContact}</div>
                            </li><li className="hidden" data-index="3" onClick={e=>this.switchDisplayBox(3)}><div>{locale.leftSideBarTheme}</div>
                            </li><li className="hidden" data-index="4" onClick={e=>this.switchDisplayBox(4)}><div>{locale.leftSearch}</div>
                            </li><li className={_index===5?'selected':''} data-index="5" onClick={e=>this.switchDisplayBox(5)}><div>{locale.leftReadStatus}</div>
                            </li><li className={_index===6?'selected':''} data-index="6" onClick={e=>this.switchDisplayBox(6)}><div>{locale.leftSeniorOption}</div>
                            </li>
                        </ul>
                    </div>
                    <div className="right_side">
                        <div className="rightPanel">
                            {_index===1&&userSetting&&<Notification locale={locale} parent={this} userSetting={userSetting}/>}
                            {_index===2&&userSetting&&<MessageMedia locale={locale} parent={this} userSetting={userSetting}/>}
                            {_index===3&&userSetting&&<SideBarTheme locale={locale} parent={this} markmsgreadtype={userSetting.markmsgreadtype}/>}
                            {_index===4&&userSetting&&<Search locale={locale} parent={this} userSetting={userSetting}/>}
                            {_index===5&&userSetting&&<MarkAnRead locale={locale} parent={this} uid={userSetting.uid} markmsgreadtype={userSetting.markmsgreadtype}/>}
                            {_index===6&&userSetting&&<AdvancedOption locale={locale} parent={this} userSetting={userSetting}/>}
                        </div>
                    </div>
                </div>]);
    }
}

