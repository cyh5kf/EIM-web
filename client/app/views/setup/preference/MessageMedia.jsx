import React from 'react';
import _ from 'underscore';
import toast from '../../../components/popups/toast';
import {ReactPropTypes} from '../../../utils/schema';
import {UserInfoSchema} from '../../../core/schemas/SettingSchemas';
import exposeLocale from '../../../components/exposeLocale';
import SavedLoading from '../../../components/loading/SavingLoading';
import {MESSAGE_MEDIA,PREFERENCE_RESULT} from '../../../core/enums/EnumSetting';

@exposeLocale()
export default class MessageMedia extends React.Component{

    static propTypes = {
		userSetting: ReactPropTypes.ofSchema(UserInfoSchema).isRequired
	};

    constructor(props){
        super(props);
        let user = this.props.userSetting;
        let param = this.setDefaultParam(user);
        this.state = _.extend({show:true},param);
    }

    open(){
        this.setState({show:true});
    }

    close(){
        this.setState({show:false});
    }

    componentWillReceiveProps(nextProps){
        let user = nextProps.userSetting;
        this.setState(this.setDefaultParam(user));
    }

    setDefaultParam(user){
        return {showtyping:user.showtyping,
            changeusernamepolicy:user.changeusernamepolicy,
            time24:user.time24,
            faceconvert:user.faceconvert,
            showuploadimagefile:user.showuploadimagefile,
            showextendfile:user.showextendfile,
            showextendbiggertwom:user.showextendbiggertwom,
            showextendlink:user.showextendlink
        };
    }

    changePreferences(_index,vals){
        let setting = null, loading = null;
        let val = vals===PREFERENCE_RESULT.Yes?PREFERENCE_RESULT.No:PREFERENCE_RESULT.Yes;
        switch(_index){
            case MESSAGE_MEDIA.Showtyping:
                setting={showtyping:val};
                loading = this.refs['displayOptionLoading'];
            break;
            case MESSAGE_MEDIA.Changeusernamepolicy:
                setting={changeusernamepolicy:val};
                loading = this.refs['displayOptionLoading'];
            break;
            case MESSAGE_MEDIA.Time24:
                setting={time24:val};
                loading = this.refs['displayOptionLoading'];
            break;
            case MESSAGE_MEDIA.Faceconvert:
                setting={faceconvert:val};
                loading = this.refs['convertEmojiLoading'];
            break;
            case MESSAGE_MEDIA.Showuploadimagefile:
                setting={showuploadimagefile:val};
                loading = this.refs['inlineMediaLoading'];
            break;
            case MESSAGE_MEDIA.Showextendfile:
                setting={showextendfile:val};
                loading = this.refs['inlineMediaLoading'];
            break;
            case MESSAGE_MEDIA.Showextendbiggertwom:
                if (this.state.showextendfile===PREFERENCE_RESULT.Yes){
                    setting={showextendbiggertwom:val};
                    loading = this.refs['inlineMediaLoading'];
                }
            break;
            case MESSAGE_MEDIA.Showextendlink:
                setting={showextendlink:val};
                loading = this.refs['inlineMediaLoading'];
            break;
            
        }
        if (setting&&loading){
            loading.load();
            this.setState(setting);
            setting.uid = this.props.userSetting.uid;
            this.props.parent.updateUserSetting(setting,_index,loading,this.updateCallback);
        }
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
        var showClass = this.state.show?'':'hidden';
        var showBig2MDisable = this.state.showextendfile===PREFERENCE_RESULT.Yes?'':'disable';
        var showBig2MbCss = this.state.showextendbiggertwom===PREFERENCE_RESULT.Yes?'selected':'';
        return (<div className={"displayBox messageMedia "+showClass}>
                    <div className="messageShowModule themeInfoBox">
                        <div className="messageMediaLabel">{locale.messageMediaLabel}</div>
                        <div className="displayOptionBox">
                            <div className="optionLabel">{locale.displayOptionList.label}<SavedLoading ref="displayOptionLoading"/></div>
                            <ul className="optionList">
                                <li className={this.state.showtyping===PREFERENCE_RESULT.Yes?'selected':''}>
                                    <div className="icon eim-checkBox" onClick={this.changePreferences.bind(this,MESSAGE_MEDIA.Showtyping,this.state.showtyping)}></div>{locale.displayOptionList.option1}
                                </li><li className={this.state.changeusernamepolicy===PREFERENCE_RESULT.Yes?'selected':''}>
                                    <div className="icon eim-checkBox" onClick={this.changePreferences.bind(this,MESSAGE_MEDIA.Changeusernamepolicy,this.state.changeusernamepolicy)}></div>{locale.displayOptionList.option2}
                                </li><li className={this.state.time24===PREFERENCE_RESULT.Yes?'selected':''}>
                                    <div className="eim-checkBox" onClick={this.changePreferences.bind(this,MESSAGE_MEDIA.Time24,this.state.time24)}></div>{locale.displayOptionList.option3}
                                </li>
                                <li className="optionDesc">
                                    {locale.displayOptionList.optionDesc4}
                                </li>
                            </ul>
                        </div>
                        <div className="emoticoConvertBox">
                            <div className="optionLabel">{locale.convertEmoticons.label}<SavedLoading ref="convertEmojiLoading"/></div>
                            <ul className="optionList">
                                <li className={this.state.faceconvert===PREFERENCE_RESULT.Yes?'selected':''}>
                                    <div className="icon eim-checkBox" onClick={this.changePreferences.bind(this,MESSAGE_MEDIA.Faceconvert,this.state.faceconvert)}></div>{locale.convertEmoticons.option}
                                    <span className="emoji emoji-sizer applesmail"></span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="inlineMediaModule themeInfoBox">
                        <div className="messageMediaLabel">{locale.inlineMediaList.label}<SavedLoading ref="inlineMediaLoading"/></div>
                        <ul className="optionList">
                            <li className={this.state.showuploadimagefile===PREFERENCE_RESULT.Yes?'selected':''}>
                                <div className="icon eim-checkBox" onClick={this.changePreferences.bind(this,MESSAGE_MEDIA.Showuploadimagefile,this.state.showuploadimagefile)}></div>{locale.inlineMediaList.option1}
                            </li>
                            <li className={this.state.showextendfile===PREFERENCE_RESULT.Yes?'selected':''}>
                                <div className="icon eim-checkBox" onClick={this.changePreferences.bind(this,MESSAGE_MEDIA.Showextendfile,this.state.showextendfile)}></div>{locale.inlineMediaList.option2}
                            </li>
                            <li className={"childRadio "+showBig2MbCss}>
                                <div className={"icon eim-checkBox "+showBig2MDisable} onClick={this.changePreferences.bind(this,MESSAGE_MEDIA.Showextendbiggertwom,this.state.showextendbiggertwom)}></div>{locale.inlineMediaList.option3}
                            </li>
                            <li className={this.state.showextendlink===PREFERENCE_RESULT.Yes?'selected':''}>
                                <div className="icon eim-checkBox" onClick={this.changePreferences.bind(this,MESSAGE_MEDIA.Showextendlink,this.state.showextendlink)}></div>{locale.inlineMediaList.option4}
                            </li>
                        </ul>
                    </div>
                </div>);
    }
}

