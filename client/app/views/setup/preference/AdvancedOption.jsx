import React from 'react';
import _ from 'underscore';
import toast from '../../../components/popups/toast';
import {ReactPropTypes} from '../../../utils/schema';
import {UserInfoSchema} from '../../../core/schemas/SettingSchemas';
import exposeLocale from '../../../components/exposeLocale';
import SavedLoading from '../../../components/loading/SavingLoading';
import {ADVANCED_OPTION,PREFERENCE_RESULT} from '../../../core/enums/EnumSetting';

@exposeLocale()
export default class AdvancedOption extends React.Component{

    static propTypes = {
		userSetting: ReactPropTypes.ofSchema(UserInfoSchema).isRequired
	};

    constructor(props){
        super(props);
        let user = this.props.userSetting;
        let param = this.setDefaultParam(user);
        this.state = _.extend({
            show:true
        },param);
    }

    componentWillReceiveProps(nextProps){
        let user = nextProps.userSetting;
        this.setState(this.setDefaultParam(user));
    }

    setDefaultParam(user){
        return {microemaillist:user.microemaillist,
                rollmsgpageup:user.rollmsgpageup,
                ctrlfsearch:user.ctrlfsearch,
                ctrlksearch:user.ctrlksearch,
                togglemyawaystatus:user.togglemyawaystatus};
    }

    open(){
        this.setState({show:true});
    }

    close(){
        this.setState({show:false});
    }

    sessionSelectCallback(session){
        this.setState({microemaillist:session.value});
        this.props.parent.updateUserSetting({microemaillist:session.value});
    }

    changeOptionValue(_index,val){
        let setting = {};
        val = val===PREFERENCE_RESULT.Yes?PREFERENCE_RESULT.No:PREFERENCE_RESULT.Yes;
        switch (_index){
            case ADVANCED_OPTION.Rollmsgpageup:
                setting = {rollmsgpageup:val};
            break;
            case ADVANCED_OPTION.Ctrlfsearch:
                setting = {ctrlfsearch:val};
            break;
            case ADVANCED_OPTION.Ctrlksearch:
                setting = {ctrlksearch:val};
            break;
            case ADVANCED_OPTION.Togglemyawaystatus:
                setting = {togglemyawaystatus:val};
            break;
        }
        let loading = this.refs['inputOptionLoading']
        loading.load();
        this.setState(setting);
        setting.uid = this.props.userSetting.uid;
        this.props.parent.updateUserSetting(setting,_index,loading,this.updateCallback);
    }

    updateCallback=(propid,loading,result)=>{
        let locale = this.props.locale;
        if (result&&loading){
            loading.loaded();
            loading.hideLoad();
        }
        else{
            loading.quickHideLoad();
            toast(locale.errorMsg);
        }
    }

