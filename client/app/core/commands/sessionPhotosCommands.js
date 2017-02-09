import {createCommand} from '../../utils/command';
import {SessionPhotoListSchema, DisplayStatusSchema} from '../schemas/SessionPhotosSchemas';
import {createImmutableSchemaData} from '../../utils/schema';
import AppDataHandler from '../datarequest/AppDataHandlerMixin';
import ApiConfig from '../constants/ApiConfig';
import LoginStore from '../stores/LoginStore';
import SessionPhotosStore from '../stores/SessionPhotosStore';

const DEFAULT_QUERY_LIMIT = 20,
    PREFETCH_THRESHOLD = 5; // 当移动方向剩余不足指定值时, 提前预取

function querySessionPhotos({sessionid, sessiontype, begintime = null, endtime = null, forward = true, limit = DEFAULT_QUERY_LIMIT}) {
    const ascending = !!forward;
    return AppDataHandler.doRequest({
        ensureRetAsTrue: true,
        body: {
            smd: 'msgsync.querySessionResource',
            uid: LoginStore.getUID(),
            sessionType: sessiontype,
            sessionId: sessionid,
            beginTime: begintime == null ? undefined : begintime,
            endTime: endtime == null ? undefined : endtime,
            asc: ascending,
            limit: limit,
            fileType: 'image'
        },
        url: ApiConfig.rpc
    }).then(({data: {sessionResource}}) => {
        return createImmutableSchemaData(SessionPhotoListSchema, (ascending ? sessionResource : sessionResource.reverse()).map(item => {
            return {
                ...item,
                username: item.userInfo.userName,
                avatar: item.userInfo.avatar
            };
        }));
    });
}
const photoEqual = (photo, anotherPhoto) => photo.resource.resourceid === anotherPhoto.resource.resourceid;

function queryPhotosForward({sessionid, sessiontype}) {
    const rightSidePhoto = SessionPhotosStore.getSessionPhotos().last(),
        {resource: {gmtcreate, clientSendTime}} = rightSidePhoto,
        hasServerTime = gmtcreate != null,
        limit = hasServerTime ? DEFAULT_QUERY_LIMIT : 40, // 如果没有准确的查询时间, 则设置limit足够大以在多余查询中能获取到有效数据
        begintime = (hasServerTime ? gmtcreate : clientSendTime) + 1;
    return querySessionPhotos({limit, begintime, sessionid, sessiontype, forward: true}).then(newPhotos => {
        const filteredPhotos = hasServerTime ? newPhotos : newPhotos.slice(newPhotos.findIndex(photoEqual.bind(null, rightSidePhoto)) + 1);
        SessionPhotosStore.updateSessionPhotos(photos => photos.concat(filteredPhotos));
        if (newPhotos.size < DEFAULT_QUERY_LIMIT) {
            SessionPhotosStore.updateStatus(status => status.set('noPhotosForward', true));
        }
    });
}

function queryPhotosBackward({sessionid, sessiontype}) {
    const leftSidePhoto = SessionPhotosStore.getSessionPhotos().first(),
        {resource: {gmtcreate}} = leftSidePhoto,
        hasServerTime = gmtcreate != null,
        limit = hasServerTime? DEFAULT_QUERY_LIMIT : 100, // 如果没有准确的查询时间, 则设置limit足够大以在多余查询中能获取到有效数据
        endtime = hasServerTime ? gmtcreate -1 : Date.now();
    return querySessionPhotos({limit, endtime, sessionid, sessiontype, forward: false}).then(newPhotos => {
        const filteredPhotos = hasServerTime ? newPhotos : newPhotos.takeUntil(photoEqual.bind(null, leftSidePhoto));
        SessionPhotosStore.updateSessionPhotos(photos => filteredPhotos.concat(photos));
        SessionPhotosStore.updateStatus(status => status.update('zeroOrderIndex', zeroOrderIndex => zeroOrderIndex + filteredPhotos.size));
        if (newPhotos.size < limit) {
            SessionPhotosStore.updateStatus(status => status.set('noPhotosBackward', true));
        }
    });
}

export const initCurrentSessionPhotoCmd = createCommand(function ({fileMsg}) {

    SessionPhotosStore.updateSessionPhotos(() => createImmutableSchemaData(SessionPhotoListSchema, [{
        resource: {
            uploaderuid: fileMsg.senderuid,
            resourceid: fileMsg.resourceid,
            resfile: {
                filetype: fileMsg.filetype,
                filename: fileMsg.filename,
                fileurl: fileMsg.fileurl,
                filesize: fileMsg.filesize
            },

            gmtcreate: fileMsg.gmtcreate,
            clientSendTime: fileMsg.clientSendTime
        },
        username: fileMsg.sendername != null ? fileMsg.sendername : fileMsg.username,
        avatar: fileMsg.senderavatar || ''
    }]));
    SessionPhotosStore.updateStatus(() => createImmutableSchemaData(DisplayStatusSchema, {
        displayOrder: 0,
        zeroOrderIndex: 0,
        noPhotosForward: false,
        noPhotosBackward: false
    }));

    SessionPhotosStore.emit('change');
}, {
    name: 'sessionPhotos.initCurrentSessionPhotoCmd'
});

export const moveDisplayOrderCmd = createCommand(function ({isLoadingPhotos, sessionid, sessiontype, forward = true}) {
    const emitChange = () => SessionPhotosStore.emit('change');
    SessionPhotosStore.updateStatus(status => status.update('displayOrder', displayOrder => forward ? (displayOrder + 1) : (displayOrder - 1)));
    emitChange();

    const {displayOrder, zeroOrderIndex, noPhotosForward, noPhotosBackward} = SessionPhotosStore.getStatus(),
        latestDisplayIdx = displayOrder + zeroOrderIndex,
        photos = SessionPhotosStore.getSessionPhotos();
    if (!isLoadingPhotos) {
        if (forward && !noPhotosForward && photos.size - 1 < latestDisplayIdx + PREFETCH_THRESHOLD) {
            return queryPhotosForward({sessionid, sessiontype}).then(emitChange);
        } else if (!forward && !noPhotosBackward && latestDisplayIdx - PREFETCH_THRESHOLD < 0) {
            return queryPhotosBackward({sessionid, sessiontype}).then(emitChange);
        }
    }
}, {
    name: 'sessionPhotos.moveDisplayOrderCmd',
    getCmdKey: ({forward = true}) => forward ? 'forward' : 'backward'
});
