import React from  'react';
import PureRenderComponent from '../../components/PureRenderComponent';
import SessionDetailView from '../filemanger/SessionDetailView';
import SessionFilesComposer from '../filemanger/SessionFilesView';
import AllFileDisplayView from '../filemanger/AllFileDisplayView';
import GlobalSearchView from '../search/GlobalSearchView';
import TeamDirectoryComposer from '../team-directory/TeamDirectoryComposer';
import ChannelsStore, {CHANNELS_EVENTS, SINGLE_CHANNEL_EVENTS} from '../../core/stores/ChannelsStore';
import LoginStore from '../../core/stores/LoginStore';
import UserEditorStore from '../../core/stores/UserEditorStore';
import MentionsListComposer from '../mentions/MentionsListComposer';
import FavouritesListComposer from '../favourites/FavouritesListComposer';
import UserGroupPanel from '../user-group-panel/UserGroupPanel';

import {QueryGroupInfoCommand} from '../../core/commands/channel/GroupInfoCommands';
import {SwitchRightPanelCmd} from '../../core/commands/RightPanelConfigCommands';
import QueryShareFilesCommand from '../../core/commands/channel/QueryShareFilesCommand';
import exposeLocale from '../../components/exposeLocale';
import SettingStore, {SETTING_EVENTS} from '../../core/stores/SettingStore';
import {UserProfileSchema} from '../../core/schemas/LoginSchemas';
import RightPanelConfigStore from '../../core/stores/RightPanelConfigStore';
import EnumRightPanelType from '../../core/enums/EnumRightPanelType';
import EnumSessionType from '../../core/enums/EnumSessionType';
import ReactPropTypes from '../../core/ReactPropTypes';
import exposeStoreData from '../view-components/exposeStoreData';
import exposePendingCmds from '../view-components/exposePendingCmds';

import './RightPanelComposer.less';

@exposeLocale(['DASHBOARD'])
@exposeStoreData([
    [RightPanelConfigStore, () => ({panelConfig: RightPanelConfigStore.getPanelConfig()})]
])
@exposePendingCmds([QueryGroupInfoCommand])
export default class RightPanelComposer extends PureRenderComponent {
    static propTypes = {
        userInfo: ReactPropTypes.ofSchema(UserProfileSchema).isRequired
    }


    constructor(props){
        super(props);
        //使用index表示当前页面 0-self,1-search,2-mentions,3-fav,4-file,5-group,6-sessiondetail
        this.state ={
            isCurrentUser: true,
            channelMemberUids:null,
            
            userInfo:LoginStore.getUserInfo(),
            showRealname:false
        };
    }

    componentWillMount(){
        this._initForCurrentChannel();
        this._updateChannelAndFilesData();
        ChannelsStore.addEventListener(CHANNELS_EVENTS.CURRENT_CHANNEL_CHANGE, this._initForCurrentChannel);
        SettingStore.addEventListener(SETTING_EVENTS.USER, this.updateUserData);
        SettingStore.addEventListener(SETTING_EVENTS.UPDATE_USER, this.updateUserData);

        ChannelsStore.addCurrentChannelListener(SINGLE_CHANNEL_EVENTS.CHANNEL_DATA_CHANGE, this._updateChannelAndFilesData);
        ChannelsStore.addCurrentChannelListener(SINGLE_CHANNEL_EVENTS.FILES_CHANGE, this._updateChannelAndFilesData);
        UserEditorStore.addEventListener('SETTING_ACCOUNT', this._onUserEditor);
    }

    componentWillUnmount(){
        if(this.onDocClickListener) {
                document.removeEventListener('click', this.onDocClickListener, false);
                this.onDocClickListener = null;
            }   

        ChannelsStore.removeEventListener(CHANNELS_EVENTS.CURRENT_CHANNEL_CHANGE, this._initForCurrentChannel);
        ChannelsStore.removeCurrentChannelListener(SINGLE_CHANNEL_EVENTS.CHANNEL_DATA_CHANGE, this._updateChannelAndFilesData);
        ChannelsStore.removeCurrentChannelListener(SINGLE_CHANNEL_EVENTS.FILES_CHANGE, this._updateChannelAndFilesData);
        UserEditorStore.removeEventListener('SETTING_ACCOUNT', this._onUserEditor);
        SettingStore.removeEventListener(SETTING_EVENTS.USER, this.updateUserData);
        SettingStore.removeEventListener(SETTING_EVENTS.UPDATE_USER, this.updateUserData);
    }

     close(e) {                        
        if(!$(e.target).closest('.right-panel-container').hasClass('right-panel-container')
        && !$(e.target).closest('.popover').hasClass('popover')
        && !$(e.target).closest('.dlg-fullscreen').hasClass('dlg-fullscreen')
        && !$(e.target).closest('.panel-loadmore').hasClass('panel-loadmore')
        && !$(e.target).closest('.modal-dialog').hasClass('modal-dialog')
        && !$(e.target).closest('.dialog-mask').hasClass('dialog-mask')
        && !$(e.target).closest('.popper').hasClass('popper')){
            this.onHidePanel();
        }
    }
 

