import React from  'react';
import Overlay from 'react-bootstrap/lib/Overlay';
import Popover from 'react-bootstrap/lib/Popover';
import _ from 'underscore';
import LoginStore from '../../core/stores/LoginStore';
import DateSelect from './DateSelect';
import EnumSearchUserType from '../../core/enums/EnumSearchUserType';
import {SearchUserListSchema} from '../../core/schemas/SearchStoreSchemas';
import ReactPropTypes from '../../core/ReactPropTypes';
import gGlobalEventBus from '../../core/dispatcher/GlobalEventBus';
import {getTargetUidByChannelId} from '../../core/core-utils/ChannelUtils';
import TeamMembersStore from '../../core/stores/TeamMembersStore';

var itemIndex = -1;

function delHtmlTag(str){
        if(str){
            return str.replace(/<[^>]+>/g,"");
        }
        return "";
    }

function getRealName(sessionid){
    const member = TeamMembersStore.getTeamMemberByUid(getTargetUidByChannelId(sessionid));
    if(member){
        return member.firstname + member.lastname;
    }
    return "";
}

export default class FilterPanel extends React.Component{
    static propTypes = {
        filterSearchResult: ReactPropTypes.ofSchema(SearchUserListSchema)
    };
       
       
 //filterStep:0:条件选择 1:成员 2:微邮&会话 3:日期范围 4：customer动态生成过滤条件
 //也可不选择直接输入      
    constructor(props){        
		super(props);

        if(props.filterStep === 0){
            if (props.focusIndex > 2) {
                props.focusIndex = -1;                
            }
        }
                
		this.state ={filterStep:props.filterStep,
            focusIndex:props.focusIndex,
            show:false};
	}

    componentDidMount(){            
        gGlobalEventBus.addEventListener('onDoneFilterFocusIndex', this._onDoneFocusIndex);
    }

    componentWillUnmount(){
        gGlobalEventBus.removeEventListener('onDoneFilterFocusIndex', this._onDoneFocusIndex);
        if(this.onDocClickListener) {
                document.removeEventListener('click', this.onDocClickListener, false);
                this.onDocClickListener = null;
            }        
    }
    
    componentWillReceiveProps(props){
        this._handleOnShow(props.filterStep !== -1);
        
        let focusIndex = props.focusIndex;
        if(props.filterStep === 0){
            if (focusIndex > 2) {
                focusIndex = -1;                
            }
        }

        this.setState({filterStep:props.filterStep,
            focusIndex:focusIndex,
            show:props.filterStep !== -1});
    }    
    
    _onHover(e){
        var focus =  $(e.target).closest('li').attr('data-index');//e.target.getAttribute('data-index');
        if(focus){                        
            this.setState({focusIndex:-1});
            if(this.props.onUpdateFocusIndex){
                this.props.onUpdateFocusIndex(-1);   
            }
                    
        }
    }

    _onMouseLeave(){         
            this.setState({focusIndex:-1});
            if(this.props.onUpdateFocusIndex){
                this.props.onUpdateFocusIndex(-1);   
            }
    }

    _onDoneFocusIndex = (index) => {        
        if(this.state.filterStep === 0){
            this.setState({
                filterStep:index+1,
                focusIndex:-1
                });
            if(this.props.onUpdateFocusIndex){
                this.props.onUpdateFocusIndex(-1);   
            }
                    
            this.onFilterStepChanged(index+1);
        }
        else if(this.state.filterStep === 1
        || this.state.filterStep === 2){
            var item = document.getElementById("filter-item-"+index);
            var targetId =  item.getAttribute('data-targetid');
                    if(targetId){                         
                         var displayname = item.getAttribute('data-display');
                         var fd = {
                                    type:this.state.filterStep-1,
                                    id:targetId,
                                    content:displayname
                                };
                                    
                         this.onAddFilter(fd);
                    }      
        }
    }
    
