import React from 'react';
import _ from 'underscore';
import GroupLogoUploader, { LogoUploaderEventTypes } from './GroupLogoUploader';
import WebUploaderConfig from '../../../../core/constants/WebUploaderConfig';
import ApiConfig from '../../../../core/constants/ApiConfig';
import GroupLogoDialog from './GroupLogoDialog';
import gGlobalEventBus from '../../../../core/dispatcher/GlobalEventBus';
import { updateCompanyLogoCmd, getCompanyByIdCmd } from '../../../../core/commands/SettingCommands';
import SettingStore,{SETTING_EVENTS} from '../../../../core/stores/SettingStore';
import { showAlert } from '../../../../components/popups/alert';

export default class OperateGroupLogo extends React.Component{

    constructor(props) {
        super(props);
        this.state = {isDialogShow: false, avatar: this.props.avatar, locale: this.props.locale};
        this.uploaderConfig = WebUploaderConfig.getImageWithThumb();
        this.uploaderConfig.server = ApiConfig.upload.base;
        this.uploaderConfig.paste = document.body;
        this.uploaderConfig.pick = {
            id:'#avatarUploader',
            button: '#uploaderBtn',
            multiple: false
        };
        this.uploaderConfig.cropper = {
            height: 100,
            width: 100
        }
    }

    componentWillMount () {
        SettingStore.addEventListener(SETTING_EVENTS.COMPANY_INFO, this.getCompanyDetail);
        SettingStore.addEventListener(SETTING_EVENTS.UPDATE_GROUP_LOGO, this.onUpdateGroupLogo);
    }

    componentDidMount () {
        //this.submitFailure = this.submitFailure.bind(this);
        getCompanyByIdCmd();
        gGlobalEventBus.addEventListener(LogoUploaderEventTypes.FILE_UPLOAD_SUCCESS,  this.onLogoUploaded);
    }

    componentWillUnmount () {
        SettingStore.removeEventListener(SETTING_EVENTS.COMPANY_INFO, this.getCompanyDetail);
        SettingStore.removeEventListener(SETTING_EVENTS.UPDATE_GROUP_LOGO, this.onUpdateGroupLogo);
        gGlobalEventBus.removeEventListener(LogoUploaderEventTypes.FILE_UPLOAD_SUCCESS, this.onLogoUploaded);
    }

    getCompanyDetail = () => {
        var data = SettingStore.getCompanyInfo();
        this.setState({avatar: data.coverimg.trim()});
    }

    onUpdateGroupLogo = () => {
        if(this.refs['editLogoDialog']) {
            this.refs['editLogoDialog'].close();
            showAlert(this.state.locale.iconUpdateSuccess, {
                time: 2000,
                type: 'success'
            });
        }
        else {
            showAlert(this.state.locale.iconDeleteSuccess, {
                time: 2000,
                type: 'success'
            });
        }
        getCompanyByIdCmd();
    }

    onLogoUploaded = (info) => {
        this.avatar = info[1].data.url.replace(/http:\/\/rd.icoco.com/gi, ApiConfig.upload.download);
        updateCompanyLogoCmd(this.avatar);
        this.refs.uploader.uploader.reset();
    }

    getCurrentFileDialog() {
        var dialog = null,
            locale = null;
        if (this.state.isDialogShow) {
            locale = this.state.locale;
            dialog = <GroupLogoDialog
                ref="editLogoDialog"
                locale = {locale}
                title={locale.title}
                hiddenFooter={true}
                thumb={this.state.thumb}
                onCrop={this.onCrop.bind(this)}
            />;

        }
        return dialog;
    }

    onCrop (fileBlob, croperData) {
        let current = this.refs.uploader.getFile();
        this.refs.uploader.uploader.removeFile(current.id, true);
        this.refs.uploader.uploader.postCropFile(fileBlob);
        let file = this.refs.uploader.getFile();
        file._info = _.extend(file._info, croperData);
        this.refs.uploader.uploader.upload(file);
        //this.props.updateState({'panelType': 3, show:true, croperImage:null});
    }

    onFileAdd(file){
        this.refs.uploader.uploader.makeThumb(file, ( error, ret )=>{
            this.setState({thumb: ret, isDialogShow:true});
            if (this.refs['editLogoDialog']) {
                this.refs['editLogoDialog'].open();
            }
        }, 382, 280);
    }

    onDelGroupLogo () {
        updateCompanyLogoCmd(' ');
    }

    render(){
        let locale = this.props.locale;
        let avatar = <div className="eim-deprecated eim-morengongsi32"></div>;
        if (this.state.avatar){
            avatar = <img src={this.state.avatar} alt=""/>;
        }
        let dialog = this.getCurrentFileDialog();
        return (<div className="settingContent operateTeamLogo">
                    <div className="logoLine"><div className="logoContain"><div className="logoBox">{avatar}</div></div></div>
                    <div className="buttonLine">
                        <GroupLogoUploader ref="uploader" config={this.uploaderConfig}
                                        onFileQueued={(file)=>this.onFileAdd(file)}
                                        className="logoUploader">
                            <div id="avatarUploader" className="edit-label">
                            </div>
                            <div id="uploaderBtn" style={{width:100, height:30}}></div>
                        </GroupLogoUploader>
                        <div className="updateLogoButton">{locale.editGroupLogo}</div>
                        <button className="deleteLogoButton" onClick={this.onDelGroupLogo.bind(this)}>{locale.delGroupLogo}</button>
                    </div>
                    {dialog}
                </div>);
    }
    
}


OperateGroupLogo.propTypes = {
    avatar: React.PropTypes.object,
    locale: React.PropTypes.object
};

