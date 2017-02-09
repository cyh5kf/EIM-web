import React, {PropTypes} from  'react';
import _ from 'underscore';
import PureRenderComponent from '../../components/PureRenderComponent';
import Loading from '../../components/loading/Loading';
import MemberListView from './MemberListView';
import {ChannelSchema} from '../../core/schemas/ChannelSchemas';
import EnumLoginStatus from '../../core/enums/EnumLoginStatus';
import EnumSessionType from '../../core/enums/EnumSessionType';
import ReactPropTypes from '../../core/ReactPropTypes';
import {getTargetUidByChannelId} from '../../core/core-utils/ChannelUtils';
import TeamMembersStore from '../../core/stores/TeamMembersStore';
import PanelHeader from '../right-panel/PanelHeader';
import {SwitchRightPanelCmd} from '../../core/commands/RightPanelConfigCommands';
import EnumRightPanelType from '../../core/enums/EnumRightPanelType';
import exposeChannelData from '../view-components/exposeChannelData';
import InviteChannelMembersDialog from '../dialog/InviteChannelMembersDialog';
import StickSessionCmd from '../../core/commands/channel/StickSessionCmd';

@exposeChannelData({channelData: true})
export default class SessionDetailComposer extends PureRenderComponent {
    static propTypes = {
        sessionid: PropTypes.string.isRequired,
        subIndex: PropTypes.number,
        locale: ReactPropTypes.ofLocale(['DASHBOARD', 'sessiondetail']).isRequired
    }
    render() {
        const {channelData} = this.state;
        if (!channelData || (channelData.sessiontype === EnumSessionType.Channel && !channelData.members)) {
            return <Loading type="spinningBubbles" color="#e3e3e3"/>;
        } else {
            return <SessionDetailView {..._.pick(this.props, ['subIndex', 'locale'])}
                channelMembers={channelData.members} currentChannelData={channelData}/>;
        }
    }
}


class CheckBox extends PureRenderComponent{
    static propTypes = {        
        isChecked: ReactPropTypes.bool.isRequired        
    }

    render() {
        const {isChecked} = this.props;
        
        return (
            <div className="checkbox">
                <div className={`check-point ${isChecked?"eficon-21":"circle"}`}></div>
                <div className="check-hover eficon-19"></div>                
            </div>
        );
    }
}


class SessionDetailView extends React.Component{

    static propTypes = {
        subIndex: PropTypes.number,
        locale: ReactPropTypes.ofLocale(['DASHBOARD', 'sessiondetail']).isRequired,
        currentChannelData: ReactPropTypes.ofSchema(ChannelSchema).isRequired
    }

    constructor(props){
        super(props);

        this.state = {
            isExpand:{
                0:(props.subIndex === 0),
                1:(props.subIndex === 1),
                2:(props.subIndex === 2),
                3:(props.subIndex === 3),
                4:(props.subIndex === 4)
            }
        }
    }

     componentWillReceiveProps(nextProps) {
        let isExpand = this.state.isExpand;
        if(nextProps.subIndex >= 0){
            isExpand[nextProps.subIndex] = true;
            this.setState({isExpand:isExpand});
        }
       
    }

    _onExpandChanged(index){
        let isExpand = this.state.isExpand;
        isExpand[index] = !isExpand[index];
        this.setState({isExpand:isExpand});
    }

    onAddMember=()=>{
        InviteChannelMembersDialog.open(this.props.currentChannelData);
    }

    onSessionFiles=()=>{
        SwitchRightPanelCmd(EnumRightPanelType.SESSION_FILE, {sessionid:this.props.currentChannelData.sessionid});
    }  

    onCreateGroup=()=>{
        //fcj.todo:
    }

    onHidePanel = () => {
        SwitchRightPanelCmd(EnumRightPanelType.HIDE_PANEL);
    }

    onClickStick=()=>{
        const channelData = this.props.currentChannelData;
        StickSessionCmd({
            sessionid: channelData.sessionid,
            sessiontype: channelData.sessiontype,
            issticky: !channelData.issticky
        });
    }

