import React from  'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';
import {createImmutableSchemaData} from '../../utils/schema';
import FilterPanel from './FilterPanel';
import * as searchMessageCommands from '../../core/commands/searchMessageCommands';
import {searchUserCmd} from '../../core/commands/searchUserCommands';
import ChannelsStore from '../../core/stores/ChannelsStore';
import SearchStore from '../../core/stores/SearchStore';
import {SearchUserListSchema} from '../../core/schemas/SearchStoreSchemas';
import EnumSearchUserType from '../../core/enums/EnumSearchUserType';
import EnumEventType from '../../core/enums/EnumEventType';
import EnumSessionType from '../../core/enums/EnumSessionType';
import InputContainer from './InputContainer';
import gGlobalEventBus, {GLOBAL_EVENTS} from '../../core/dispatcher/GlobalEventBus';

import './global-search-style.less';

let BACKSPACK_KEY_CODE = 8;
let ENTER_KEY_CODE = 13;
let UP_KEY_CODE = 38;
let DOWN_KEY_CODE = 40;

var max_Index = -1;
var searchIndex = 0;    //默认搜索最近
const EMPTY_SEARCH_RESULT = createImmutableSchemaData(SearchUserListSchema, []);

export default class SearchInputComposer extends React.Component{
       
    constructor(props){        
		super(props);
                
		this.state ={filterStep:-1,
            focusIndex:-1,
            filterSearchResult: EMPTY_SEARCH_RESULT,
            filterMap:{}};
	}        

    componentWillMount(){        
        SearchStore.addEventListener('userSearch', this.handleOnSearch);
        gGlobalEventBus.addEventListener('onSwitchSearch', this.switchSearch);
        gGlobalEventBus.addEventListener(GLOBAL_EVENTS.ON_VIEW_CHANNEL_ALL_FILES, this.viewChannelFiles);
    }

    componentWillUnmount(){
        SearchStore.removeEventListener('userSearch', this.handleOnSearch);
        gGlobalEventBus.removeEventListener('onSwitchSearch', this.switchSearch);
        gGlobalEventBus.removeEventListener(GLOBAL_EVENTS.ON_VIEW_CHANNEL_ALL_FILES, this.viewChannelFiles);
    }

    switchSearch = (index) => {        
        let searchKey = document.getElementById("searchInput").value.trim();
                if(searchKey !== ""){
                    searchIndex = index;
                    this.doResultSearch(searchKey);
                }
    }

    viewChannelFiles=({sessionid, displayname})=>{
        //过滤条件：只有所有会话
        const locale = this.props.locale;
        var filterText = locale.insession + displayname;
                               
        let dataSource = {key:1, name:filterText, id:sessionid};
        let tmpMap = {};      
        tmpMap[1] = dataSource;  
               
        this.setState({
            filterStep:-1,
            focusIndex:-1,
            filterMap:tmpMap
        });

        //立即搜索              
        this.doResultSearch("", tmpMap);
    }

    handleOnSearch = () => {
        const {filterStep} = this.state,
            searchResult = SearchStore.getSearchUserList();
        this.setState({
            focusIndex:-1,
            filterSearchResult: searchResult && searchResult.filter(item => {
                if (filterStep === 1) {
                    return item.userType === EnumSearchUserType.User;
                } else if (filterStep === 2) {
                    return true;
                } else {
                    return false;
                }
            }) || EMPTY_SEARCH_RESULT
        });
    }        
    
    _onBlur(e){
        return;        
    }

    refreshFilterStep(){
        let filterStep = -1;
        if(this.state.filterStep < 1){
            let searchKey = document.getElementById("searchInput").value.trim();
            if(searchKey === ""){
                if(_.size(this.state.filterMap)>0){
                    filterStep = 0;
                }
                else
                {
                    filterStep = 0;
                }
            }
            else{
                filterStep = -1;
            }    
                    
            this.setState({filterStep:filterStep});
        }
        else{
            let searchKey = document.getElementById("searchInput").value.trim();
            if(searchKey === ""){
                filterStep = 0;
            }
            this.setState({filterStep:filterStep});
        }
    }

