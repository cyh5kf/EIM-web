import React from 'react';
import Select from '../../../../components/rc-select/Select';
import SaveButton from '../../../../components/button/LoadingButton';
import exposeLocale from '../../../../components/exposeLocale';

@exposeLocale(['DIALOGS', 'dlg-accountInfo'])
export default class NameDisplayStrategy extends React.Component{

    constructor(props) {
        super(props);
        this.state = {show:true
            ,namePolicy:this.props.changeusernamepolicy
            ,nameStyleData:this.displayNameStyle()};
    }

    nameStyleCallback(obj){
        this.setState({namePolicy:obj.id});
        this.props.parent.setSaveBtnState(3, 0);//按钮状态变成 恢复正常
    }

    displayNameStyle(){
        let locale = this.props.locale;
        let showNameData = [
            {id:1, name:locale.nameDisplayOption1}
            ,{id:2, name:locale.nameDisplayOption2}];
        return showNameData;
    }

    saveNameStrategyClick(){
        var setting = {
            changeusernamepolicy:this.state.namePolicy
        };
        this.props.parent.updateUserSetting(setting,3);
    }

    render(){
        let locale = this.state.locale;
        let btnState = this.props.btnState || 0; ////0 正常,1 loading, 2 saved
        let namePolicy = this.state.namePolicy;
        let nameStyleData = this.state.nameStyleData;
        return (<div className="settingContent showMemNameOptions">
                    <div className="showUserSelect">
                        <Select showSearch={false}
                                selectedDatasource={nameStyleData.find(item => item.id === namePolicy)}
                                datasource={nameStyleData}
                                onSelectedDatasourceChange={this.nameStyleCallback.bind(this)}/>
                    </div>
                    <div className="buttonBoxLine mar_top" onClick={this.saveNameStrategyClick.bind(this)}>
                        <SaveButton className="green" loading={btnState}>
                            {btnState===2?locale.noticeSaved:locale.saveSetting}
                        </SaveButton>
                    </div>
                    <div className="clearfix"></div>
                </div>);
    }
    
}



NameDisplayStrategy.propTypes = {
    parent: React.PropTypes.object,
    changeusernamepolicy: React.PropTypes.number,
    updateCompanySetting: React.PropTypes.func,
    locale: React.PropTypes.object,
    btnState: React.PropTypes.number
};

