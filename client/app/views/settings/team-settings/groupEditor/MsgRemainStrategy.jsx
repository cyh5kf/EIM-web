import React from 'react';
import _ from 'underscore';
import toast from '../../../../components/popups/toast';
import Select from '../../../../components/rc-select/Select';
import SaveButton from '../../../../components/button/LoadingButton';
import exposeLocale from '../../../../components/exposeLocale';
import MessagePopup from '../../../../components/alert/MessagePopup';

@exposeLocale(['DIALOGS', 'dlg-accountInfo'])
export default class MsgRemainStrategy extends React.Component{

    constructor(props) {
        super(props);
        let company = this.props.companyDetails;
        this.state = {show:true
            ,msgretentionpolicy: company.msgretentionpolicy
            ,msgretentiondays: company.msgretentiondays
            ,allowsettingretention: company.allowsettingretention
            ,remainEmailData:this.getMicEmailRemainStrategy()
            ,remainSessionData:this.getMsgRemainStrategy()
            ,messagewarnDisplay: false
        };
    }
    
    componentDidMount(){

    }

    componentWillReceiveProps(nextProps) {
        this.setState({company:_.clone(nextProps.companyDetails,true)});
    }

    getMsgRemainStrategy(){
        let locale = this.props.locale;
        var msgOptList = [
             {id:1,name:locale.remainMsgOption1}
            ,{id:2,name:locale.remainMsgOption2}
            ,{id:3,name:locale.remainMsgOption3}];
        return msgOptList;
    }

    getMicEmailRemainStrategy(){
       let locale = this.props.locale;
       var microEmailOptList = [
            {id:1,name:locale.remainMicroemailOption1}
            ,{id:2,name:locale.remainMicroemailOption2}
            ,{id:3,name:locale.remainMicroemailOption3}];
       return microEmailOptList;     
    }

    remainSessionCallback(obj){
        this.setState({msgretentionpolicy:obj.id});
        this.props.parent.setSaveBtnState(6, 0);//按钮状态变成 恢复正常
    }

    sessionRemainDaysChange(e){
        var val = e.target.value.replace(/\D/gi,"");
        var value = val?parseInt(val):0;
        this.setState({msgretentiondays:value});
        this.props.parent.setSaveBtnState(6, 0);//按钮状态变成 恢复正常
    }

    allowSettingClick(e){
        var val = e.target.checked?1:2;
        this.setState({allowsettingretention:val});
    }

    saveSessionPolicyClick(){
        let locale = this.props.locale;
        let company = this.state;

        if (company.msgretentionpolicy===3&&company.msgretentiondays<=0){
            toast(locale['remainSessionDaysMsg']);
            return false;
        }

        let setting = {
            msgretentionpolicy:company.msgretentionpolicy,
            msgretentiondays:company.msgretentiondays,
            allowsettingretention:company.allowsettingretention
        };
        this.props.parent.updateCompanySetting(setting,6);
    }

    render(){
        let locale = this.props.locale;
        let company = this.state;
        let checked = company.allowsettingretention===1;
        let locale1 = this.state.locale;
        let btnState2 = this.props.btnState2 || 0; ////0 正常,1 loading, 2 saved
        let msgretentionpolicy = company.msgretentionpolicy;
        let remainSessionData = this.state.remainSessionData;
        return (<div className="settingContent remainMessageBox">
                    <MessagePopup className="info"><i className="ficon-button ficon-info_circle"></i>{locale.messageInfo}</MessagePopup>
                    <MessagePopup className="warning"><i className="ficon-button ficon-uniE209"></i>{locale.messageWarning1}</MessagePopup>
                    <div className="inactiveNotice">
                        <input type="checkBox" className="icon" checked={checked} onChange={()=>{}} onClick={this.allowSettingClick.bind(this)}/>{locale.allowMemSetLabel}
                    </div>

                    <div className="remainContain">
                        <div className="sessionRetention">
                            <div className="remainTextLabel">
                                <div className="small">{locale.sessionRemainLabel}</div>
                                <div className="remainSessionLine">
                                    <Select showSearch={false}
                                            selectedDatasource={remainSessionData.find(item => item.id === msgretentionpolicy)}
                                            datasource={remainSessionData}
                                            onSelectedDatasourceChange={this.remainSessionCallback.bind(this)}/>
                                </div>
                            </div>
                            {company.msgretentionpolicy===3&&<div className="remainDaySetting"><div className="small">{locale.forDaysLabel}</div><input type="text" className="remainDayTxt" value={company.msgretentiondays} onChange={this.sessionRemainDaysChange.bind(this)}/><span className="small">{locale.dayLabel}</span></div>}
                            <div className="buttonBoxLine mesRemainSave" onClick={this.saveSessionPolicyClick.bind(this)}>
                                <SaveButton className="green" loading={btnState2}>
                                    {btnState2===2?locale1.noticeSaved:locale1.saveSetting}
                                </SaveButton>
                            </div>
                            <div className="clearfix"></div>
                        </div>

                    </div>

                </div>);
    }
    
}



MsgRemainStrategy.propTypes = {
    parent: React.PropTypes.object,
    companyDetails: React.PropTypes.object,
    updateCompanySetting: React.PropTypes.func,
    locale: React.PropTypes.object,
    btnState: React.PropTypes.number,
    btnState2: React.PropTypes.number
};