    render(){
        const locale = this.props.locale;        

        let isExpand = this.state.isExpand;           

        let panelTitle = null;
        let aboutView = null;

        let addMem = null;
        let stickyTop = null;
        let starredView = null;
        let muteView = null;
        let membersView = null;
        let filesView = null;

        let {currentChannelData} = this.props;
        if(currentChannelData){

            stickyTop = (
                    <div className="view-content disp-block">
                        <div className="list-header" data-type="sticky" onClick={this.onClickStick}>
                            <i className="header-icon eficon-13"></i>
                            <span className="header-text black">{locale.stickytotop}</span>
                            <CheckBox isChecked={currentChannelData.issticky}/>
                        </div>                        
                    </div>
                 );
            starredView = (
                    <div className="view-content disp-block">
                        <div className="list-header" data-type="starred">
                            <i className="header-icon eficon-14"></i>
                            <span className="header-text black">{locale.starred}</span>  
                            <CheckBox isChecked={false}/>                          
                        </div>                        
                    </div>
                 );
            muteView = (
                    <div className="view-content disp-block">
                        <div className="list-header" data-type="mute">
                            <i className="header-icon eficon-15"></i>
                            <span className="header-text black">{locale.mutenotify}</span>     
                            <CheckBox isChecked={false}/>
                        </div>                        
                    </div>
                 );


            if(currentChannelData.sessiontype === EnumSessionType.P2P){
                addMem = (
                    <div className="view-content disp-block">
                        <div className="list-header" data-type="addmember" onClick={this.onCreateGroup}>
                            <i className="header-icon eficon-17"></i>
                            <span className="header-text black">{locale.addmember}</span>                            
                        </div>                        
                    </div>
                );
                
                let member = TeamMembersStore.getTeamMemberByUid(getTargetUidByChannelId(currentChannelData.sessionid));
                if(member){
                    //const online = member.signature === EnumLoginStatus.WebOnline;
                    //const formatTime = StringUtils.format(locale.timezoneValue,TimeZoneUtils.calcTime(Number(member.timezone)/60, 'HH:mm'));

                    aboutView = (
                    <div className="conversation-details disp-block">
                        <div className="member-info disp-flex">
                            <div className="disp-block avatar-container">                                
                                <div className="member-avatar" style={ member.avatar ? {backgroundImage: `url(${member.avatar})`} : {}}                                 ></div>
                            </div>
                            <div className="disp-flex info-container">
                                <div className="disp-block">
                                    <i className="disp-inblock status-indicator"/>
                                    <div className="disp-inblock name">{member.username}</div>
                                </div>
                                {/*
                                <div className="disp-block overflow-ellipsis">
                                    <span className="username mini">{'@'+member.username}</span>                                    
                                    <span className="time">{formatTime}</span>
                                </div>
                                */}
                                {(member.title && member.title !== "")&&<div className="member-title mini">{member.title}</div>}
                            </div>                            
                        </div>
                    </div>
                    );
                }                
            }
            else if(currentChannelData.sessiontype === EnumSessionType.Channel){
                aboutView = (
                    <div className="conversation-details disp-block">
                        <div className="member-info disp-flex">
                            <div className="disp-block avatar-container">                                
                                <div className="member-avatar"></div>
                            </div>
                            <div className="disp-flex info-container">
                                <div className="disp-block">                                    
                                    <div className="disp-inblock name">{currentChannelData.displayname}</div>
                                </div>                                
                            </div>                            
                        </div>
                    </div>
                    );
               
                const {currentChannelData: {members: channelMembers}} = this.props,
                    totalcount = channelMembers.size,
                    onlineCount = channelMembers.filter(member => member.loginstatus === EnumLoginStatus.WebOnline).size;
                 membersView = (
                    <div className="view-content members-view disp-block">
                        <div className="list-header" data-type="member" onClick={this._onExpandChanged.bind(this, 2)}>
                            <i className="header-icon eficon-17"></i>
                            <span className={"header-text" +(isExpand[2]?" black":"")}>{`${locale.members}(${onlineCount}/${totalcount})`}</span>
                            <span className={"icon icon-global-navbar-action-dropdowngray " + (isExpand[2]?"expand":"hold")} aria-hidden="true"></span>
                        </div>                        
                        <MemberListView displayState={isExpand[2]?'show':'hide'} members={channelMembers} onAddMember={this.onAddMember} channelData={currentChannelData} locale={locale}/>
                    </div>
                 );
                
            }

            filesView = (
                <div className="view-content files-view disp-block">
                    <div className="list-header" data-type="file" onClick={this.onSessionFiles}>
                        <i className="header-icon eficon-16"></i>
                        <span className="header-text black">{locale.sharefolder}</span>                        
                    </div>                   
                </div>
            );

            let titleNote = null;
             if(currentChannelData.sessiontype === EnumSessionType.P2P){
                    titleNote = locale.aboutsession;                                            
                }
                else{
                    titleNote = locale.abouttitle + "#"+currentChannelData.displayname;                   
                }

            panelTitle = (
                    <PanelHeader title={titleNote} onClickAction={this.onHidePanel} withBack={false} />
            );            
            
        }

        let mainContent = (
            <div className={"session-detail-content scroll-y-content"}>
                        {aboutView}
                        {addMem}
                        {stickyTop}
                        {starredView}
                        {muteView}                                            
                        {filesView}
                        {membersView}                                                
                    </div>
        );                 

        return (
            <div className="max-panel-view inner-content session-detail">
                {panelTitle}
                <div className="panel-entity">
                    {mainContent}                    
                </div>
            </div>
        );
    }
}

