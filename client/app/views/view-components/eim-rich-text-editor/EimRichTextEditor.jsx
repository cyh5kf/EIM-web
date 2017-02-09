import React from 'react';
import _ from 'underscore';
import RichTextEditor from '../../../components/rich-text-editor/RichTextEditor';
import WebUploaderConfig from '../../../core/constants/WebUploaderConfig';
import WebUploaderWrapper from '../../../components/webuploader/WebUploaderWrapper';
import Loading from '../../../components/loading/Loading';
import {imgToDataUrl, dataUrlToBlob} from '../../../utils/FileUtils';
import ApiConfig from '../../../core/constants/ApiConfig';
import PreUploadCommand from '../../../core/commands/messages/PreUploadCommand';
import SkipUploadChunkCommand from '../../../core/commands/messages/SkipUploadChunkCommand';

import './EimRichTextEditor.less';

class RichTextImgUploader extends WebUploaderWrapper {
    initUploader() {
        this.ChunkCache = {};
        super.initUploader({
            registerHooks: [
                {'before-send-file': new PreUploadCommand(this.ChunkCache)},
                {'before-send':new SkipUploadChunkCommand(this.ChunkCache, 'rte')}
            ]
        });
    }
}

export default class EimRichTextEditor extends RichTextEditor {
    constructor() {
        super(...arguments);
        this.uploadConfig = _.extend(WebUploaderConfig.getBaseImage(), {
            server: ApiConfig.upload.base,
            pick: {
                id: '#rte-uploader',
                multiple: false
            }
        });
    }

    componentWillMount() {
        super.componentWillMount(...arguments);
        this.setState({uploadingImage: false});
    }

    getEditorHtml() {
        const notUploadedImgs = [].slice.apply(this._editor.container.querySelectorAll('img[src^="blob:"]'));
        let promise = Promise.resolve();
        if (notUploadedImgs.length) {
            this.setState({uploadingImage: true});
            promise = promise.then(() => {
                return Promise.all(notUploadedImgs.map(img => imgToDataUrl(img.src)))
                    .then(dataUrls => new Promise((resolve, reject) => {
                        let rejected = false;
                        const uploader = this.refs.uploader.uploader;
                        uploader.reset();
                        dataUrls.map(dataUrlToBlob).forEach(fileBlob => {
                            uploader.addFile(fileBlob);
                        });

                        const uploadingFiles = uploader.getFiles();
                        uploader.onUploadError = (file, reason) => {
                            reject(reason);
                            rejected = true;
                        };
                        uploader.onUploadSuccess = (file, response) => {
                            const url = response.data.url.replace(/http:\/\/rd.icoco.com/gi, ApiConfig.upload.download);
                            notUploadedImgs[uploadingFiles.indexOf(file)].src = url;
                        };
                        uploader.onUploadFinished = () => {
                            if (!rejected) {
                                resolve();
                            }
                        };
                        uploader.upload();
                    }));
            })
                .finally(() => this.setState({uploadingImage: false}));
        }

        return promise.then(() => super.getEditorHtml());
    }

    renderExtra() {
        const {uploadingImage} = this.state;
        return (
            <span>
                <RichTextImgUploader config={this.uploadConfig} ref="uploader"/>
                {uploadingImage && <Loading className="loading-images" type="spokes" width={100}/>}
            </span>
        );
    }
}
