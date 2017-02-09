import React, {PropTypes} from 'react';
import toast from '../../../components/popups/toast';
import exposeLocale from '../../../components/exposeLocale';
import SavedLoading from '../../../components/loading/SavingLoading';
import {MARK_MSG_READ_TYPE} from '../../../core/enums/EnumSetting';

@exposeLocale()
export default class MarkAnRead extends React.Component{

    static propTypes = {
        uid: PropTypes.string.isRequired,
		markmsgreadtype: PropTypes.number.isRequired
	};

    constructor(props){
        super(props);
        this.state = {show:true,markmsgreadtype:this.props.markmsgreadtype};
    }

    open(){
        this.setState({show:true});
    }

    close(){
        this.setState({show:false});
    }

    componentWillReceiveProps(nextProps){
        this.setState({markmsgreadtype:nextProps.markmsgreadtype});
    }

    changeReadStatus(val){
        let setting = {markmsgreadtype:val};
        let loading = this.refs['markReadLoading'];
        loading.load();
        this.setState(setting);
        setting.uid = this.props.uid;
        this.props.parent.updateUserSetting(setting,0,loading,this.updateCallback);
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
        var markmsgreadtype = this.state.markmsgreadtype;
        return (<div className={"displayBox readStatusSetting "+showClass}>
                    <div className="readStatusLabel">{locale.msgStatusReaded}<SavedLoading ref="markReadLoading" className="markReadLoading"/></div>
                    <div className="readStatusDesc">{locale.msgStatusDesc}</div>
                    <div className="optionLabel viewChannelLabel">{locale.viewChannelLabel}</div>
                    <ul className="optionList">
                        <li className={markmsgreadtype===MARK_MSG_READ_TYPE.ScrollToOldUnreadMsg?'selected':''}>
                            <div className="eim-radio" onClick={this.changeReadStatus.bind(this,MARK_MSG_READ_TYPE.ScrollToOldUnreadMsg)}></div>{locale.msgScrollToUnreadTop}
                        </li><li className={markmsgreadtype===MARK_MSG_READ_TYPE.DoNotScrollToUnreadMsg?'selected':''}>
                            <div className="eim-radio" onClick={this.changeReadStatus.bind(this,MARK_MSG_READ_TYPE.DoNotScrollToUnreadMsg)}></div>{locale.msgChangeToReaded}
                        </li><li className={markmsgreadtype===MARK_MSG_READ_TYPE.DoNotScrToUnreadAndMarkMsg?'selected':''}>
                            <div className="eim-radio" onClick={this.changeReadStatus.bind(this,MARK_MSG_READ_TYPE.DoNotScrToUnreadAndMarkMsg)}></div>{locale.msgChangeTinyEmailToRead}
                        </li>
                    </ul>

                    <div className="optionLabel msgHintLabel">{locale.msgHintLabel}</div>
                    <ul className="readHintNotice">
                        <li className="shortcutEsc" dangerouslySetInnerHTML={{__html:locale.msgHintShortcutEsc}}></li>
                        <li className="shortcutSEsc" dangerouslySetInnerHTML={{__html:locale.msgHintShortcutShiftEsc}}></li>
                        <li className="shortcutAlt" dangerouslySetInnerHTML={{__html:locale.msgHintShortcutAlt}}></li>
                    </ul>
                </div>);
    }
}

