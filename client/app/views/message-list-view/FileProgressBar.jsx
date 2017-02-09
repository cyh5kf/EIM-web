import React, {PropTypes}from 'react';
import ProgressBar from 'react-bootstrap/lib/ProgressBar';
import gGlobalEventBus from '../../core/dispatcher/GlobalEventBus';
import StringUtils from '../../utils/StringUtils';
import {FILE_UPLOAD_EVENT} from '../../components/webuploader/WebUploaderButton';

function getEventName(eventName) {
    return "onmessagefile:" + eventName;
}

export default class FileProgressBar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {file: null, progress: 0, hidden: true, title: ''};
    }

    static propTypes = {
        onCancelFile: PropTypes.func
    };


    componentDidMount() {

        gGlobalEventBus.addEventListener(getEventName(FILE_UPLOAD_EVENT.FILE_UPLOAD_COMPLETE), this.onUploadComplete);
        gGlobalEventBus.addEventListener(getEventName(FILE_UPLOAD_EVENT.FILE_UPLOAD_START), this.onStartUpload);
        gGlobalEventBus.addEventListener(getEventName(FILE_UPLOAD_EVENT.FILE_UPLOAD_STOP), this.onStopUpload);
        gGlobalEventBus.addEventListener(getEventName(FILE_UPLOAD_EVENT.FILE_UPLOAD_IN_PROGRESS), this.onUploadProgress);
        gGlobalEventBus.addEventListener(getEventName(FILE_UPLOAD_EVENT.FILE_UPLOAD_ERROR), this.onUploadError);
        gGlobalEventBus.addEventListener(getEventName(FILE_UPLOAD_EVENT.FILE_UPLOAD_SUCCESS), this.onUploadComplete);
    }

    componentWillUnmount() {
        gGlobalEventBus.removeEventListener(getEventName(FILE_UPLOAD_EVENT.FILE_UPLOAD_COMPLETE), this.onUploadComplete);
        gGlobalEventBus.removeEventListener(getEventName(FILE_UPLOAD_EVENT.FILE_UPLOAD_START), this.onStartUpload);
        gGlobalEventBus.removeEventListener(getEventName(FILE_UPLOAD_EVENT.FILE_UPLOAD_STOP), this.onStopUpload);
        gGlobalEventBus.removeEventListener(getEventName(FILE_UPLOAD_EVENT.FILE_UPLOAD_IN_PROGRESS), this.onUploadProgress);
        gGlobalEventBus.removeEventListener(getEventName(FILE_UPLOAD_EVENT.FILE_UPLOAD_ERROR), this.onUploadError);
        gGlobalEventBus.removeEventListener(getEventName(FILE_UPLOAD_EVENT.FILE_UPLOAD_SUCCESS), this.onUploadComplete);
    }

    onStartUpload = (file)=> {
        let title = StringUtils.format(this.props.locale.Progress, file.name, '0%');
        this.setState({progress: 0, bstyle: 'info', title: title, hidden: false});
    }

    onStopUpload = (file)=> {
        setTimeout(()=> {
            this.setState({hidden: true});
        }, 500);
    }

    onUploadComplete = (file)=> {
        this.finishUpload(file[0]);
    }

    onUploadError = (info)=> {
        this.finishUpload(info[0]);
    }

    cancelFile = ()=> {
        if (this.props.onCancelFile) {
            this.props.onCancelFile(this.state.file);
            this.setState({
                progress: 100,
                bstyle: 'danger',
                title: StringUtils.format(this.props.locale.Cancel, this.state.file.name)
            });
        }
    }

    finishUpload(file) {
        this.setState({file: file, hidden: true});
    }

    onUploadProgress = (info)=> {

        let fileSize = info[2].getFiles().length, remain = fileSize - info[2].getFiles('queued').length;
        let title = null;
        if (fileSize > 1) {
            title = StringUtils.format(this.props.locale.ProgressMulti, info[0].name, Math.round(info[1] * 100) + '%', remain, fileSize);
        } else {
            title = StringUtils.format(this.props.locale.Progress, info[0].name, Math.round(info[1] * 100) + '%');
        }
        this.setState({progress: info[1] * 100, file: info[0], hidden: false, bstyle: 'info', title: title});
    }

    render() {
        let cancelBtn = null;
        if (this.state.bstyle === 'info') {
            cancelBtn = <a href="javascript:void(0)" onClick={this.cancelFile}
                           className="progress-cancel-btn">{this.props.locale.CancelLabel}</a>
        }

        let bar = <div className="progressbar">
            <span className="progressbar-title">{this.state.title}</span>
            <ProgressBar bsStyle={this.state.bstyle} ref="progressbar" active now={this.state.progress}/>
            {cancelBtn}
        </div>;

        return <div className={this.state.hidden?"hidden":""}>

            {
                !this.state.hidden && bar
            }

        </div>;
    }
}
