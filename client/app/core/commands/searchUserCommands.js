import {createCommand} from '../../utils/command';
import {SearchUserListSchema} from '../schemas/SearchStoreSchemas';
import {createImmutableSchemaData} from '../../utils/schema';
import AppDataHandler from '../datarequest/AppDataHandlerMixin';
import ApiConfig from '../constants/ApiConfig';
import LoginStore from '../stores/LoginStore';
import SearchStore, {DEFAULT_SEARCH_USER_SLICE} from '../stores/SearchStore';

export const searchUserCmd = createCommand(function ({keyword, userTypes, channelSortType = undefined/*仅对Channel类型生效*/, slice = DEFAULT_SEARCH_USER_SLICE}) {
    const searchStartTime = Date.now();
    return AppDataHandler.doRequest({
        ensureRetAsTrue: true,
        body: {
            uid: LoginStore.getUID(),
            userType: userTypes,
            sort: channelSortType,
            key: keyword,
            start: 0,
            limit: 50,
            smd: 'queryServer.queryUser'
        },
        url: ApiConfig.rpc
    }).then(response => {
        SearchStore.setSearchUserList(createImmutableSchemaData(SearchUserListSchema, response.data.users), {
            searchStartTime: searchStartTime,
            slice
        });
    });
}, {
    name: 'searchUser.searchUserCmd',
    getCmdKey: ({keyword}) => keyword
});

export const clearUserSearchResultCmd = createCommand(function ({slice = DEFAULT_SEARCH_USER_SLICE} = {}) {
    SearchStore.setSearchUserList(null, {
        searchStartTime: Date.now(),
        slice
    });
}, {
    name: 'searchUser.clearUserSearchResultCmd'
});
