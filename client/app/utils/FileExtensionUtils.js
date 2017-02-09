export function isPicture(filedesc){
    const file = filedesc;

    if (file) {
        if (file.substr(0,6).toLowerCase() === 'image/') {
            return true;
        }
    }

    return false;
}

const _checkExts = (fileurl, extensions) => extensions.some(ext => fileurl.endsWith(ext));
export function fileTypeByUrl(fileurl){
    fileurl = fileurl.toLowerCase();

    if (fileurl) {
        if (isPictureByUrl(fileurl)) {
            return 'fileicon-image';
        } else if(_checkExts(fileurl, ['.doc', '.docx'])){
            return 'fileicon-word';
        } else if (_checkExts(fileurl, ['.xls', '.xlsx'])) {
            return 'fileicon-excel';
        } else if (_checkExts(fileurl, ['.ppt', '.pptx'])) {
            return 'fileicon-ppt';
        } else if (_checkExts(fileurl, ['.pdf'])) {
            return 'fileicon-pdf';
        } else if (_checkExts(fileurl, ['.mp3'])) {
            return 'fileicon-mp3';
        }
    }

    return 'fileicon-zip';
}

export function isPictureByUrl(fileurl){
    if (fileurl) {
        return _checkExts(fileurl.toLowerCase(), ['.jpg', '.jpeg', '.png', '.bmp', '.gif']);
    }
    
    return false;
}

export function getPreviewUrl(fileurl){
    const file = fileurl;
    if(isPictureByUrl(fileurl)){
        let dotIdx = fileurl.lastIndexOf('.');
        let type = fileurl.substr(dotIdx).toLowerCase();
        let name = file.substr(0, dotIdx);
        return name + "_160x160" + type;
    }
    return fileurl;  
}

export function getDownloadUrl(fileurl){
    let httpIndex = fileurl.indexOf('/perm');
    let prefix = fileurl.substring(0, httpIndex);
    return prefix + '/download' + fileurl.substring(httpIndex);
}

export function fileSizeToString(filesize){
    let sizeString = '';
    let size = parseInt(filesize);
    if(size < 1024){
        sizeString = size + " B";
    }
    else if(size < 1024 * 1024){
        sizeString = Math.round(size/1024) + " KB";
    }
    else{
        sizeString = Math.round(size/(1024*1024))+ " MB";
    }
    return sizeString;
}
    
