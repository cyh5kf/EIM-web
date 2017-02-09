import React from 'react';
import ReactDOM from 'react-dom';
import Overlay from 'react-bootstrap/lib/Overlay';
import Popover from 'react-bootstrap/lib/Popover';
import exposeLocale from '../../components/exposeLocale';
//import ReactPropTypes from '../../core/ReactPropTypes';
import SearchInputComposer from '../search/SearchInputComposer';
import GlobalEventBus, {GLOBAL_EVENTS} from '../../core/dispatcher/GlobalEventBus';
//import EnumLoginStatus from '../../core/enums/EnumLoginStatus';
//import OnlineStatusIndicator from '../view-components/online-status-indicator/OnlineStatusIndicator';
import {SwitchRightPanelCmd} from '../../core/commands/RightPanelConfigCommands';
import RightPanelConfigStore from '../../core/stores/RightPanelConfigStore';
import exposeStoreData from '../view-components/exposeStoreData';
import './headerbar.less';

import EnumRightPanelType from '../../core/enums/EnumRightPanelType';
import AccountComposer from './AccountComposer';
import NotificationComposer from './Notification';
const TooltipType = {
    Hide: 0, // 不展示
    Mentions:1,
    Fav:2,
    File:3
};

@exposeLocale(['DASHBOARD'])
@exposeStoreData([    
    [RightPanelConfigStore, () => ({panelConfig: RightPanelConfigStore.getPanelConfig()})]
])
export default class HeaderBar extends React.Component {
    static propTypes = {
    }
    
    constructor(props) {
        super(props);
        this.state={
            tooltipType:TooltipType.Hide
        };
    }

    onHeaderAction=(e)=>{
        let panelType = parseInt(e.target.getAttribute('data-index'));        
        if(panelType === this.state.panelConfig.panelType){            
            SwitchRightPanelCmd(EnumRightPanelType.HIDE_PANEL);
        }
        else{
            if(panelType !== EnumRightPanelType.FILE){
                SwitchRightPanelCmd(panelType);
            }
            else{
                GlobalEventBus.emit(GLOBAL_EVENTS.ON_SHOW_FILE_FILTER, '');
            }
        }
    }

    getTooltipTarget=()=>{
        const type = this.state.tooltipType;
        switch (type){
            case TooltipType.Mentions:
                return ReactDOM.findDOMNode(this.refs.mentions); 
            case TooltipType.Fav:
                return ReactDOM.findDOMNode(this.refs.fav);
            case TooltipType.File:
                return ReactDOM.findDOMNode(this.refs.file);
            default:
                return null;
        }        
    }

    getTooltipText=()=>{
        // totalcount = channelMembers.size,
                 //   onlineCount = channelMembers.filter(member => member.signature === EnumLoginStatus.WebOnline).size;
        const type = this.state.tooltipType;
        const locale = this.state.locale;        
        switch (type){           
            case TooltipType.Mentions:
                return locale.mentions; 
            case TooltipType.Fav:
                return locale.fav; 
            case TooltipType.File:
                return locale.file; 
            default:
                return "";
        }    
    }


    render() {
        //const locale = this.state.locale;        
        const panelType = this.state.panelConfig.panelType;        

        const tooltipType = this.state.tooltipType;                

        let  toolTip = null;
        if(tooltipType !== TooltipType.Hide){
            toolTip = (
                <Overlay show={tooltipType !== TooltipType.Hide} placement='bottom' target={this.getTooltipTarget}>
                    <Popover id="tooltip-common">{this.getTooltipText()}</Popover>
                </Overlay>
            );
        }    

        return (
            <div className="header-bar">
                <div className="pull-left">
                    <AccountComposer/>
                    <NotificationComposer/>
                </div>
                <div className="pull-right icon-box">                                                                               
                    <SearchInputComposer locale={this.state.locale.globalsearch.searchinput} />
                    <span className={"icon-container"+(panelType===EnumRightPanelType.MENTIONS?" active":"")} ref="mentions"
                        onMouseOver={(e)=> {if(tooltipType !== TooltipType.Mentions){this.setState({tooltipType:TooltipType.Mentions})}}} onMouseLeave={(e)=>this.setState({tooltipType:TooltipType.Hide})}>
                        <i className="conversaton-opt btn-at eficon-header-button-action-at" aria-hidden="true" data-index={EnumRightPanelType.MENTIONS} onClick={this.onHeaderAction}></i>
                    </span>                    
                    <span className={"icon-container"+(panelType===EnumRightPanelType.FAVOR?" active":"")} ref="fav"
                        onMouseOver={(e)=> {if(tooltipType !== TooltipType.Fav){this.setState({tooltipType:TooltipType.Fav})}}} onMouseLeave={(e)=>this.setState({tooltipType:TooltipType.Hide})}>
                        <i className="conversaton-opt btn-fav eficon-header-button-action-collect"  ref="target" aria-hidden="true" data-index={EnumRightPanelType.FAVOR} onClick={this.onHeaderAction}></i>
                    </span>
                    <span className={"icon-container"+(panelType===EnumRightPanelType.FILE?" active":"")} ref="file"
                        onMouseOver={(e)=> {if(tooltipType !== TooltipType.File){this.setState({tooltipType:TooltipType.File})}}} onMouseLeave={(e)=>this.setState({tooltipType:TooltipType.Hide})}>
                        <i className="conversaton-opt btn-files eficon-header-button-action-files"  ref="target" aria-hidden="true" data-index={EnumRightPanelType.FILE} onClick={this.onHeaderAction}></i>
                    </span>  
                </div>
                {toolTip}                
            </div>
        );
    }
}
