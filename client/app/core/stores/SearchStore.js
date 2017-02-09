import {createEventBus} from '../../utils/EventBus';
import {createImmutableSchemaData} from '../../utils/schema';
import EnumEventType from '../enums/EnumEventType';
import {SearchMessagesSchema} from '../schemas/SearchStoreSchemas';
import * as searchMessageCommands from '../commands/searchMessageCommands';
import immutable from 'immutable';

let messageSearchKeyInfo = null;
let searchedMessages = createImmutableSchemaData(SearchMessagesSchema, {
    texts: [],
    textsCount:0,
    files: [],
    filesCount:0
});

//两种模式 message search 或 file filter
let isMessageSearch = true;

export const DEFAULT_SEARCH_USER_SLICE = '__default__';
export const getSearchUserChangeEvt = (slice = DEFAULT_SEARCH_USER_SLICE) => slice === DEFAULT_SEARCH_USER_SLICE ? 'userSearch' : `userSearch-${slice}`;
let searchedUsersMap = {};


var SearchStore = createEventBus({
    ns:'search',

    // 搜索 用户/群组/会话/微邮 的结果
    addSearchUserListener(listener, slice = DEFAULT_SEARCH_USER_SLICE) {
        this.addEventListener(getSearchUserChangeEvt(slice), listener);
    },
    removeSearchUserListener(listener, slice = DEFAULT_SEARCH_USER_SLICE) {
        const evtName = getSearchUserChangeEvt(slice);
        this.removeEventListener(evtName, listener);
        if (!this.hasEvent(evtName)) {
            delete searchedUsersMap[slice];
        }
    },
    /**@param {string} [slice] 指定独有的搜索数据分片, 以和其他搜索结果分离 (例如同时有两个MultiSelect搜索, 可以指定不同的slice以存储不同的搜索结果)*/
    getSearchUserList(slice = DEFAULT_SEARCH_USER_SLICE) {
        return searchedUsersMap[slice] && searchedUsersMap[slice].data;
    },
    setSearchUserList(newSearchedResults, {searchStartTime, slice = DEFAULT_SEARCH_USER_SLICE} = {}) {
        const {searchStartTime: prevStartTime} = searchedUsersMap[slice] || {};
        // 弃用延迟到来的之前的搜索结果
        if (prevStartTime == null || searchStartTime > prevStartTime) {
            searchedUsersMap[slice] = {
                searchStartTime,
                data: newSearchedResults
            };
            this.emit(getSearchUserChangeEvt(slice), newSearchedResults);
        }
    },

    // 重置消息搜索
    ResetMsgSearchKeyInfo(keyInfo, messageSeach){
        messageSearchKeyInfo = keyInfo;
        
        searchedMessages = searchedMessages.set('texts',immutable.List());
        searchedMessages = searchedMessages.set('files',immutable.List());
        searchedMessages = searchedMessages.set('textsCount',0);
        searchedMessages = searchedMessages.set('filesCount',0);

        isMessageSearch = messageSeach;
    },

    //添加搜索结果，多页数据存储
    addSearchedMessages(messageList, type, count){
        if (type === EnumEventType.TextMsg) {
            let textMsgs = searchedMessages.texts;
            textMsgs = textMsgs.concat(messageList);
            searchedMessages = searchedMessages.set('textsCount',count);
            searchedMessages = searchedMessages.set('texts', textMsgs);
        } else if (type === EnumEventType.FileMsg) {
            let fileMsgs = searchedMessages.files;
            fileMsgs = fileMsgs.concat(messageList);
            searchedMessages = searchedMessages.set('filesCount',count);
            searchedMessages = searchedMessages.set('files', fileMsgs);            
        }
        this.emit('searchMessagesChange', isMessageSearch);
    },

    requestSeachedMessages(start, type){
        //都通过回调做请求，如果当前已经存在，直接发送消息，否则进行网络请求再发送消息
        if (type === EnumEventType.TextMsg) {
            if(searchedMessages.texts.size > start){
                this.emit('searchMessagesChange', isMessageSearch);
            }
            else{
                if(messageSearchKeyInfo){
                    messageSearchKeyInfo.startIndex = start;
                    messageSearchKeyInfo.types=[EnumEventType.TextMsg];
                    searchMessageCommands.searchMessages(messageSearchKeyInfo);
                }                                
            }
        }
        else  if(type === EnumEventType.FileMsg){
            if(searchedMessages.files.size > start){
                this.emit('searchMessagesChange', isMessageSearch);
            }
            else{
                 if(messageSearchKeyInfo){
                    messageSearchKeyInfo.startIndex = start;
                    messageSearchKeyInfo.types=[EnumEventType.FileMsg];
                    searchMessageCommands.searchMessages(messageSearchKeyInfo);
                }
            }
        }
    },

    //获取已有的搜索结果     
    getSearchMessages() {
        return searchedMessages;
    }
    
});

export default SearchStore;