    _onClick(e){
        switch (this.state.filterStep) {
            case 0:{
                let focus =  $(e.target).closest('li').attr('data-index');
                
                if(focus){
                    this.setState({filterStep:Number(focus)+1,
                        focusIndex:-1});

                    if(this.props.onUpdateFocusIndex){
                        this.props.onUpdateFocusIndex(-1);   
                    }
                    
                    this.onFilterStepChanged(Number(focus)+1);
                }
                break;
            } 
            case 1:{
                    let targetId =  $(e.target).closest('li').attr('data-targetid');//e.target.getAttribute('data-targetid');
                    if(targetId){
                         //var index =  $(e.target).closest('li').attr('data-index');//e.target.getAttribute('data-index');
                         let displayname = $(e.target).closest('li').attr('data-display');//e.target.getAttribute('data-display');
                         let fd = {
                                    type:0,
                                    id:targetId,
                                    content:displayname
                                };
                                    
                         this.onAddFilter(fd);
                    }                   
                    
                }
                break; 
            case 2:{
                let targetId =  $(e.target).closest('li').attr('data-targetid');//e.target.getAttribute('data-targetid');
                    if(targetId){
                         //var index =  $(e.target).closest('li').attr('data-index');//e.target.getAttribute('data-index');
                         let displayname = $(e.target).closest('li').attr('data-display');//e.target.getAttribute('data-display');
                          let fd = {
                            type:1,
                            id:targetId,
                            content:displayname
                        }
                        
                        this.onAddFilter(fd);
                    }               
            }
            break;
            case 3:{
                //
            }
            break;
                default:
                break;                     
        }         
    }

    onDateSelectDone(startDate, endDate){        
        var fd = {
            type:2,
            start:startDate,
            end:endDate
        }

        this.onAddFilter(fd);
    }
    
    onAddFilter(data){ 
        this.props.onAddFilter(data);        
    }

    onFilterStepChanged(step){
        if(this.props.onFilterStepChanged){
            this.props.onFilterStepChanged(step);
        }
    }

    onUpdateMaxIndex(maxIndex){
        if(this.props.onUpdateMaxIndex){
            //this.state.focusIndex = -1;
            this.props.onUpdateMaxIndex(maxIndex);
        }
    }
    
    getRecentContactsListItem(session){
        var focus = this.state.focusIndex;
        

        //fcj.todo: 这里是获取联系人，因此targetid不应当取sessionid，应当取出相应单聊联系人的uid
        var uids = session.sessionid.split('_');
        var toUID = _.without(uids, LoginStore.getUID());
        if(toUID.length < 1){   //自己已经展示，不再展示
            return null;
        }
        var touid = toUID[0];        
        itemIndex++; 

        return (<li className={"filter-item"+ (focus === itemIndex?" active":"")} data-index={itemIndex} id={"filter-item-"+itemIndex} data-targetid={touid} data-display={session.displayname}>
                            <i className="filter-item-icon member-icon disp-inblock"></i>
                            <span className="filter-item-name disp-inblock" data-index={itemIndex} data-targetid={touid} data-display={session.displayname}>{getRealName(session.sessionid)}</span>
                            <span className="filter-item-note disp-inblock" data-index={itemIndex} data-targetid={touid} data-display={session.displayname}>{'@'+ session.displayname}</span>
                        </li>);                                 
    }
    
    getRecentGroupSessionListItem(session){        
        var focus = this.state.focusIndex; 
        itemIndex++;       
        return (<li className={"filter-item"+ (focus === itemIndex?" active":"")} data-index={itemIndex} id={"filter-item-"+itemIndex} data-targetid={session.sessionid} data-display={session.displayname}>
                            <i className="filter-item-icon group-icon disp-inblock">#</i>
                            <span className="filter-item-name disp-inblock" data-index={itemIndex} data-targetid={session.sessionid} data-display={session.displayname}>{session.displayname}</span>                                         
                        </li>);                               
    }
    
