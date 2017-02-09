import Blob from 'blob';

export function imgToDataUrl(src, imgType = 'image/png') {
    return new Promise((resolve, reject) => {
        const img = new Image();
        // Add CORS approval to prevent a tainted canvas
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            let canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL(imgType));
            canvas = ctx = null;
        };
        img.onerror = () => reject('解析图片失败');

        // load img
        img.src = src;
        if (img.complete || img.complete === undefined) {
            // flush cache to ensure "img.onload" triggered
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
            img.src = src;
        }
    });
}

function _binaryStringToArrayBuffer(binary) {
    var length = binary.length;
    var buf = new ArrayBuffer(length);
    var arr = new Uint8Array(buf);
    var i = -1;
    while (++i < length) {
        arr[i] = binary.charCodeAt(i);
    }
    return buf;
}

export function dataUrlToBlob(dataUrl) {
    let type = dataUrl.match(/data:([^;]+)/)[1];
    let base64 = dataUrl.replace(/^[^,]+,/, '');
    return base64ToBlob(base64, type);
}

export function base64ToBlob(base64, type = null) {
    let parts = [_binaryStringToArrayBuffer(atob(base64))];
    return type ? new Blob(parts, {type: type}) : new Blob(parts);
}

export function createObjectURL(blob) {
    return (window.URL || window.webkitURL).createObjectURL(blob);
}