    doResultSearch(searchKey, filterSource=null){
        //存在setState没有立即生效的情况，因此外部set之后立即搜索，应当带上filtermap数据
        const filterMap = filterSource ? filterSource:this.state.filterMap;
        var fromUid = [];
        if(filterMap
        && filterMap[0]){
            fromUid.push(filterMap[0].id);
        }

        var inId = [];
        if(filterMap
        && filterMap[1]){
            inId.push(filterMap[1].id);
        }

        var start = NaN;
        var end = NaN;
        if(filterMap
        && filterMap[2]){
            var range = filterMap[2];
            if(!Number.isNaN(range.start)){
                start = range.start;
            }
            if(!Number.isNaN(range.end)){
                end = range.end;
            }
        }
        
        let keyInfo = {
            timeRank: (searchIndex===0?true:false),
            key: searchKey,
            uids:fromUid,
            sessionIds: inId,
            startTime: start,
            endTime: end,
            startIndex:0,
            types:[EnumEventType.TextMsg, EnumEventType.FileMsg]
        };
        
        SearchStore.ResetMsgSearchKeyInfo(keyInfo, true);
        //清除搜索结果及索引
        gGlobalEventBus.emit('onClearSearch');
                 
        searchMessageCommands.searchMessages(keyInfo);
    }
    
    _onKeyDown(e){
        let focusIndex = -1;
        if(e.keyCode=== UP_KEY_CODE){
            if(this.state.focusIndex === -1
            || this.state.focusIndex === 0){
                //选中最后一项
                focusIndex = max_Index;                
            }
            else{
                if(this.state.focusIndex > max_Index){
                    focusIndex = max_Index;                 
                }
                else{
                    focusIndex = this.state.focusIndex - 1;
                }                
            }
            
            this.setState({focusIndex:focusIndex});
        }
        else if(e.keyCode === DOWN_KEY_CODE){
            if(this.state.focusIndex === -1
            || this.state.focusIndex === max_Index){
                focusIndex = 0;
            }
            else{
                if(this.state.focusIndex > max_Index){
                    focusIndex = 0;
                }
                else{
                    focusIndex = this.state.focusIndex + 1;
                }                
            }
            this.setState({focusIndex:focusIndex});
        }
        else if(e.keyCode === 107
        || (e.keyCode === 187 && e.shiftKey)){
            //fcj.todo: 弹出过滤条件选择，这里还需要做现有输入内容判断            
            this.setState({filterStep:0});
        }
        else if(e.keyCode >= 65  && e.keyCode <= 90
        || e.keyCode >= 96 && e.keyCode <=105){
            if(this.state.filterStep === 0){
                this.setState({filterStep:-1});
            }
            else if(this.state.filterStep === 1){
                //fcj.todo: 动态生成过滤条件
            }
            else if(this.state.filterStep === 2){
                //fcj.todo: 动态生成过滤条件
            }
        }
        else if(e.keyCode === ENTER_KEY_CODE){
            if(this.state.filterStep > -1
            && this.state.filterStep < 3
            && this.state.focusIndex > -1){                
                gGlobalEventBus.emit('onDoneFilterFocusIndex', this.state.focusIndex);
            }
            else{                
                let searchKey = document.getElementById("searchInput").value.trim();
                if(searchKey !== ""){
                    this.doResultSearch(searchKey);
                }
            }                        
        }
        else if(e.keyCode === BACKSPACK_KEY_CODE){
            let searchKey = document.getElementById("searchInput").value;
            if(searchKey === ""){
                //fcj.todo: remove latest filterItem

                let oldMap = this.state.filterMap;
                
                if(oldMap[2]){
                    oldMap[2] = null;
                }
                else if(oldMap[1]){
                    oldMap[1] = null;
                }
                else if(oldMap[0]){
                    oldMap[0] = null;
                }

                let dataSource = {};            
                _.map(oldMap, function(item){
                        if(item){
                            dataSource[item.key] = item;
                        }
                    });
                                
                this.setState({filterMap:dataSource});

                this.doResultSearch("");
            }
        }
    }
    
    onAddFilter(data){
        //fcj.todo:
        const locale = this.props.locale;
        if(data){
            if(data.type === 2){
                document.getElementById("searchInput").focus();
                document.getElementById("searchInput").value = '';                

                let dataSource = {key:2, start:data.start, end:data.end};     
                let tmpMap = this.state.filterMap;
                tmpMap[data.type] = dataSource;           
                this.setState({
                    filterStep:0,
                    focusIndex:-1,
                    filterMap:tmpMap
                });

                this.doResultSearch("", tmpMap);
            }
            else{
                var filterText = "";
                if(data.type === 0){
                    filterText = locale.fromuser + data.content;
                }
                else if(data.type === 1){
                    filterText =  locale.insession +data.content;
                }
                       
                document.getElementById("searchInput").focus();
                document.getElementById("searchInput").value = '';

                //fcj.todo: add filter dataSource
                let dataSource = {key:data.type, name:filterText, id:data.id};
                let tmpMap = this.state.filterMap;
                tmpMap[data.type] = dataSource;                    
                 this.setState({
                    filterStep:0,
                    focusIndex:-1,
                    filterMap:tmpMap
                });
                
                this.doResultSearch("", tmpMap);
            }

            //fcj.todo:需要延时???否则无效
            setTimeout(function() {            
                var div = document.getElementById("multiselect-container");//ReactDOM.findDOMNode(this.refs.messageList);
                div.scrollLeft = 999;
            }, 100); 
                
        }
    }