    getRecentP2PSessionListItem(session){
        var focus = this.state.focusIndex;
        itemIndex++;
        return (<li className={"filter-item"+ (focus === itemIndex?" active":"")} data-index={itemIndex} id={"filter-item-"+itemIndex} data-targetid={session.sessionid} data-display={session.displayname}>
                            <i className="filter-item-icon member-icon disp-inblock"></i>
                            <span className="filter-item-name disp-inblock" data-index={itemIndex} data-targetid={session.sessionid} data-display={session.displayname}>{getRealName(session.sessionid)}</span>
                            <span className="filter-item-note disp-inblock" data-index={itemIndex} data-targetid={session.sessionid} data-display={session.displayname}>{'@'+session.displayname}</span>
                        </li>);   
    }
    

    getFilterSearchResultContactsListItem = (resultItem) => {
        var focus = this.state.focusIndex;
        itemIndex++;
        return (<li className={"filter-item"+ (focus === itemIndex?" active":"")} data-index={itemIndex} id={"filter-item-"+itemIndex} data-targetid={resultItem.id} data-display={delHtmlTag(resultItem.firstname+resultItem.lastname)}>
                            <i className="filter-item-icon member-icon disp-inblock"></i>
                            <span className="filter-item-name disp-inblock" data-index={itemIndex} data-targetid={resultItem.id} data-display={delHtmlTag(resultItem.firstname+resultItem.lastname)}><span dangerouslySetInnerHTML={{__html: resultItem.firstname+resultItem.lastname}}></span></span>
                            <span className="filter-item-note disp-inblock" data-index={itemIndex} data-targetid={resultItem.id} data-display={delHtmlTag(resultItem.firstname+resultItem.lastname)}><span>@</span><span dangerouslySetInnerHTML={{__html: resultItem.name}}></span></span>
                        </li>);                                 
    }

    getFilterSearchResultGroupSessionListItem = (resultItem) => {
        if (resultItem.userType === EnumSearchUserType.Channel) {
            var focus = this.state.focusIndex;
            itemIndex++;
            return (<li className={"filter-item"+ (focus === itemIndex?" active":"")} data-index={itemIndex} id={"filter-item-"+itemIndex} data-targetid={resultItem.id} data-display={delHtmlTag(resultItem.name)}>
                                <i className="filter-item-icon group-icon disp-inblock">#</i>
                                <span className="filter-item-name disp-inblock" data-index={itemIndex} data-targetid={resultItem.id} data-display={delHtmlTag(resultItem.name)} dangerouslySetInnerHTML={{__html: resultItem.name}}></span>                                
                            </li>);    
        }                                     
    }

    getFilterSearchResultSingleSessionListItem(uid, resultItem){
        if (resultItem.userType === EnumSearchUserType.User) {
            var focus = this.state.focusIndex;
            itemIndex++;

            let sessionid = resultItem.id < uid? resultItem.id+ '_' + uid: uid + '_' + resultItem.id;
            return (<li className={"filter-item"+ (focus === itemIndex?" active":"")} data-index={itemIndex} id={"filter-item-"+itemIndex} data-targetid={sessionid} data-display={delHtmlTag(resultItem.firstname+resultItem.lastname)}>
                                <i className="filter-item-icon member-icon disp-inblock"></i>
                                <span className="filter-item-name disp-inblock" data-index={itemIndex} data-targetid={sessionid} data-display={delHtmlTag(resultItem.firstname+resultItem.lastname)}><span dangerouslySetInnerHTML={{__html: resultItem.firstname+resultItem.lastname}}></span></span>
                                <span className="filter-item-note disp-inblock" data-index={itemIndex} data-targetid={sessionid} data-display={delHtmlTag(resultItem.firstname+resultItem.lastname)}><span>@</span><span dangerouslySetInnerHTML={{__html: resultItem.name}}></span></span>
                            </li>);    
        }                                     
    }

    _handleOnShow(show){
        if(show){
            if(this.onDocClickListener) {
                document.removeEventListener('click', this.onDocClickListener, false);
                this.onDocClickListener = null;
            }
            
            this.onDocClickListener = this.close.bind(this);
            document.addEventListener('click', this.onDocClickListener, false);
        }else{
            if(this.onDocClickListener) {
                document.removeEventListener('click', this.onDocClickListener, false);
                this.onDocClickListener = null;
            }
        }

    }

