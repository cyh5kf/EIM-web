
import gGlobalEventBus from '../../../../core/dispatcher/GlobalEventBus';
import PreUploadCommand from '../../../../core/commands/messages/PreUploadCommand';
import SkipUploadChunkCommand from '../../../../core/commands/messages/SkipUploadChunkCommand';
import WebUploaderWrapper from '../../../../components/webuploader/WebUploaderWrapper';

export const LogoUploaderEventTypes = {
    FILE_UPLOAD_COMPLETE:'onAvatarComplete:Complete',
    FILE_UPLOAD_ERROR:'onAvatarError:Error',
    FILE_UPLOAD_SUCCESS:'onAvatarSuccess:Success',
    FILE_UPLOAD_IN_QUEUE:'onAvatarQueue:Queue',
    FILE_UPLOAD_IN_PROGRESS:'onmAvatarProgress:Progress',
    FILE_UPLOAD_CROP:'onmAvatarCrop:Crop'
};

export default class GroupLogoUploader extends WebUploaderWrapper{
    constructor(props) {
        super(props);
    }

    initUploader() {
        this.ChunkCache = {};
        super.initUploader({
            registerHooks: [
                {'before-send-file': new PreUploadCommand(this.ChunkCache)},
                {'before-send':new SkipUploadChunkCommand(this.ChunkCache, 'avatar')},
                {
                    'after-send-file': function(file){
                        console.log('all sent');
                    }
                }
            ]
        });
    }

    onUploadProgress(file, percentage){
        super.onUploadProgress(file, percentage);
        gGlobalEventBus.emit(LogoUploaderEventTypes.FILE_UPLOAD_IN_PROGRESS, [file, percentage]);
    }

    onUploadError(file, reason){

        if((file.getStatus() === 'error' || file.getStatus() === 'interrupt')){
            this.uploader.retry();
        }
        super.onUploadError(file, reason);
        gGlobalEventBus.emit(LogoUploaderEventTypes.FILE_UPLOAD_ERROR, [file, reason]);
    }

    onUploadComplete(file){
        let fileQueue = this.uploader.getFiles('queued');
        if(fileQueue.length === 0){
            super.onUploadComplete(file);
        }
        gGlobalEventBus.emit(LogoUploaderEventTypes.FILE_UPLOAD_COMPLETE, file);
    }

    onUploadSuccess(file, response){
        let fileQueue = this.uploader.getFiles('queued');
        if(fileQueue.length === 0){
            this.uploader.removeFile(file.id);
        }
        super.onUploadSuccess(file, response);
        gGlobalEventBus.emit(LogoUploaderEventTypes.FILE_UPLOAD_SUCCESS, [file, response]);
    }
}
