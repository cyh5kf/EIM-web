import {
    createCommand
} from '../../utils/command';
import AppDataHandler from '../datarequest/AppDataHandlerMixin';
import ApiConfig from '../constants/ApiConfig';
import {
    createImmutableSchemaData
} from '../../utils/schema';
import {
    QueryStarredMsg
} from '../schemas/FavouritesSchemas';
import FavouritesStore from '../stores/FavouritesStore';

export const QueryStarredMsgCmd = createCommand(function(obj) {
    var reqDataParam = {
        url: ApiConfig.rpc,
        dataType: 'json',
        body: {
            'rpc': "msgsync.queryStarredMsg",
            'uid': obj.uid,
            'endTime': obj.endTime,
            'limit': obj.limit
        }
    }
    return AppDataHandler.doRequest(reqDataParam).then(response => {
        var starredMsg = createImmutableSchemaData(QueryStarredMsg, response.response || []);
        FavouritesStore.queryStarredMsg(starredMsg);
    });
}, {
    name: 'queryStarredMsg'
});

export const QueryMoreStarredMsgCmd = createCommand(function(obj) {
    var reqDataParam = {
        url: ApiConfig.rpc,
        dataType: 'json',
        body: {
            'rpc': "msgsync.queryStarredMsg",
            'uid': obj.uid,
            'endTime': obj.endTime,
            'msgUuid': obj.msgUuid,
            'limit': obj.limit
        }
    }
    return AppDataHandler.doRequest(reqDataParam).then(response => {
        var starredMsg = createImmutableSchemaData(QueryStarredMsg, response.response || []);
        FavouritesStore.appendStarredMsg(starredMsg);
    });
}, {
    name: 'queryMoreStarredMsg'
});
