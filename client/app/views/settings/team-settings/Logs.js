import React from 'react';
import _ from 'underscore';
import moment from 'moment';
import classnames from '../../../utils/ClassNameUtils';
//import StringUtils from '../../../utils/StringUtils';
import TimeZoneUtils from '../../../utils/TimeZoneUtils';
import PaginationUtils from '../../../utils/PaginationUtils';
import PureRenderComponent from '../../../components/PureRenderComponent';
import SettingStore from '../../../core/stores/SettingStore';
import { SETTING_EVENTS } from '../../../core/stores/SettingStore';
import { getTeamSettingLogsCmd } from '../../../core/commands/SettingCommands';
import { LogonLogSchema } from '../../../core/schemas/SettingSchemas';
import ReactPropTypes from '../../../core/ReactPropTypes';
//import AccountActionCreators from '../../../core/actions/AccountActionCreators';

const TOTAL_INIT = 0,
      TOTAL_PAGE_INIT = 0,
      PAGE_NUM_INIT = 1,
      PAGE_SIZE = 100,
      LOG_TYPE = 2;

export default class LogsView extends React.Component{

    static propTypes = {
        logData: ReactPropTypes.ofSchema(LogonLogSchema).isRequired
    }

    constructor (props) {
        super(props);
        this.state = {show: true, pagenum: PAGE_NUM_INIT, pagesize: PAGE_SIZE};
        this.LogonRecord = [];
        this.total = TOTAL_INIT;
        this.totalpage = TOTAL_PAGE_INIT;
    }

    componentDidMount () {
        this.requestData(this.state.pagenum);
    }

    requestData (pagenum) {
        //AccountActionCreators.getLogonLogList(2, pagenum,
        //    this.state.pagesize, this.getLogonLogData.bind(this));
        getTeamSettingLogsCmd(LOG_TYPE, pagenum, this.state.pagesize);
    }

    getLogonLogData (data) {
        var a = _.map(data, (k, i) => (k) )
        if (a.length === 0) {
            return;
        }
        var total = parseInt(data.pageable.total);
        var pagesize = this.state.pagesize;
        var totalpage = Math.ceil(total / pagesize);
        //this.setState({LogonRecord: data.items, total: total, totalpage: totalpage});
        this.LogonRecord = data.items;

        this.total = total;
        this.totalpage = totalpage;
    }

    getDeviceObject () {
        var deviceType = {};
        var locale = this.props.locale;
        deviceType["0"] = locale.logonWeb;
        deviceType["1"] = locale.logonAndroid;
        deviceType["2"] = locale.logonIos;
        return deviceType;
    }

    chargeLogonLogData () {
        var dataList = {};
        var data = this.LogonRecord;
        if (data&&data.size>0){
            data.map(function(val){
                var stadardDate = TimeZoneUtils.formatToTimeLine(val.time);
                val.time1 = moment(Number(val.time)).format("HH:mma");
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

    splitPageBar(){
        var pageArr = [];
        var pagenum = this.state.pagenum;
        var pagination = PaginationUtils.getPagination({total: this.total, pagesize: this.state.pagesize, pagenum: this.state.pagenum});
        var pageGroup = pagination.pagegroup;
        if (pageGroup && pageGroup.length > 0) {
            _.each(pageGroup, function(val, i) {
                var isCurrent = val === pagenum.toString();
                var selectClass = isCurrent?'currentPage':'';
                var disableClass = val === '...' ? 'pageDisabled' : '';
                pageArr.push(<li key={"logPage_"+i} onClick={this.currentPageClick.bind(this,val,isCurrent)} className={selectClass + ' ' + disableClass}>{val}</li>);
            }.bind(this));
        }
        return pageArr;
    }

    renderRecord (locale) {
        var device = this.getDeviceObject();
        var data = this.chargeLogonLogData();
        var content = _.map(data, function(log, key) {
            var logonRecordList = _.map(log, function(val, i){
                //var logonInfoLabel = StringUtils.format('ip', val.ip);
                var logonInfoLabel = locale.logonIpLabel + val.ip;
                var logonName = `${val.firstname} ${val.lastname} (${val.username})`;
                return (
                    <li className="logonLine" key={"logonTime_"+i}>
                        <div className="logonLineName">{logonName}</div>
                        <div className="logonLineTxt">{val.time1} {locale.logonLineLabel}<span className="accessPlatform"><i className="ficon-laptop"></i>{device[val.clienttype]}</span></div>
                        <div className="logonLineDesc">{logonInfoLabel}</div>
                    </li>
                );
            });
            return (
                <div key={"logonDate_"+key} className="logonRecordLine">
                    <div className="logonDate">{key}</div>
                    <ul className="logonList">
                        {logonRecordList}
                    </ul>
                </div>
            );
        });
        return content;
    }

    prevPageClick () {
        var pagenum = this.state.pagenum;
        if (pagenum > 1){
            --pagenum;
            this.setState({pagenum: pagenum});
            this.requestData(pagenum);
        }
    }

    nextPageClick () {
        var pagenum = this.state.pagenum;
        var totalPage = this.totalpage;
        if (pagenum < totalPage){
            ++pagenum;
            this.setState({pagenum: pagenum});
            this.requestData(pagenum);
        }
    }

    currentPageClick (pagenum, isCurrent) {
        if (!isCurrent && !isNaN(pagenum)){
            pagenum = parseInt(pagenum);
            this.setState({pagenum: pagenum});
            this.requestData(pagenum);
        }
    }

    render () {
        var logData = this.props.logData;
        this.getLogonLogData(logData);
        var locale = this.props.locale;
        var pageBar = this.splitPageBar();
        var pagenum = this.state.pagenum;
        var prevClass = pagenum<=1?'pageDisabled':'';
        var nextClass = pagenum>=this.totalpage?'pageDisabled':'';
        var showClass = this.state.show?'':'hidden';
        var renderContent = this.renderRecord(locale);
        return (
            <div className="rightContext logonContext logs">
                <div className={classnames("displayBox","logonRecord",showClass)} data-index="3">
                    <div className="headerLabel">
                        <div className="displaylogonLabel">{locale.logonRecordLabel}</div>
                        <div className="logonRecordLabel">{locale.logonRecordDesc}</div>
                    </div>
                    <div className="logonContent">
                        <div className="logonRecordList">{renderContent}</div>
                    </div>
                </div>
                <div className="splitPageLine">
                    <ul className="splitPage">
                        <li onClick={this.prevPageClick.bind(this)} className={"prev " + prevClass}>{locale.prevLabel}</li>
                        {pageBar}
                        <li onClick={this.nextPageClick.bind(this)} className={"next " + nextClass}>{locale.nextLabel}</li>
                    </ul>
                </div>
            </div>
        );
    }
}

export default class Logs extends PureRenderComponent {
    _updateLogs = () => {
        let data = SettingStore.getTeamSettingLog();
        this.setState({
            logData: data
        })
    }
    componentWillMount() {
        this._updateLogs();
        SettingStore.addEventListener(SETTING_EVENTS.UPDATE_LOG, this._updateLogs);
    }
    componentWillUnmount() {
        SettingStore.removeEventListener(SETTING_EVENTS.UPDATE_LOG, this._updateLogs);
    }
    render() {
        return <LogsView {..._.pick(this.state, ['logData'])} {...this.props}/>
    }
}
