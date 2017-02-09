import React from 'react';
import EnumTimeOptList from '../../../../core/enums/EnumTimeOptList';
import SaveButton from '../../../../components/button/LoadingButton';
import exposeLocale from '../../../../components/exposeLocale';
import MessagePopup from '../../../../components/alert/MessagePopup';
import Select from '../../../../components/rc-select/Select';

@exposeLocale(['DIALOGS', 'dlg-accountInfo'])
export default class NotDisturbTimeSetting extends React.Component{

    constructor(props) {
        super(props);
        let company = this.props.companyDetails;
        this.state = {show:true,
            disablenotify: company.disablenotify,
            disablenotifystart: company.disablenotifystart,
            disablenotifyend: company.disablenotifyend,
            timeOptionList:EnumTimeOptList.dataList};
    }
    
    componentDidMount(){
        
    }

    componentWillReceiveProps(nextProps) {
        this.setState({company:nextProps.companyDetails});
    }

    startTimeCallback(obj){
        this.setState({disablenotifystart:obj.id});
        this.props.parent.setSaveBtnState(4, 0);//按钮状态变成 恢复正常
    }
    
    endTimeCallback(obj){
        this.setState({disablenotifyend:obj.id});
        this.props.parent.setSaveBtnState(4, 0);//按钮状态变成 恢复正常
    }
    
    forbidNoticeClick(e){
        var value = e.target.checked?1:2;
        this.setState({disablenotify:value});
        this.props.parent.setSaveBtnState(4, 0);//按钮状态变成 恢复正常
    }

    saveNotDisturbClick(){
        let company = this.state;
        var setting = {
            disablenotify:company.disablenotify,
            disablenotifystart:company.disablenotifystart,
            disablenotifyend:company.disablenotifyend
        };
        this.props.parent.updateCompanySetting(setting,4);
    }

    render(){
        let locale = this.props.locale;
        let checked = this.state.disablenotify===1;
        let locale1 = this.state.locale;
        let btnState = this.props.btnState || 0; ////0 正常,1 loading, 2 saved
        let disablenotifystart = this.state.disablenotifystart;
        let timeOptionList = this.state.timeOptionList;
        let disablenotifyend = this.state.disablenotifyend;
        return (<div className="settingContent notDisturbBox">
                    <MessagePopup className="info"><i className="ficon-button ficon-info_circle"></i>{locale.notDisturbInfo}</MessagePopup>
                    <div className="inactiveNotice"><input type="checkBox" className="icon" checked={checked} onChange={()=>{}} onClick={this.forbidNoticeClick.bind(this)}/>{locale.forbidNoticeLabel}</div>
                    <div className="timeLimitLine">
                        <div className="startTime"><Select showSearch={false} selectedDatasource={timeOptionList.find(item => item.id === disablenotifystart)} datasource={timeOptionList} onSelectedDatasourceChange={this.startTimeCallback.bind(this)}/></div>
                        <div className="timeText">{locale.toLabel}</div>
                        <div className="startTime"><Select showSearch={false} selectedDatasource={timeOptionList.find(item => item.id === disablenotifyend)} datasource={timeOptionList} onSelectedDatasourceChange={this.endTimeCallback.bind(this)}/></div>
                        <div className="clearFloat"></div>
                    </div>
                    <div className="buttonBoxLine mar_top" onClick={this.saveNotDisturbClick.bind(this)}>
                        <SaveButton className="green" loading={btnState}>
                            {btnState===2?locale1.noticeSaved:locale1.saveSetting}
                        </SaveButton>
                    </div>
                    <div className="clearfix"></div>
                </div>);
    }
    
}


NotDisturbTimeSetting.propTypes = {
    parent: React.PropTypes.object,
    companyDetails: React.PropTypes.object,
    updateCompanySetting: React.PropTypes.func,
    locale: React.PropTypes.object,
    btnState: React.PropTypes.number
};

