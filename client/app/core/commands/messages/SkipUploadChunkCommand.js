import _ from 'underscore';

function SkipUploadChunkCommand(filecache) {

    let fileid = null;
    let filemd5 = null;

    return function (block) {
        var blob = block.blob,
            deferred = $.Deferred();
        var me = this;

        var file = block.file;

        var redomd5 = false;
        if (fileid == null || fileid !== file.id) {
            fileid = file.id;
            redomd5 = true;
        }
        //improve performance, only call once time
        if (redomd5) {
            let start = 0;
            let end = 0;
            if (file.size > 5242880) {
                start = 2097152;
                end = 3145728;
            }
            let promise = null;
            if (start > 0 && end > 0) {
                promise = this.owner.md5File(file, start, end);
            } else {
                promise = this.owner.md5File(file);
            }

            promise.then(function (md5file) {
                filemd5 = md5file;
                me.owner.md5File(blob).fail(function () {
                    deferred.reject();
                }).then(function (md5) {
                    if (filecache[file.id + ':' + md5]) {
                        deferred.reject();
                    } else {

                        // 读取md5出错的话，分片不能跳过。
                        let imgwidth = 0, imgheight = 0;
                        let filetype = 'binary';

                        if ('image/png, image/jpeg, image/bmp, image/gif'.indexOf(file.type) > -1) {
                            filetype = 'image';
                            imgwidth = file._info.width;
                            imgheight = file._info.height;
                        }
                        else if ('audio/amr, audio/mpeg,audio/midi'.indexOf(file.type) > -1) {
                            filetype = 'audio';
                        }
                        else if ('video/mpeg, video/quicktime'.indexOf(file.type) > -1) {
                            filetype = 'video';
                        }

                        if (filetype === 'avatar' || filetype === 'image') {
                            imgwidth = file._info.width;
                            imgheight = file._info.height;
                        }

                        let formData = {
                            filetype: filetype,
                            filemd5: filemd5,
                            chunkmd5: md5
                        };

                        if (imgwidth > 0) {
                            formData = _.extend(formData, {imgwidth: imgwidth, imgheight: imgheight});
                        }
                        //上传参数
                        me.options.formData = formData;
                        deferred.resolve();
                    }

                });
            });
        } else {
            me.owner.md5File(blob).fail(function () {
                deferred.reject();
            }).then(function (md5) {
                if (filecache[file.id + ':' + md5]) {
                    deferred.reject();
                } else {
                    // 读取md5出错的话，分片不能跳过。
                    let imgwidth = 0, imgheight = 0;
                    let filetype = 'binary';

                    if ('image/png, image/jpeg, image/bmp, image/gif'.indexOf(file.type) > -1) {
                        filetype = 'image';
                        imgwidth = file._info.width;
                        imgheight = file._info.height;
                    }
                    else if ('audio/amr, audio/mpeg,audio/midi'.indexOf(file.type) > -1) {
                        filetype = 'audio';
                    }
                    else if ('video/mpeg, video/quicktime'.indexOf(file.type) > -1) {
                        filetype = 'video';
                    }

                    if (filetype === 'avatar') {
                        imgwidth = file._info.width;
                        imgheight = file._info.height;
                    }

                    let formData = {filetype: filetype, filemd5: filemd5, chunkmd5: md5};
                    if (imgwidth > 0) {
                        formData = _.extend(formData, {imgwidth: imgwidth, imgheight: imgheight});
                    }
                    //上传参数
                    me.options.formData = formData;
                    deferred.resolve();
                }
            });
        }
        return deferred.promise();
    }
}

module.exports = SkipUploadChunkCommand;
