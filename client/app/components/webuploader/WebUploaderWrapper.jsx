import React, {PropTypes} from 'react';
import _ from 'underscore';
import classnames from '../../utils/ClassNameUtils';

import './webuploader.less'

export default class WebUploaderWrapper extends React.Component {
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
        config: PropTypes.object.isRequired
    };

    constructor(props,defaultConfig,webUploaderId,className) {
        super(...arguments);
        this.defaultConfig = defaultConfig;
        this.webUploaderId = webUploaderId;
        this.className = className;
    }

    initUploader({registerHooks = []} = {}) {
        const hookNames = [];
        registerHooks.forEach(hook => {
            const hookName = _.uniqueId('hook_');
            WebUploader.Uploader.register({
                ...hook,
                name: hookName
            });
            hookNames.push(hookName);
        });

        this.uploader = WebUploader.create(this.props.config || this.defaultConfig);

        hookNames.forEach(hookName => WebUploader.Uploader.unRegister(hookName));

        this.uploader.on('beforeFileQueued', this.onBeforeFileQueued.bind(this));
        this.uploader.on('fileQueued', this.onFileQueued.bind(this));
        this.uploader.on('uploadStart', this.onUploadStart.bind(this));

        this.uploader.on('filesQueued', this.onFilesQueued.bind(this));
        this.uploader.on('fileDequeued', this.onFileDequeued.bind(this));
        this.uploader.on('uploadProgress', this.onUploadProgress.bind(this));
        this.uploader.on('uploadSuccess', this.onUploadSuccess.bind(this));
        this.uploader.on('uploadError', this.onUploadError.bind(this));
        this.uploader.on('uploadComplete', this.onUploadComplete.bind(this));
        this.uploader.on('stopUpload', this.onStopUpload.bind(this));
    }

    componentDidMount(){
        this.initUploader();
    }

    componentWillUnmount() {
        this.uploader.destroy();
        this.uploader = null;
    }

    getFile(){
        return this.uploader.getFiles()[0];
    }

    makeThumb(){
        this.uploader.makeThumb(...arguments);
    }

    startUpload(){
        this.uploader.upload();
    }

    onUploadStart(file){
        if(this.props.onStartUpload){
            this.props.onStartUpload(file);
        }
    }

    onFileDequeued(file){
        if(this.props.onStopUpload){
            this.props.onStopUpload(file);
        }
    }

    cancelUpload(fileId){
        this.uploader.cancelFile(fileId);
    }

    onStopUpload(file){
        if(this.props.onStopUpload){
            this.props.onStopUpload(file);
        }
    }

    removeFile(file, popFromQueue){
        this.uploader.removeFile(file, popFromQueue);
    }

    onBeforeFileQueued(file){
        if(this.props.onBeforeFileQueued){
            this.props.onBeforeFileQueued(file);
        }
    }

    onUploadProgress(file, percentage){
        if(this.props.onUploadProgress){
            this.props.onUploadProgress(file, percentage);
        }
    }

    onUploadError(file, reason){
        if(this.props.onUploadError){
            this.props.onUploadError(file, reason);
        }
    }

    onUploadComplete(file){
        if(this.props.onUploadComplete){
            this.props.onUploadComplete(file);
        }
    }

    onUploadSuccess(file, response){
        if(this.props.onUploadSuccess){
            this.props.onUploadSuccess(file, response);
        }
    }

    onFileQueued(file){
        if(this.props.onFileQueued){
            this.props.onFileQueued(file);
        }
    }

    onFilesQueued(files){
         if(this.props.onFilesQueued){
            this.props.onFilesQueued(files);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        //不允许重绘DOM
        return false;
    }

    render(){
        var children =  this.props.children;
        return (
            <div className={classnames(this.className || "webuploader", this.props.className)} id={this.webUploaderId}>
                {children}
            </div>
        );
    }
}
