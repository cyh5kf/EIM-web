import React from 'react';
import _ from 'underscore';
import RadioGroup from '../../../components/radio/RadioGroup';
import TeamSetupItem from './TeamSetupItem';
import PureRenderComponent from '../../../components/PureRenderComponent';
import {PERMISSION_SETTING_ENUM} from '../../../core/enums/EnumSetting';
import Select from '../../../components/rc-select/Select';

class CheckboxRow extends PureRenderComponent {
    static propTypes = {
        checked: React.PropTypes.bool,
        onClick: React.PropTypes.func,
        label:React.PropTypes.string
    };
    constructor(props){
        super(props);
    }
    render(){
        var checked = this.props.checked;
        var onClick = this.props.onClick;
        var label = this.props.label;
        return (
            <div className="oneRowContent">
                <label>
                    <input
                        type="checkBox"
                        className="icon"
                        checked={checked}
                        onChange={()=>{}}
                        onClick={onClick}
                    />
                    <span> {label}</span>
                </label>
            </div>
        );
    }
}



function getSelectEnumWithLocal(locale,enumKey) {
    //枚举值的key和i18n资源的key是一致的.
    var enumValues = PERMISSION_SETTING_ENUM[enumKey] || {};
    var enumI18n = locale.authortyMessages[enumKey] || {};
    var result = [];
    _.mapObject(enumValues, function (val, k) {
        var i18n = enumI18n[k] || ('!'+k + '!');
        result.push({
            name: i18n,
            id: val
        });
    });
    return result;
}


function distinctSubmitData(newData, oldData) {
    var result = {};
    _.mapObject(newData, function (val, index) {
        if (val !== oldData[index]) result[index] = val;
    });
    return result;
}

function initState(props) {
    if (!props.companyDetails) {
        return {};
    }
    return {
        'whocanateveryone': props.companyDetails.whocanateveryone,
        'warnbeforeateveryone': props.companyDetails.warnbeforeateveryone,
        'whocanpostgeneral': props.companyDetails.whocanpostgeneral,
        'invitesonlyadmins': props.companyDetails.invitesonlyadmins,
        'whocancreategroups': props.companyDetails.whocancreategroups,
        'whocaneditgroups': props.companyDetails.whocaneditgroups,
        'msgdeletewindowmins': props.companyDetails.msgdeletewindowmins,
        'allowmessagedeletion': props.companyDetails.allowmessagedeletion,
        'whocaneditcompanysetting': props.companyDetails.whocaneditcompanysetting,
        'disallowpublicfileurls': props.companyDetails.disallowpublicfileurls
    };
}


export default class Permissions extends PureRenderComponent {

    constructor(props) {
        super(props);
        //复制一份到state,实现数据的隔离.
        this.state = initState(props);
    }

    componentWillReceiveProps(nextProps) {
        this.setState(initState(nextProps));
    }

    saveCallback(settingType) {
        var that = this;
        that.setSaveBtnState(settingType, 2);//按钮变成 saved !
    }


    updateCompanySetting(settingType, updateFields) {
        this.setSaveBtnState(settingType, 1);//按钮状态变成 loading...
        let callbackObj = {settingType: settingType, callback: this.saveCallback.bind(this)};
        var settingFields = distinctSubmitData(updateFields, this.props.companyDetails);
        if (_.isEmpty(settingFields)) {
            this.saveCallback(settingType);
        } else {
            this.props.parent.updateCompanySetting(settingFields, callbackObj);
        }
    }


