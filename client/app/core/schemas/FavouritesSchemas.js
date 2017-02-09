import {compile} from '../../utils/schema';

export const QueryStarredMsg = compile({
    isLastBatch: 'boolean',
    starredMsg: [{
        msg: {
            eventData: {
                textMsg: {
                    text: {
                        text: 'string'
                    }

                },
                fileMsg: {
                    file: {
                        createTime: 'number',
                        fileDesc: 'string',
                        fileName: 'string',
                        fileSize: 'number',
                        fileType: 'string',
                        fileUrl: 'string',
                        modifyTime: 'number'
                    }
                },
                __options: {
                    notRequired: ['fileMsg', 'textMsg']
                }
            },
            eventType: 'number',
            sessionType: 'number',
            sessionId: 'string',
            groupInfo: {
                groupName: 'string'
            },
            modifyTime: 'number',
            msgSrvTime: 'number',
            msgUuid: 'string',
            userInfo: {
                avatar: 'string',
                userName: 'string'
            },
            __options: {
                notRequired: ['groupInfo']
            }
        },
        starredTime: 'number'
    }],
    __options: {
        notRequired: ['starredMsg']
    }
});
