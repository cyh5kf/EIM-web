import React, {PropTypes}from 'react';
import _ from 'underscore';
import PureRenderComponent from '../../../components/PureRenderComponent';
import WebUploaderButton,{getFileUploadEventName,FILE_UPLOAD_EVENT} from '../../../components/webuploader/WebUploaderButton';
import AvatarCropper from './AvatarCropper';
import gGlobalEventBus from '../../../core/dispatcher/GlobalEventBus';
import './AvatarEditor.less';

const UPLOADER_EVENT_PREFIX = 'onAvatarFileMessage';

function getEventName(eventName) {
    return getFileUploadEventName(UPLOADER_EVENT_PREFIX, eventName);
}

export default class AvatarEditor extends PureRenderComponent {

    static propTypes = {
        className: PropTypes.string,
        editable: PropTypes.bool,
        avatar: PropTypes.string,
        onUpdate: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            showCropper: false,
            loadingCropper: false
        };
    }

    componentWillMount() {
        gGlobalEventBus.addEventListener(getEventName(FILE_UPLOAD_EVENT.FILE_UPLOAD_SUCCESS), this.onAvatarUploaded);
    }

    componentWillUnmount() {
        gGlobalEventBus.removeEventListener(getEventName(FILE_UPLOAD_EVENT.FILE_UPLOAD_SUCCESS), this.onAvatarUploaded);
    }

    onFileQueued(file) {
        var that = this;
        this.getUploader().makeThumb(file, function (error, ret) {
            that.setState({showCropper: true, thumb: ret});
        }, 382, 280);
    }

    onAvatarUploaded = (args)=> {
        var resp = args[1];
        var uploader = this.getUploader();
        var avatar = resp.data.url;
        var {onUpdate} = this.props;
        onUpdate({avatar: avatar});
        uploader.reset();
        this.setState({showCropper: false, loadingCropper: false});
    };

    onClickAvatarCropperBtn(oper, fileBlob, cropperData) {
        if (oper === 'cancel') {
            this.setState({showCropper: false, loadingCropper: false});
        }
        else if (oper === 'ok') {
            var uploader = this.getUploader();
            let file = uploader.getFiles()[0];
            uploader.removeFile(file.id, true);
            uploader.postCropFile(fileBlob);
            file._info = _.extend(file._info, cropperData);
            uploader.upload();
            this.setState({showCropper: true, loadingCropper: true});
        }
    }

    getUploader() {
        return this.refs['avatarUploader'].uploader;
    }

    render() {
        let {className="",editable,avatar} = this.props;
        let imageNode = avatar ? {"backgroundImage": `url('${avatar}')`} : {};

        return (
            <div className={`avatar-editor ${className}`}>

                <div className="displayAvatar" style={imageNode}></div>

                {!editable ? null :
                    <div className="avatar-editor-editable">
                        <WebUploaderButton ref="avatarUploader"
                                           className="select-avatar"
                                           eventPrefix={UPLOADER_EVENT_PREFIX}
                                           configName="getImageWithThumb"
                                           onFileQueued={file=>this.onFileQueued(file)}>
                            <div className="edit-label">
                                <span className="ficon_camera"></span>
                            </div>
                        </WebUploaderButton>
                        <AvatarCropper
                            thumb={this.state.thumb}
                            show={this.state.showCropper}
                            loading={this.state.loadingCropper}
                            onButtonClick={this.onClickAvatarCropperBtn.bind(this)}>
                        </AvatarCropper>
                    </div>
                }

            </div>
        );
    }


}