    settingAuthority(settingType) {

        var updateCompanySetting = this.updateCompanySetting.bind(this, settingType);

        switch (settingType) {
            case 1:
                updateCompanySetting({
                    'whocanateveryone': this.state.whocanateveryone,
                    'warnbeforeateveryone': this.state.warnbeforeateveryone,
                    'whocanpostgeneral': this.state.whocanpostgeneral
                });
                break;
            case 2:
                updateCompanySetting({
                    invitesonlyadmins: this.state.invitesonlyadmins
                });
                break;
            case 4:
                updateCompanySetting({
                    'whocancreategroups': this.state.whocancreategroups,
                    'whocaneditgroups': this.state.whocaneditgroups
                });
                break;
            case 5:
                updateCompanySetting({
                    'msgdeletewindowmins': this.state.msgdeletewindowmins,
                    'allowmessagedeletion': this.state.allowmessagedeletion
                });
                break;
            case 6:
                updateCompanySetting({
                    'whocaneditcompanysetting': this.state.whocaneditcompanysetting
                });
                break;
            case 7:
                updateCompanySetting({
                    'disallowpublicfileurls': this.state.disallowpublicfileurls
                });
                break;
        }
    }


    //下拉框按钮点击
    selectedCallback(itemIndex,stateName, obj) {
        var stateObj = {};
        stateObj[stateName] = obj.id;
        this.setState(stateObj);
        this.setSaveBtnState(itemIndex, 0);//按钮状态变成 恢复正常
    }


    //单选按钮点击
    onClickRadioGroup(stateName, item, e) {
        var value = item.value;
        var stateObj = {};
        stateObj[stateName] = value;
        this.setState(stateObj);
        this.setSaveBtnStateNormalByEvent(e);
    }

    //复选框点击
    clickCheckBox(stateName, e) {
        var stateObj = {};
        stateObj[stateName] = this.state[stateName] === 1 ? 2 : 1;
        this.setState(stateObj);
        this.setSaveBtnStateNormalByEvent(e);
    }

    //让按钮的状态恢复正常
    setSaveBtnStateNormalByEvent(e) {
        var jQuery = window.jQuery || window.$;
        var index = jQuery(e.target).closest('.setupitems').attr('data-index');
        this.setSaveBtnState(index, 0);//按钮状态变成 恢复正常
    }


    onChangeCheckbox(e) {
    }


    setSaveBtnState(settingType, state) {
        var m = {};
        m['btnState_' + settingType] = state;
        this.setState(m);
    }

    getSaveBtnState(settingType) {
        return this.state['btnState_' + settingType] || 0;
    }

    getWhoCanEditCompanySettingOption() {
        let locale = this.props.locale;
        var m = locale.authortyMessages.fixGroupMsg;
        return [
            //{value: 1, display: m.all},
            {value: 2, display: m.managerAndOwner},
            {value: 3, display: m.owner}
        ];
    }


    renderSelect(itemIndex,stateKey, optionEnumKey) {
        let locale = this.props.locale;
        let selectId = this.state[stateKey];
        var dataSource = getSelectEnumWithLocal(locale, optionEnumKey);
        var selectedDataSource = dataSource.find(function (d) {
            return selectId === d.id;
        });

        return (
            <Select showSearch={false}
                    selectedDatasource={selectedDataSource}
                    datasource={dataSource}
                    onSelectedDatasourceChange={this.selectedCallback.bind(this, itemIndex,stateKey)}/>
        );
    }