    updateUserData = () => {
        var data = SettingStore.getUserSetting();
        this.setState({showRealname:(data.changeusernamepolicy===1)});
    }

    _initForCurrentChannel = () => {
        const {pendingCmds} = this.state,
            channel = ChannelsStore.getCurrent(),
            channelData = channel && channel.channelData;
        if (channelData && channelData.sessiontype !== EnumSessionType.P2P && !channelData.members && !pendingCmds.isPending(QueryGroupInfoCommand, channelData.sessionid)) {
            //频道成员信息没取
            QueryGroupInfoCommand(channelData.sessionid);
        }
        if (channel && !channel.files && !pendingCmds.isPending(QueryShareFilesCommand, channelData.sessionid)) {
            //频道或单聊文件信息没取
            QueryShareFilesCommand({channel, 'endtime':(new Date()).getTime()});
        }
    }

    _updateChannelAndFilesData = () => {
        const channel = ChannelsStore.getCurrent();
        if (channel) {
            const {channelData} = channel,
                newState = {};
            if (channelData.owner && channelData.members) {
                // jyf: TODO: channelData.owner 代表获取数据成功, 但这种方法应当废弃, 应当在views组件内做判断
                newState.channelMemberUids = channelData.members.map(member => member.uid);                
            }
            if (channel.files) {
                newState.fileDatasource = channel.files;
                newState.fileFullLoaded = channel.fileFullLoaded;
            }
            newState.currentChannelData = channelData;
            this.setState(newState);
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({state:nextProps.state,isCurrentUser:true});
    }

    componentDidUpdate(){        
        if(this.onDocClickListener) {
                document.removeEventListener('click', this.onDocClickListener, false);
                this.onDocClickListener = null;
        }

        if(this.state.panelConfig.panelType !== EnumRightPanelType.HIDE_PANEL){            
            this.onDocClickListener = this.close.bind(this);
            document.addEventListener('click', this.onDocClickListener, false);
        }        
    }

    _onUserEditor = () => {
        this.setState({userInfo:LoginStore.getUserInfo()});
    }

    dispose(){
    }

    onHidePanel = () => {
        this.onSwitchPanelByIndex(EnumRightPanelType.HIDE_PANEL);
    }

    onSwitchPanelByIndex=(index, subIndex = -1)=>{
        SwitchRightPanelCmd(index, {
            subIndex
        });
    }

    render(){
        const {locale, panelConfig} = this.state;

        var panelType = panelConfig.panelType;
        var panelContent = null;

        let searchResult = (
                <GlobalSearchView key="GlobalSearchView" show={panelType === EnumRightPanelType.SEARCH} onSwitchPanelByIndex={this.onSwitchPanelByIndex}
                locale={locale.globalsearch} onHidePanel={this.onHidePanel} />
            );        
        
        let fileDisplay = (
                <AllFileDisplayView key="AllFileDisplayView" show={panelType === EnumRightPanelType.FILE} onSwitchPanelByIndex={this.onSwitchPanelByIndex}
                locale={locale.globalsearch} onHidePanel={this.onHidePanel} />
            );

        if(panelType === EnumRightPanelType.MENTIONS){
            panelContent = (
                <MentionsListComposer key="MentionsList" onHidePanel={this.onHidePanel} />
            );
        }
        else if(panelType === EnumRightPanelType.FAVOR){
            panelContent = (
                <FavouritesListComposer key="FavouritesList" onHidePanel={this.onHidePanel} />
            );
        }
        else if(panelType === EnumRightPanelType.TEAM_DIRECTORY){
            panelContent = (
                <TeamDirectoryComposer key="teamDirectory"/>
            );
        }
        else if(panelType === EnumRightPanelType.SESSION_DETAIL){
            panelContent = (
                <SessionDetailView key="SessionDetailView"
                 sessionid={panelConfig.sessionid}
                 subIndex={panelConfig.subIndex != null ? panelConfig.subIndex : -1}
                 locale={locale.sessiondetail}/>
            );
        }
        else if (panelType === EnumRightPanelType.USER_GROUP) {
            panelContent = (
                <UserGroupPanel contactGroup={panelConfig.contactGroup}/>
            )
        }  
        else if (panelType === EnumRightPanelType.SESSION_FILE){
            panelContent = (
                <SessionFilesComposer key="SessionFilesView" 
                sessionid={panelConfig.sessionid}
                 onHidePanel={this.onHidePanel} locale={locale.sessiondetail}/>
            );
        }else {
            panelContent = (<div>ERROR</div>);
        }

        return (
            <aside id="right-panel-container" className={"right-panel-container " + (panelType===EnumRightPanelType.HIDE_PANEL ? 'hide-right-panel' : '')}>
                <div className="panel-content">
                    {searchResult}
                    {fileDisplay}
                    {panelContent}
                </div>
            </aside>

        );
    }
}

