import React from 'react';
import _ from 'underscore';
import {Link} from 'react-router';
import moment from 'moment';
import StringUtils from '../../../utils/StringUtils';
import classnames from '../../../utils/ClassNameUtils';
import TimeZoneUtils from '../../../utils/TimeZoneUtils';
import PaginationUtils from '../../../utils/PaginationUtils';
import {LOGON_RECORD_PAGE,LOG_TYPE} from '../../../core/enums/EnumSetting';
import SettingStore,{SETTING_EVENTS } from '../../../core/stores/SettingStore';
import {getTeamSettingLogsCmd} from '../../../core/commands/SettingCommands';

export default class LogonRecord extends React.Component{

    constructor(props){
        super(props);
        this.state = {show:true,LogonRecord:[],total:LOGON_RECORD_PAGE.Total
            ,totalpage:LOGON_RECORD_PAGE.Totalpage
            ,pagenum:LOGON_RECORD_PAGE.CurrentPage
            ,pagesize:LOGON_RECORD_PAGE.Pagesize};
    }

    componentDidMount(){
        this.requestData(this.state.pagenum);
    }

    componentWillMount() {
        SettingStore.addEventListener(SETTING_EVENTS.UPDATE_LOG, this.getLogonLogData);
    }
    componentWillUnmount() {
        SettingStore.removeEventListener(SETTING_EVENTS.UPDATE_LOG, this.getLogonLogData);
    }

    getLogonLogData=()=>{
        var data = SettingStore.getTeamSettingLog();
        var total = parseInt(data.pageable.total);
        var pagesize = this.state.pagesize;
        var totalpage = Math.ceil(total/pagesize);
        this.setState({LogonRecord:data.items,total:total,totalpage:totalpage});
    }
    
    open(){
        this.setState({show:true});
    }
    
    close(){
        this.setState({show:false,LogonRecord:[],pagenum:1});
    }

    getDeviceObject(){
        var deviceType = {};
        var locale = this.props.locale;
        deviceType["0"]=locale.logonWeb,
        deviceType["1"]=locale.logonAndroid,
        deviceType["2"]=locale.logonIos;
        return deviceType;
    }

    requestData(pagenum){
        getTeamSettingLogsCmd(LOG_TYPE.Personal, pagenum, this.state.pagesize);
    }

    chargeLogonLogData(){
        var dataList = {};
        var data = this.state.LogonRecord;
        if (data&&data.length>0){
            _.each(data,function(val,i){
                var stadardDate = TimeZoneUtils.formatToTimeLine(val.time);
                val.formatTime = moment(Number(val.time)).format("HH:mma");
                if(dataList[stadardDate]){
                    dataList[stadardDate].push(val);
                }
                else{
                    dataList[stadardDate]=[val];
                }
            });
        }
        return dataList;
    }

    renderRecord(locale){
        var device = this.getDeviceObject();
        var data = this.chargeLogonLogData();
        var content = _.map(data,function(log,key) {
            var logonRecordList = _.map(log,function(val,i){
                var logonInfoLabel = StringUtils.format(locale.logonInfoLabel,val.ip);
                return (<li className="logonLine" key={"logonTime_"+i}>
                            <div className="logonLineTxt">{val.formatTime}{locale.logonLineLabel}<span className="accessPlatform"><i className="ficon_laptop"></i>{device[val.clienttype]}</span></div>
                            <div className="logonLineDesc">{logonInfoLabel}</div>
                        </li>);
            });
            return (<div key={"logonDate_"+key} className="logonRecordLine">
                        <div className="logonDate">{key}</div>
                        <ul className="logonList">
                            {logonRecordList}
                        </ul>
                    </div>);
        });
        return content;
    }
    
    
    prevPageClick(){
        var pagenum = this.state.pagenum;
        if (pagenum>1){
            --pagenum;
            this.setState({pagenum:pagenum});
            this.requestData(pagenum);
        }
    }

    nextPageClick(){
        var pagenum = this.state.pagenum;
        var totalPage = this.state.totalpage;
        if (pagenum<totalPage){
            ++pagenum;
            this.setState({pagenum:pagenum});
            this.requestData(pagenum);
        }
    }

    currentPageClick(pagenum,isCurrent){
        if (!isCurrent&&!isNaN(pagenum)){
            pagenum = parseInt(pagenum);
            this.setState({pagenum:pagenum});
            this.requestData(pagenum);
        }
    }

    splitPageBar(){
        var pageArr = [];
        var pagenum = this.state.pagenum;
        var pagination = PaginationUtils.getPagination(this.state);
        var pageGroup = pagination.pagegroup;
        if (pageGroup&&pageGroup.length>0){
            _.each(pageGroup,(val,i)=>{
                var isCurrent = Number(val)===pagenum;
                var selectClass = isCurrent?'currentPage':'';
                pageArr.push(<li key={"logPage_"+i} onClick={e=>this.currentPageClick(val,isCurrent)} className={`ceil ${selectClass}`}>{val}</li>);
            });
        }
        return pageArr;
    }
    

    openSettingPanel(){
        this.props.parent.openLogoutAccount(2);
    }

    render(){
        var locale = this.props.locale;
        var pagenum = this.state.pagenum;
        var showClass = this.state.show?'':'hidden';
        var renderContent = this.renderRecord(locale);
        var prevClass = pagenum<=1?'pageDisabled':'';
        var nextClass = pagenum>=this.state.totalpage?'pageDisabled':'';
        return (<div className={classnames("displayBox","logonRecord",showClass)}>
                <div className="headerLabel">
                    <div className="logonRecordLabel">
                        <span>{locale.logonRecordDesc1}</span><Link className="link" to="/settings/manage-account/signout">{locale.exitLogonLabel}</Link><span>{locale.logonRecordDesc2}</span>
                    </div>
                </div>
                <div className="logonContent">
                    <div className="logonRecordList">{renderContent}</div>
                </div>
                {this.state.totalpage>1&&<div className="splitPageLine">
                    <ul className="splitPage">
                        <li onClick={this.prevPageClick.bind(this)} className={"prev " + prevClass}>{locale.prevLabel}</li>
                        {this.splitPageBar()}
                        <li onClick={this.nextPageClick.bind(this)} className={"next " + nextClass}>{locale.nextLabel}</li>
                    </ul>
                </div>}
            </div>);
    }
}


