import {compile} from '../../utils/schema';

export const SessionPhotoSchema = compile({
    resource: {
        __options: {
            notRequired: ['clientSendTime']
        },
        uploaderuid: 'string | maybeSourceKey: "uploaderUid"',
        resourceid: 'string | maybeSourceKey: "resourceId"',
        resfile: {
            filetype: 'string | maybeSourceKey: "fileType"',
            filename: 'string | maybeSourceKey: "fileName"',
            fileurl: 'string | maybeSourceKey: "fileUrl"',
            filesize: 'number | maybeSourceKey: "fileSize"',
            __options: {
                maybeSourceKey: 'resFile'
            }
        },
        gmtcreate: 'number | maybeSourceKey: "createTime"',
        clientSendTime: 'number' // 客户端自定义关键字, 本地发送时间
    },
    username: 'string',
    avatar: 'string',

    __options: {
        title: 'SessionPhotoSchema'
    }
});

export const SessionPhotoListSchema = compile([SessionPhotoSchema]);

export const DisplayStatusSchema = compile({
    displayOrder: 'number',
    zeroOrderIndex: 'number',
    noPhotosForward: 'boolean',
    noPhotosBackward: 'boolean',

    __options: {
        title: 'DisplayStatusSchema'
    }
});