    toggle() {
        this._handleOnShow(!this.state.show);
        this.setState({ show: !this.state.show });

    }

    close(e) {        
        //避免日历操作触发关闭
        if($(e.target).attr("class") && $(e.target).attr("class").indexOf("rc-calendar-") !== -1){
            return;
        }        

        if(!$(e.target).closest('.filterPanelPopover').hasClass('filterPanelPopover')){
            //关闭时移除监听
            if(this.onDocClickListener) {
                document.removeEventListener('click', this.onDocClickListener, false);
                this.onDocClickListener = null;
            }

            this.onFilterStepChanged(-1);
            //this.setState({ show: false });
        }
    }
 
	render(){
        const {filterSearchResult, locale} = this.props;
        var focus = this.state.focusIndex;
        var pannelContent = null;
                
        if(this.state.filterStep === 0){
            if (focus > 2) {
                focus = -1;
                //this.state.focusIndex = -1;
            }
            this.onUpdateMaxIndex(2);

            itemIndex = -1;
            pannelContent = (
                <div>
                    <span className="pannel-title disp-block">{locale.addsearchfilter}</span>
                    <ul className="list-unstyled"  onMouseEnter={this._onHover.bind(this)} onMouseLeave={this._onMouseLeave.bind(this)} onClick={this._onClick.bind(this)}>
                        <li className={"filter-item"+ (focus === 0?" active":"")} data-index={++itemIndex} id={"filter-item-"+itemIndex} >
                            <i className="filter-item-icon member-icon disp-inblock"></i>
                            <span className="filter-item-name disp-inblock" data-index={itemIndex}>{locale.members}</span>
                            <span className="filter-item-note disp-inblock" data-index={itemIndex}>{locale.fromwhich}</span>
                            <i className="filter-add-icon disp-inblock"></i>
                        </li>
                        <li className={"filter-item"+ (focus === 1?" active":"")} data-index={++itemIndex} id={"filter-item-"+itemIndex}>
                            <i className="filter-item-icon range-icon disp-inblock"></i>
                            <span className="filter-item-name disp-inblock" data-index={itemIndex}>{locale.sessions}</span>
                            <span className="filter-item-note disp-inblock" data-index={itemIndex}>{locale.inwhich}</span>
                            <i className="filter-add-icon disp-inblock"></i>
                        </li>
                        <li className={"filter-item"+ (focus === 2?" active":"")} data-index={++itemIndex} id={"filter-item-"+itemIndex}>
                            <i className="filter-item-icon date-icon disp-inblock"></i>
                            <span className="filter-item-name disp-inblock" data-index={itemIndex}>{locale.date}</span>
                            <span className="filter-item-note disp-inblock" data-index={itemIndex}>{locale.datenote}</span>
                            <i className="filter-add-icon disp-inblock"></i>
                        </li>
                    </ul>
                </div>
            );
        }
        else if(this.state.filterStep === 1){
            if(filterSearchResult && filterSearchResult.size > 0){
                itemIndex = -1;
                let contactList = filterSearchResult;
                let itemList = contactList.map(this.getFilterSearchResultContactsListItem);
                
                this.onUpdateMaxIndex(filterSearchResult.size - 1);
                pannelContent = (
                    <div>
                        <span className="pannel-title disp-block">{locale.contacts}</span>
                        <ul className="list-unstyled"  onMouseEnter={this._onHover.bind(this)} onMouseLeave={this._onMouseLeave.bind(this)} onClick={this._onClick.bind(this)}>                           
                            {itemList}
                        </ul>
                    </div>
                );
            }
            else{                     
                let contactList = this.props.p2pSessionList;
                itemIndex = 0;
                let itemList = contactList.map(this.getRecentContactsListItem.bind(this));                

                this.onUpdateMaxIndex(itemList.length);
                pannelContent = (
                    <div>
                        <span className="pannel-title disp-block">{locale.latestcontacts}</span>
                        <ul className="list-unstyled"  onMouseEnter={this._onHover.bind(this)} onMouseLeave={this._onMouseLeave.bind(this)} onClick={this._onClick.bind(this)}>
                            <li className={"filter-item"+ (focus === 0?" active":"")} data-index={0}  id={"filter-item-0"} data-targetid={LoginStore.getUID()} data-display="me">
                                <i className="filter-item-icon member-icon disp-inblock"></i>
                                <span className="filter-item-name disp-inblock" data-index={0} data-targetid={LoginStore.getUID()} data-display="me">{locale.myself}</span>
                                <span className="filter-item-note disp-inblock"></span>
                            </li>
                            {itemList}
                        </ul>
                    </div>
                );
            }                        
        }
        else if(this.state.filterStep === 2){
        
            if(filterSearchResult && filterSearchResult.size > 0){
                //
                itemIndex = -1;
                let groupSessionList = filterSearchResult;
                let groupItemList = groupSessionList.map(this.getFilterSearchResultGroupSessionListItem);
                        
                let contactList = filterSearchResult;
                let uid = LoginStore.getUID();
                var itemList = contactList.map(this.getFilterSearchResultSingleSessionListItem.bind(this, uid));
                
                this.onUpdateMaxIndex(filterSearchResult.size - 1);

                pannelContent = (
                     <div>                   
                        <span className="pannel-title disp-block">{locale.groupchat}</span>
                        <ul className="list-unstyled"  onMouseEnter={this._onHover.bind(this)} onMouseLeave={this._onMouseLeave.bind(this)} onClick={this._onClick.bind(this)}>
                            {groupItemList}                    
                        </ul>
                        <span className="pannel-title disp-block">{locale.singlechat}</span>
                        <ul className="list-unstyled"  onMouseEnter={this._onHover.bind(this)} onMouseLeave={this._onMouseLeave.bind(this)} onClick={this._onClick.bind(this)}>
                            {itemList}
                        </ul>
                    </div>
                );
            }
            else{

                itemIndex = -1;
                let groupSessionList = this.props.groupSessionList;
                let groupItemList = groupSessionList.map(this.getRecentGroupSessionListItem.bind(this));
                            
                let p2pSessionList = this.props.p2pSessionList;
                var p2pItemList = p2pSessionList.map(this.getRecentP2PSessionListItem.bind(this));
                
                this.onUpdateMaxIndex(groupSessionList.length + p2pSessionList.length - 1);
                pannelContent = (
                    <div>                   
                        <span className="pannel-title disp-block">{locale.groupchat}</span>
                        <ul className="list-unstyled"  onMouseEnter={this._onHover.bind(this)} onMouseLeave={this._onMouseLeave.bind(this)} onClick={this._onClick.bind(this)}>
                            {groupItemList}                    
                        </ul>
                        <span className="pannel-title disp-block">{locale.singlechat}</span>
                        <ul className="list-unstyled"  onMouseEnter={this._onHover.bind(this)} onMouseLeave={this._onMouseLeave.bind(this)} onClick={this._onClick.bind(this)}>
                            {p2pItemList}
                        </ul>
                    </div>
                );
            }
            
        }
        else if(this.state.filterStep === 3){
            //日历            
            this.onUpdateMaxIndex(-1);
            pannelContent = (
                <DateSelect onDateSelectDone={this.onDateSelectDone.bind(this)} locale={this.props.locale.dateselect} />
            );
        }
        
        if (this.state.filterStep === -1) {
            //state = " hidden";
        }
        //className={"filter-panel"+state}
		return (
            <Overlay show={this.state.show} placement={this.props.placement}
                     onHide={() => this.setState({ show: false })}
                    target={() => this.props.target()} >
                <Popover id="filterPanelPopover" title={this.props.title} className="filterPanelPopover" >
                    {pannelContent}
                </Popover>
            </Overlay>
        );
    }
}

