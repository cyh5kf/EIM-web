import LoginStore from '../../stores/LoginStore';
import ApiConfig from '../../constants/ApiConfig';
import ChannelsStore from '../../stores/ChannelsStore';
import AppDataHandler from '../../datarequest/AppDataHandlerMixin';
import {MessageListSchema} from '../../schemas/MessageSchemas';
import {createCommand} from '../../../utils/command';
import {createImmutableSchemaData} from '../../../utils/schema';
import ObjectUtils from '../../../utils/ObjectUtils';

function normalizeMessagesData(messages) {
    messages = messages.map(msg => ObjectUtils.toLowercaseKeys(ObjectUtils.flattenObject(msg, {
        'userInfo.avatar': 'senderavatar',
        'userInfo.userName': 'sendername',
        'eventData.editMsgContent.newMsgContent': 'text'
    })));

    return messages;
}

function queryMsgs({sessionid, sessiontype, timestamp, limit, forward}) {
    const asc = forward;
    return AppDataHandler.doRequest({
        url: ApiConfig.rpc,
        body: {
            smd: 'msgsync.queryMsgList',
            uid: LoginStore.getUID(),
            sessionId: sessionid,
            sessionType: sessiontype,
            limit,
            asc,
            [forward ? 'beginTime' : 'endTime']: timestamp
        }
    }).then(response => {
        const msgs = response.data.msg || [];
        return {
            messages: createImmutableSchemaData(MessageListSchema, normalizeMessagesData(asc ? msgs : msgs.reverse())),
            hasMoreData: !response.data.isLastBatch
        };
    });
}

function queryMsgsAround({sessionid, sessiontype, timestamp, limit}) {
    return AppDataHandler.doRequest({
        url: ApiConfig.rpc,
        body: {
            smd: 'msgsync.queryMsgAround',
            uid: LoginStore.getUID(),
            midTime: timestamp,
            sessionId: sessionid,
            sessionType: sessiontype,
            limit
        }
    }).then(response => {
        return {
            messages: createImmutableSchemaData(MessageListSchema, normalizeMessagesData(response.data.msg || [])),
            hasMoreForwardData: !response.data.isPreviousLastBatch,
            hasMoreBackwardData: !response.data.isNextLastBatch
        };
    });
}

export const QUERY_DIRECTION = {
    FORWARD: 'forward',
    BACKWARD: 'backward',
    AROUND: 'around' // 查询时间点前后的消息
};

export default createCommand(function ({sessionid, sessiontype, timestamp, queryDirection, limit = 50, baseMsguuid = null}) {
    switch (queryDirection) {
        case QUERY_DIRECTION.FORWARD:
        case QUERY_DIRECTION.BACKWARD:
            return queryMsgs({
                sessionid,
                sessiontype,
                timestamp,
                limit: limit,
                forward: queryDirection === QUERY_DIRECTION.FORWARD
            })
                .then(({messages, hasMoreData}) => {
                    const channel = ChannelsStore.getChannel(sessionid);
                    if (channel) {
                        const forward = queryDirection === QUERY_DIRECTION.FORWARD;
                        channel.setChannelData({
                            [forward ? 'hasMoreForwardMsgs' : 'hasMoreBackwardMsgs']: hasMoreData
                        });
                        channel.onPushMessages(messages, {
                            isLoadingHistory: true,
                            loadingHistoryConfig: {msguuid: baseMsguuid, direction: forward ? 'forward' : 'backward'}
                        });
                    }
                });
        case QUERY_DIRECTION.AROUND:
            return queryMsgsAround({sessionid, sessiontype, timestamp, limit: limit})
                .then(({messages, hasMoreForwardData, hasMoreBackwardData}) => {
                    const channel = ChannelsStore.getChannel(sessionid);
                    if (channel) {
                        channel.setChannelData({
                            hasMoreForwardMsgs: hasMoreForwardData,
                            hasMoreBackwardMsgs: hasMoreBackwardData
                        });
                        channel.onPushMessages(messages, {
                            isLoadingHistory: true,
                            loadingHistoryConfig: {msguuid: baseMsguuid, direction: 'around'}
                        });
                    }
                });
    }
}, {
    getCmdKey: ({sessionid, timestamp, queryDirection}) => `${sessionid}-${queryDirection}`
});
