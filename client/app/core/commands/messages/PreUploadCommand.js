import ApiConfig from '../../constants/ApiConfig';
import AppDataHandler from '../../datarequest/AppDataHandlerMixin';

function PreUploadCommand(fileCacheGetter){

    return function(file) {

        var fileCache = fileCacheGetter();

        let owner = this.owner;
        let deferred = $.Deferred();
        let start = 0;
        let end = 0;
        if (file.size > 5242880) {
            start = 2097152;
            end = 3145728;
        }

        let promise = null;
        if (start > 0 && end > 0) {
            promise = owner.md5File(file, start, end);
        } else {
            promise = owner.md5File(file);
        }

        promise.then(function (md5) {
            AppDataHandler.doRequest({
                ensureRetAsTrue: false,
                method: 'get',
                'body': {},
                'url': ApiConfig.upload.getLastChunkIdx + '?uuid=' + md5,
                'dataType': 'formdata',
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(function (response) {
                if (response.code === 200 && response.finish) {
                    owner.skipFile(file);
                } else {
                    if (response.data != null) {
                        for (var i = 0; i < response.data.length; i++) {
                            fileCache[file.id + ':' + response.data[i].md5] = true;
                        }
                    }
                }
                deferred.resolve();
            });
        });
        return deferred.promise();
    }
}


module.exports = PreUploadCommand;
