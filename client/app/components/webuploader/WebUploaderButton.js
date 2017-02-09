import {PropTypes}from 'react';
import gGlobalEventBus from '../../core/dispatcher/GlobalEventBus';
import gSocketManager, {SOCKET_EVENTS} from '../../core/gSocketManager';
import PreUploadCommand from './../../core/commands/messages/PreUploadCommand';
import SkipUploadChunkCommand from './../../core/commands/messages/SkipUploadChunkCommand';
import WebUploaderWrapper from './WebUploaderWrapper';
import _ from 'underscore';
import WebUploaderConfig from '../../core/constants/WebUploaderConfig';
import ApiConfig from '../../core/constants/ApiConfig';

import './webuploader.less';

export const FILE_UPLOAD_EVENT = {
    FILE_UPLOAD_COMPLETE: 'Complete',
    FILE_UPLOAD_ERROR: 'Error',
    FILE_UPLOAD_SUCCESS: 'Success',
    FILE_UPLOAD_IN_QUEUE: 'Queue',
    FILES_UPLOAD_IN_QUEUE: 'FilesQueue',
    FILE_UPLOAD_IN_PROGRESS: 'Progress',
    FILE_UPLOAD_STOP: 'Stop',
    FILE_UPLOAD_START: 'Start'
};

export function getFileUploadEventName(prefix, eventType) {
    return prefix + ":" + eventType;
}

function postGlobalMessage(eventName, data, _this) {
    var eventPrefix = _this.props.eventPrefix;
    gGlobalEventBus.emit(getFileUploadEventName(eventPrefix, eventName), data);
}

export default class WebUploaderButton extends WebUploaderWrapper {


    static propTypes = {
        onBeforeFileQueued: PropTypes.func,
        onUploadProgress: PropTypes.func,
        onFileQueued: PropTypes.func,
        onStopUpload: PropTypes.func,
        onFilesQueued: PropTypes.func,
        onUploadError: PropTypes.func,
        onUploadSuccess: PropTypes.func,
        onUploadComplete: PropTypes.func,
        className: PropTypes.string,
        eventPrefix: PropTypes.string.isRequired,
        configName: PropTypes.string
    };

    constructor(props) {
        var webUploaderId = _.uniqueId("WebUploaderButton");

        var webUploaderConfig = WebUploaderConfig.getBase();
        var configName = props.configName;
        if (configName && configName.length > 0) {
            webUploaderConfig = WebUploaderConfig[configName]();
        }

        webUploaderConfig.server = ApiConfig.upload.base;
        webUploaderConfig.pick.id = '#' + webUploaderId;
        webUploaderConfig.paste = document.body;
        super(props, webUploaderConfig, webUploaderId, 'webuploader-button');
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.paste !== nextProps.paste) {
            this.uploader.togglePaste(nextProps.paste);
        }
    }

    initUploader() {
        var that = this;
        that.ChunkCache = {};
        super.initUploader({
            registerHooks: [
                {
                    'before-send-file': new PreUploadCommand(function () {
                        return that.ChunkCache;
                    })
                },
                {
                    'before-send': new SkipUploadChunkCommand(that.ChunkCache)
                },
                {
                    'after-send-file': function (file) {
                        console.log('all sent');
                    }
                }
            ]
        });
    }

    componentDidMount() {
        super.componentDidMount();
        gSocketManager.addEventListener(SOCKET_EVENTS.ON_OPEN, this.onWebsocketOpen);
    }

    componentWillUnmount() {
        super.componentWillUnmount(...arguments);
        gSocketManager.removeEventListener(SOCKET_EVENTS.ON_OPEN, this.onWebsocketOpen);
    }

    //should retry upload files
    onWebsocketOpen = (isOpen)=> {
        if (this.uploader) {
            this.uploader.retry();
        }
    };


    onUploadStart(file) {
        super.onUploadStart(file);
        postGlobalMessage(FILE_UPLOAD_EVENT.FILE_UPLOAD_START, file, this);
    }

    onFileDequeued(file) {
        super.onFileDequeued(file);
        postGlobalMessage(FILE_UPLOAD_EVENT.FILE_UPLOAD_STOP, file, this);
    }

    onFilesQueued(files) {
        super.onFilesQueued(files);
        postGlobalMessage(FILE_UPLOAD_EVENT.FILES_UPLOAD_IN_QUEUE, files, this);
    }


    onFileQueued(file) {
        super.onFileQueued(file);
        postGlobalMessage(FILE_UPLOAD_EVENT.FILE_UPLOAD_IN_QUEUE, file, this);
    }

    onUploadProgress(file, percentage) {
        super.onUploadProgress(file, percentage);
        postGlobalMessage(FILE_UPLOAD_EVENT.FILE_UPLOAD_IN_PROGRESS, [file, percentage, this.uploader], this);
    }

    onUploadError(file, reason) {
        if ((file.getStatus() === 'error' || file.getStatus() === 'interrupt')) {
            this.uploader.retry();
        }
        super.onUploadError(file, reason);
        postGlobalMessage(FILE_UPLOAD_EVENT.FILE_UPLOAD_ERROR, [file, reason], this);

    }

    onUploadComplete(file,response) {
        super.onUploadComplete(file);
        postGlobalMessage(FILE_UPLOAD_EVENT.FILE_UPLOAD_COMPLETE, [file, response], this);
        let fileQueue = this.uploader.getFiles('queued');
        if (fileQueue.length === 0) {
            this.uploader.reset();
        }
    }

    onUploadSuccess(file, response) {
        super.onUploadSuccess(file, response);
        postGlobalMessage(FILE_UPLOAD_EVENT.FILE_UPLOAD_SUCCESS, [file, response], this);

        let fileQueue = this.uploader.getFiles('queued');
        if (fileQueue.length === 0) {
            this.uploader.reset();
        }
    }

}