    onInputChanged(){
        //fcj.todo: 过滤成员或范围时，输入变化立即触发相应过滤条件搜索
        if(this.state.filterStep === 1){
            let searchKey = document.getElementById("searchInput").value.trim();
            if(searchKey !== ""){
                //fcj.todo：直接搜索
                searchUserCmd({keyword: searchKey, userTypes: [EnumSearchUserType.User]});
            }
            else{                
                this.setState({filterSearchResult: EMPTY_SEARCH_RESULT});
            }
        }
        else if(this.state.filterStep === 2){
            let searchKey = document.getElementById("searchInput").value.trim();
            if(searchKey !== ""){
                //fcj.todo：直接搜索
                searchUserCmd({keyword: searchKey, userTypes: []});
            }
            else{                
                this.setState({filterSearchResult: EMPTY_SEARCH_RESULT});
            }
        }
        else{
            this.refreshFilterStep();           
        } 
    }

    onInputFocus(){
        this.refreshFilterStep();
    }

    onInputBlur(){
        return;
    }

    onRemoveOption(item){
        let tmpMap = this.state.filterMap;
        tmpMap = _.without(tmpMap, item);

        let dataSource = {};
        //value清空了key没有去除，导致size和遍历时有误，这里手动校正一下
        _.map(tmpMap, function(item){
                if(item){
                    dataSource[item.key] = item;
                }
            });
                
        this.setState({filterMap:dataSource});

        var div = document.getElementById("multiselect-container");//ReactDOM.findDOMNode(this.refs.messageList);
            div.scrollLeft = 999;//div.scrollWidth;             
    }
    
    onFilterStepChanged(step){
        this.setState({filterSearchResult: EMPTY_SEARCH_RESULT,
            filterStep:step});
        document.getElementById("searchInput").focus();
    }

    onUpdateMaxIndex(maxIndex){
        max_Index = maxIndex;        
    }

    onUpdateFocusIndex(index){
        //fcj.todo:
        //this.state.focusIndex = index;
        this.setState({focusIndex:index});
    }

    getTatget(){
        return ReactDOM.findDOMNode(this.refs.target);
    }
 
	render(){
        const locale = this.props.locale;
        
        let immutableSessions =  ChannelsStore.getChannelDataList();
        let recentP2PSessionList = immutableSessions.filter(channelData => channelData.sessiontype === EnumSessionType.P2P);
        let recentGroupSessionList = immutableSessions.filter(channelData => channelData.sessiontype === EnumSessionType.Channel);
        
        var pannel = [];
        pannel.push(
                <FilterPanel id="global-search-view" placement="bottom" key="FilterPanel" filterStep={this.state.filterStep} focusIndex={this.state.focusIndex} onAddFilter={this.onAddFilter.bind(this)} p2pSessionList={recentP2PSessionList} groupSessionList={recentGroupSessionList}
                filterSearchResult = {this.state.filterSearchResult}
                onFilterStepChanged={this.onFilterStepChanged.bind(this)}
                target = {this.getTatget.bind(this)}
                onUpdateMaxIndex={this.onUpdateMaxIndex.bind(this)}
                onUpdateFocusIndex={this.onUpdateFocusIndex.bind(this)}
                locale={locale} />
            );
        
		return (
            <div className="search-input-composer" onBlur={this._onBlur.bind(this)}>
                    {pannel}
                   <InputContainer parent={this} placeholder={locale.search} ref="target"
                    dataSource = {this.state.filterMap}
                    onInputChanged={this.onInputChanged.bind(this)} 
                    onKeyDown={this._onKeyDown.bind(this)}
                    onInputFocus={this.onInputFocus.bind(this)} onInputBlur={this.onInputBlur.bind(this)}
                      inputtext={this.props.inputtext}
                      onRemoveOption={this.onRemoveOption.bind(this)}
                      locale={locale} />                    
            </div>
        );
    }
}