    render() {

        if (!this.props.companyDetails) {
            return <div></div>
        }

        let locale = this.props.locale;
        var getSaveBtnState = this.getSaveBtnState.bind(this);

        return (
            <div className="team-setting-perm">
                <ul className="main-panel">
                    <TeamSetupItem
                        index={1}
                        title={locale.msgLimitLabel}
                        subtitle={locale.msgLimitDesc}
                        btnState={getSaveBtnState(1)}
                        onSubmit={this.settingAuthority.bind(this, 1)}
                    >
                        <div className="oneRow">
                            <p className="row-title">{locale.authortyMessages.everyone}</p>
                            {this.renderSelect(1,'whocanateveryone','everyoneSelectData')}
                        </div>
                        <div className="oneRow">
                            <p className="row-title">{locale.authortyMessages.everyoneTip}</p>
                            {this.renderSelect(1,'warnbeforeateveryone','tipsSelectData')}
                        </div>
                        <div className="oneRow">
                            <p className="row-title">{locale.authortyMessages.allPerson}</p>
                            {this.renderSelect(1,'whocanpostgeneral','everyoneSelectData')}
                        </div>
                    </TeamSetupItem>
                    <TeamSetupItem
                        index={2}
                        title={locale.invitationLabel}
                        subtitle={locale.invitationDesc}
                        btnState={getSaveBtnState(2)}
                        onSubmit={this.settingAuthority.bind(this, 2)}
                    >
                        <div className="oneRow">
                            <CheckboxRow
                                checked={this.state.invitesonlyadmins === 2}
                                onClick={this.clickCheckBox.bind(this, 'invitesonlyadmins')}
                                label={locale.authortyMessages.invitationSelectLabel}> </CheckboxRow>
                        </div>
                    </TeamSetupItem>
                    <TeamSetupItem
                        index={4}
                        title={locale.groupTextLabel}
                        subtitle={locale.groupTextDesc}
                        btnState={getSaveBtnState(4)}
                        onSubmit={this.settingAuthority.bind(this, 4)}
                    >
                        <div className="oneRow">
                            <p className="row-title">{locale.authortyMessages.whoCreateOrDisableGroup}</p>
                            {this.renderSelect(4,'whocancreategroups','allSelectData')}
                        </div>
                        <div className="oneRow">
                            <p className="row-title">{locale.authortyMessages.whoEditGroup}</p>
                            {this.renderSelect(4,'whocaneditgroups','allSelectData')}
                        </div>

                    </TeamSetupItem>
                    <TeamSetupItem
                        index={5}
                        title={locale.msgEditAndDelLabel}
                        subtitle={locale.msgEditAndDelDesc}
                        btnState={getSaveBtnState(5)}
                        onSubmit={this.settingAuthority.bind(this, 5)}
                    >
                        <div className="oneRow">
                            <p className="row-title">{locale.authortyMessages.allowEditMsg}</p>
                            {this.renderSelect(5,'msgdeletewindowmins','messageEditData')}
                        </div>
                        <div className="oneRow">
                            <p className="row-title">{locale.authortyMessages.defaultEditMsg}</p>
                        </div>
                        <div className="oneRow">
                            <CheckboxRow
                                checked={this.state.allowmessagedeletion === 1}
                                onClick={this.clickCheckBox.bind(this, 'allowmessagedeletion')}
                                label={locale.authortyMessages.whoDelMsg}> </CheckboxRow>
                        </div>
                    </TeamSetupItem>
                    <TeamSetupItem
                        index={6}
                        title={locale.updateGroupLabel}
                        subtitle={locale.updateGroupDesc}
                        btnState={getSaveBtnState(6)}
                        onSubmit={this.settingAuthority.bind(this, 6)}
                    >
                        <div className="oneRow">
                            <div className="oneRowContent">
                                <RadioGroup value={this.state.whocaneditcompanysetting}
                                            items={this.getWhoCanEditCompanySettingOption()}
                                            onClick={this.onClickRadioGroup.bind(this,"whocaneditcompanysetting")}>
                                </RadioGroup>
                            </div>
                        </div>

                    </TeamSetupItem>
                    <TeamSetupItem
                        index={7}
                        title={locale.sharePubFileLable}
                        subtitle={locale.sharePubFileDesc}
                        btnState={getSaveBtnState(7)}
                        onSubmit={this.settingAuthority.bind(this, 7)}
                    >
                        <div className="oneRow">
                            <CheckboxRow
                                checked={this.state.disallowpublicfileurls === 1}
                                onClick={this.clickCheckBox.bind(this, 'disallowpublicfileurls')}
                                label={locale.authortyMessages.disableCreateLinkLabel}> </CheckboxRow>
                        </div>
                    </TeamSetupItem>
                </ul>
            </div>
        );
    }

}

