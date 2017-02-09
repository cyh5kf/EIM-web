import _ from 'underscore';

const BaseConfig = () => ({
    auto: false,
    server: 'http://127.0.0.1:8080/file/webupload',
    pick:{id:'.filePicker', multiple: true},
    sendAsBinary: true,
    prepareNextFile: true,
    threads:1,
    chunked:true,
    timeout:2*60*1000,
    chunkSize:524288,//512k
    fileNumLimit:50,
    fileSizeLimit:1073741824,
    fileSingleSizeLimit:1073741824,
    duplicate:true,
    formData:{},

    withCredentials: false
});

const ImageConfig = () => ({
    accept:{
        title: 'Images',
        extensions: 'gif,jpg,jpeg,bmp,png',
        mimeTypes: 'image/*'
    }
});

const Thumb = () => ({
    thumb:{
        width: 276,
        height: 276,

        // 图片质量，只有type为`image/jpeg`的时候才有效。
        quality: 70,

        // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
        allowMagnify: false,

        // 是否允许裁剪。
        crop: true,

        // 为空的话则保留原有图片格式。
        // 否则强制转换成指定的类型。
        type: 'image/jpeg'
    }
});

const Compress = () => ({
    compress:{
        width: 1600,
        height: 1600,
        // 图片质量，只有type为`image/jpeg`的时候才有效。
        quality: 90,

        // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
        allowMagnify: false,

        // 是否允许裁剪。
        crop: true,

        // 是否保留头部meta信息。
        preserveHeaders: true,

        // 如果发现压缩后文件大小比原来还大，则使用原来图片
        // 此属性可能会影响图片自动纠正功能
        noCompressIfLarger: false,

        // 单位字节，如果图片大小小于此值，不会采用压缩。
        compressSize: 0
    }
});

export default {
    getBase:function(){
        return _.extend(BaseConfig());
    },

    getBaseImage: function(){
        return _.extend(BaseConfig(), ImageConfig());
    },

    getImageWithThumb: function(){
        return _.extend(BaseConfig(), ImageConfig(), Thumb());
    },

    getImageWithCompress: function(){
        return _.extend(BaseConfig(), ImageConfig(), Compress());
    },

    getImageWithCompressAndThumb: function(){
        return _.extend(BaseConfig(), ImageConfig(), Compress(), Thumb());
    }
}