    render(){
        var locale = this.props.locale;
        var inputOption = locale.inputOption;
        var showClass = this.state.show?'':'hidden';
        return (<div className={"displayBox advancedOption "+showClass}>
                    <div className="inputOptionBox themeBox disabled">
                        <div className="optionLabel inputOptionLabel">{inputOption.inputOptionLabel}</div>
                        <ul className="optionList">
                            <li><span className="icon eim-checkBox"></span>{inputOption.option1}</li>
                            <li><span className="icon eim-checkBox"></span>{inputOption.option2}</li>
                            <li><span className="icon eim-checkBox"></span><span dangerouslySetInnerHTML={{__html:inputOption.option3}}></span></li>
                            <li className="optionDesc" dangerouslySetInnerHTML={{__html:inputOption.optionDesc3}}></li>
                            <li><span className="icon eim-checkBox"></span><span dangerouslySetInnerHTML={{__html:inputOption.option4}}></span></li>
                            <li className="optionDesc" dangerouslySetInnerHTML={{__html:inputOption.optionDesc4}}></li>
                        </ul>
                    </div>
                    <div className="channelListBox themeBox disabled">
                        <div className="optionLabel channelListLabel">{locale.channelList.channelListLabel}</div>
                        <div className="optionText channelListText">{locale.channelList.channelListText}</div>
                        <ul className="optionList">
                            <li><div className="eim-radio"></div>{locale.channelList.option1}</li>
                            <li><div className="eim-radio"></div>{locale.channelList.option2}</li>
                            <li><div className="eim-radio"></div><span dangerouslySetInnerHTML={{__html:locale.channelList.option3}}></span></li>
                            <li className="privateChannel"><div className="icon eim-checkBox"></div><span dangerouslySetInnerHTML={{__html:locale.channelList.option4}}></span></li>
                        </ul>
                    </div>
                    <div className="otherOptionBox themeBox">
                        <div className="optionLabel otherOptionLabel">{locale.otherOptionList.optionLabel}<SavedLoading ref="inputOptionLoading"/></div>
                        <ul className="optionList">
                            <li className={this.state.rollmsgpageup===PREFERENCE_RESULT.Yes?'selected':''}>
                                <div className="icon eim-checkBox" onClick={this.changeOptionValue.bind(this,ADVANCED_OPTION.Rollmsgpageup,this.state.rollmsgpageup)}></div><span dangerouslySetInnerHTML={{__html:locale.otherOptionList.option1}}></span>
                            </li><li className={this.state.ctrlfsearch===PREFERENCE_RESULT.Yes?'selected':''}>
                                <div className="icon eim-checkBox" onClick={this.changeOptionValue.bind(this,ADVANCED_OPTION.Ctrlfsearch,this.state.ctrlfsearch)}></div>{locale.otherOptionList.option2}
                            </li><li className="optionDesc">
                                {locale.otherOptionList.optionDesc2}
                            </li><li className={this.state.ctrlksearch===PREFERENCE_RESULT.Yes?'selected':''}>
                                <div className="icon eim-checkBox" onClick={this.changeOptionValue.bind(this,ADVANCED_OPTION.Ctrlksearch,this.state.ctrlksearch)}></div>{locale.otherOptionList.option3}
                            </li><li className="optionDesc">
                                {locale.otherOptionList.optionDesc3}
                            </li><li className="disabled">
                                <div className="icon eim-checkBox" onClick={this.changeOptionValue.bind(this,ADVANCED_OPTION.Togglemyawaystatus,this.state.togglemyawaystatus)}></div>{locale.otherOptionList.option4}
                            </li><li className={this.state.togglemyawaystatus===PREFERENCE_RESULT.Yes?'selected':''}>
                                <div className="icon eim-checkBox" onClick={this.changeOptionValue.bind(this,ADVANCED_OPTION.Togglemyawaystatus,this.state.togglemyawaystatus)}></div>{locale.otherOptionList.option5}
                            </li><li className="disabled">
                                <div className="icon eim-checkBox" onClick={this.changeOptionValue.bind(this,ADVANCED_OPTION.Togglemyawaystatus,this.state.togglemyawaystatus)}></div>{locale.otherOptionList.option6}
                            </li>
                        </ul>
                    </div>
                    <div className="debuggingBox themeBox">
                        <div className="optionLabel channelListLabel">{locale.debuggingList.debuggingLabel}</div>
                        <div className="optionText channelListText">{locale.debuggingList.debuggingText}</div>
                        <ul className="optionList disabled">
                            <li><span className="icon eim-checkBox"></span>{locale.debuggingList.option1}</li>
                            <li className="optionDesc">{locale.debuggingList.optionDesc1}</li>
                            <li><span className="icon eim-checkBox"></span>{locale.debuggingList.option2}</li>
                            <li className="optionDesc">{locale.debuggingList.optionDesc2}</li>
                            <li><span className="icon eim-checkBox"></span>{locale.debuggingList.option3}</li>
                            <li className="optionDesc">{locale.debuggingList.optionDesc3}</li>
                        </ul>
                    </div>
                </div>);
    }
}

