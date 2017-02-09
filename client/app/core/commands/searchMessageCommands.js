import {createCommand} from '../../utils/command';
import AppDataHandler from '../datarequest/AppDataHandlerMixin';
import ApiConfig from '../constants/ApiConfig';
import LoginStore from '../stores/LoginStore';
import SearchStore from '../stores/SearchStore';
import {TextMsgListSchema, FileMsgListSchema} from '../schemas/SearchStoreSchemas';
import EnumEventType from '../enums/EnumEventType';
import * as schema from '../../utils/schema';

export const searchMessages = createCommand(function ({
    key = '', startIndex = 0, limit = 20,
    timeRank = false, // false: 相关, true: 最近
    types = [EnumEventType.TextMsg, EnumEventType.FileMsg], startTime = NaN, endTime = NaN,
    uids = [], sessionIds = []}) {

    const requestOptions = {
        uid: LoginStore.getUID(),
        start:startIndex,
        limit,
        sortType: timeRank ? '0' : '1',
        filterKeyword: key,
        filterUid: uids.length ? uids : undefined,
        filterSessionId: sessionIds.length ? sessionIds : undefined,
        filterStartMsgSrvTime: Number.isNaN(startTime) ? undefined : startTime,
        filterEndMsgSrvTime: Number.isNaN(endTime) ? undefined : endTime,
        smd: 'search.searchMessage'
    };

    return Promise.all(types.map(type => {
        return AppDataHandler.doRequest({
            body: {
                ...requestOptions,
                smd: type === EnumEventType.TextMsg ? 'search.searchMessage' : 'search.searchFile'
            },
            url: ApiConfig.rpc
        }).then(({data}) => {
            if (data.msg) {
                SearchStore.addSearchedMessages(schema.createImmutableSchemaData(TextMsgListSchema, data.msg), EnumEventType.TextMsg, Number(data.totalCount));
            } else {
                SearchStore.addSearchedMessages(schema.createImmutableSchemaData(FileMsgListSchema, data.file), EnumEventType.FileMsg, Number(data.totalCount));
            }
        });
    }));
}, {
    name: 'searchMessages'
});
