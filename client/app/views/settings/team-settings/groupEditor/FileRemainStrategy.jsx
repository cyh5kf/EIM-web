import React from 'react';
import toast from '../../../../components/popups/toast';
import Select from '../../../../components/rc-select/Select';
import SaveButton from '../../../../components/button/LoadingButton';
import exposeLocale from '../../../../components/exposeLocale';

@exposeLocale(['DIALOGS', 'dlg-accountInfo'])
export default class FileRemainStrategy extends React.Component{

    constructor(props) {
        super(props);
        let company = this.props.companyDetails;
        this.state = {show:true
            ,fileRemainDays:company.fileretentiondays
            ,fileRemainPolicy:company.fileretentionpolicy
            ,remainFileData:this.getRemainFileStrategy()};
    }
    
    componentDidMount(){
        
    }

    getRemainFileStrategy(){
        let locale = this.props.locale;
        let remainMessage = [
             {id:1,name:locale.remainFileOption1}
            ,{id:2,name:locale.remainFileOption2}
            ,{id:3,name:locale.remainFileOption3}];
        return remainMessage;
    }

    remainFileCallback(obj){
        this.setState({fileRemainPolicy:obj.id});
        this.props.parent.setSaveBtnState(7, 0);//按钮状态变成 恢复正常
    }

    fileRemainDaysChange(e){
        var val = e.target.value.replace(/\D/gi,"");
        var value = val?parseInt(val):0;
        this.setState({fileRemainDays:value});
        this.props.parent.setSaveBtnState(7, 0);//按钮状态变成 恢复正常
    }
    
    saveFileRemainPolicy(){
        let locale = this.props.locale;
        let fileRemainDays = this.state.fileRemainDays;
        let fileRemainPolicy = this.state.fileRemainPolicy;
        if (fileRemainPolicy===3&&fileRemainDays<=0){
            toast(locale.remainFileDaysMsg);
            return false;
        }
        let setting = {
            fileretentiondays:fileRemainDays,
            fileretentionpolicy:fileRemainPolicy
        };
        this.props.parent.updateCompanySetting(setting,7);
    }
    
    

    render(){
        let locale = this.props.locale;
        let locale1 = this.state.locale;
        let btnState = this.props.btnState || 0; ////0 正常,1 loading, 2 saved
        let fileRemainPolicy = this.state.fileRemainPolicy;
        let remainFileData = this.state.remainFileData;
        return (<div className="settingContent remainFileStyle">
                    <div className="remainFileBox">
                        <div className="remainFileLine">
                            <div className="small">{locale.fileRetentionLabel}</div>
                            <Select showSearch={false}
                                    selectedDatasource={remainFileData.find(item => item.id === fileRemainPolicy)}
                                    datasource={remainFileData}
                                    onSelectedDatasourceChange={this.remainFileCallback.bind(this)}/>
                        </div>
                        {this.state.fileRemainPolicy===3&&<div className="remainDaySetting">
                            <div className="small">{locale.forDaysLabel}</div>
                            <input type="text" className="remainDayTxt" value={this.state.fileRemainDays} onChange={this.fileRemainDaysChange.bind(this)}/>
                            <span className="text">{locale.dayLabel}</span>
                        </div>}
                        <div className="clearfix"></div>
                     </div>
                    <div className="buttonBoxLine mar_top" onClick={this.saveFileRemainPolicy.bind(this)}>
                        <SaveButton className="green" loading={btnState}>
                            {btnState===2?locale1.noticeSaved:locale1.saveSetting}
                        </SaveButton>
                    </div>
                    <div className="clearfix"></div>
                </div>);
    }
    
}


FileRemainStrategy.propTypes = {
    parent: React.PropTypes.object,
    companyDetails: React.PropTypes.object,
    updateCompanySetting: React.PropTypes.func,
    locale: React.PropTypes.object,
    btnState: React.PropTypes.number
};

