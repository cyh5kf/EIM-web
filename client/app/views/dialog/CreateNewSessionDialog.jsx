import React from 'react';
import {findDOMNode} from 'react-dom';
import Dialog from '../../components/dialog/Dialog';
import exposeLocale from '../../components/exposeLocale';
import UsersSelector from '../view-components/users-selector/UsersSelector';

import PublishP2PCmd from '../../core/commands/channel/PublishP2PCmd';
import EnumSessionType from '../../core/enums/EnumSessionType';
import EnumSearchUserType from '../../core/enums/EnumSearchUserType';
import ReactPropTypes from '../../core/ReactPropTypes';
import StringUtils from '../../utils/StringUtils';
import {getChannelIdByUserId} from '../../core/core-utils/ChannelUtils';
import ChannelsStore from '../../core/stores/ChannelsStore';
import _ from 'underscore';
import  './CreateNewSessionDialog.less';

class CustomUsersSelector extends UsersSelector {
    static propTypes = {
        ...UsersSelector.propTypes,
        onSearch: ReactPropTypes.func.isRequired,
        locale: ReactPropTypes.ofLocale().isRequired
    };
    constructor() {
        super(...arguments);
        const __handleSearch = this.handleSearch;
        this.handleSearch = searchText => {
            __handleSearch(searchText);
            this.props.onSearch(searchText);
        };
    }

    getLasttime=(lasttime)=>{
        const locale = this.props.locale.COMMON;
        let lasttimeString = "";
        if(lasttime === 0){
            return lasttimeString;
        }
        let now = new Date().getTime();
        let long = now - lasttime;
        const hours = Math.round(long/(1000*60*60));
        if(hours < 1){
            //1小时内
            lasttimeString = locale.justnow;
        }
        else if(hours >= 1 && hours < 24){
            //数小时前            
            lasttimeString =  StringUtils.format(locale.hoursago, hours); 
        }
        else{
            const days = Math.round(hours/24);
            if(days < 30){
                //数天前
                lasttimeString =  StringUtils.format(locale.daysago, days); 
            }
            else{
                const months = Math.round(days/30);
                lasttimeString =  StringUtils.format(locale.monthsago, months); 
            }
        }
        
        return lasttimeString;
    }

    renderOptionInfo = (data) => {
        const {userType = this.props.userTypes[0]} = data;
        if (userType === EnumSearchUserType.User) {
            return [
                <div key="user-info" className="user-info">
                    <b className="user-name">{data.name}</b>
                    <span className="user-realname">{data.firstname || ''}{data.lastname || ''}</span>
                </div>,
                <span key="last-time" className="last-active-time">{this.getLasttime(data.lasttime)}</span>
            ];

        } else {
            return <div className="group-chat-name"># {data.name}</div>
        }
    }
}

@exposeLocale()
export default class CreateNewSessionDialog extends Dialog {
    static defaultProps = {
        ...Dialog.defaultProps,
        name : 'dlg-createNewSession'
    };

    onSelectedUserChange = (users) => {
        const lastUser = _.last(users);
        this.setState({
            selectedUsers: lastUser ? [lastUser] : []
        });
    }

    fixResultData=(users)=>{
        //已经按名字排好序，但是要改为首选按时间排序
        users.reverse();
        _.each(users, function(user){
            user.lasttime = 0;
            let channel = ChannelsStore.getChannel(getChannelIdByUserId(user.id));
            if(channel && channel.messages && channel.messages.size > 0){
                user.lasttime = parseInt(channel.messages.last().msgsrvtime);
            }
        });
                
        return _.sortBy(users, 'lasttime').reverse();
    }

    _onNewSession = () => {
        let data = this.state.selectedUsers[0];
        if(!data){
            return;
        }
        PublishP2PCmd(data.id);
        this.close();
    }

    onShow() {
        this.setState({selectedUsers: []});
    }

    _handleSearch = searchText => this.setState({searchText});
    _getPopupContainer = () => findDOMNode(this.refs['popup-container']);

    renderHeader(){
        let {locale} = this.state;
        return <div className={this.props.hiddenHeader?"header hidden":"header"}>
            <div className="eim-deprecated btn_close" onClick={this.close.bind(this)}></div>
            <div className="title">{locale.CHANNEL_TYPE[EnumSessionType.P2P]}</div>
        </div>;
    }

    renderContent(){
        let {locale, selectedUsers} = this.state;
        return [
            <div key="toolbar" className="search-toolbar">
                <CustomUsersSelector selectedUser={selectedUsers} onSelectedUserChange={this.onSelectedUserChange}
                                     filterResultsDatasource={this.fixResultData}
                                     alwaysShowPopup
                                     onSearch={this._handleSearch}
                                     placeholder={locale.DIALOGS['dlg-newSession']['searchtitle']}
                                     getPopupContainer={this._getPopupContainer} locale={locale}/>
                <div className="search-icon"></div>
                <button className={`submit-btn ${selectedUsers.length ? 'button-green' : 'hidden'}`} onClick={this._onNewSession}>{locale.DIALOGS['dlg-newSession'].btnSubmit}</button>
            </div>,
            <div key="pop" ref="popup-container" className="popup-container"></div>
        ];
    }

    renderFooter() {
        return null;
    }
}
