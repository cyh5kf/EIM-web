import _ from 'underscore';
import moment from 'moment';
import EventBus from '../../utils/EventBus';
import {
    createImmutableSchemaData
} from '../../utils/schema';
import {MentionMsgSchema, MentionMsgListSchema} from '../schemas/MessageSchemas';
import {EnumReceiveStatus} from '../enums/MessageEnums';
import EnumEventType from '../enums/EnumEventType';
import EnumSessionType from '../enums/EnumSessionType';
// import immutable from 'immutable';
import gSocketManager, {
    SOCKET_EVENTS
} from '../gSocketManager';
import StringUtils from '../../utils/StringUtils';
import MentionType from '../enums/EnumMentionType';
import LoginStore from './LoginStore';
import ChannelsStore from './ChannelsStore';
import Pool from './PoolMixin';
import ObjectUtils from '../../utils/ObjectUtils';

var createEmptyMentionInfo = function() {
    return {
        mentionList: createImmutableSchemaData(MentionMsgListSchema, []),
        isLastBatch: false
    }
};

let mentionInfo = createEmptyMentionInfo();

function normalizeMessagesData(messages) {
    return messages.map(msg => ObjectUtils.toLowercaseKeys(ObjectUtils.flattenObject(msg)));
}

function fixMention(mention, verify = false) {

    mention['sendername'] = mention['username'];
    mention['senderavatar'] = mention['avatar'];
    mention['displayname'] = mention['username'];

    mention['receivestatus'] = EnumReceiveStatus.Read;
    if (mention.text.indexOf('Session') !== -1) {
        mention.mentionType = MentionType.All;
        return mention;
    } else {
        let atObjectTexts = StringUtils.atMatches(mention.text);

        if (atObjectTexts) {
            for (let len = atObjectTexts.length - 1, i = len; i >= 0; i--) {
                const atText = atObjectTexts[i];
                let classify = StringUtils.classifyMention(atText);
                if (classify === 'U') {
                    if (verify) {
                        if (LoginStore.getUID() === StringUtils.getMentionIdentify(atText)) {
                            mention.mentionType = MentionType.User;
                            return mention;
                        }
                    } else {
                        mention.mentionType = MentionType.User;
                        return mention;
                    }
                } else if (classify === 'G') {
                    mention.mentionType = MentionType.Group;
                    return mention;
                }
            }
        }
    }

    return null;
}


class MentionStore extends EventBus {
    updateMentioinList(mentions, islastbatch) {
        mentions = normalizeMessagesData(mentions);
        for (var i = 0; i < mentions.length; i++) {
            fixMention(mentions[i]);
        }
        mentionInfo.mentionList = this.sortMentions(mentionInfo.mentionList.concat(createImmutableSchemaData(MentionMsgListSchema, mentions)));
        mentionInfo.isLastBatch = islastbatch;
        this.emit('updateMentionList', mentionInfo);
    }
    sortMentions(mentions) {
        return mentions.sortBy(msg => msg.msgsrvtime).reverse();
    }
    groupByDate(mentions) {
        return mentions.groupBy(msg => moment(msg.msgsrvtime).format('YYYY-MM-DD'));
    }
    groupByChannel(mentions) {
        return mentions.groupBy(msg => msg.sessionid);
    }
    getAll() {
        return mentionInfo.mentionList;
    }
    getLastTime() {
        // mentionInfo.mentionList = this.sortMentions(mentionInfo.mentionList);
        return mentionInfo.mentionList.last().msgsrvtime;
    }
    judgeLastBatch() {
        return mentionInfo.isLastBatch;
    }
    setMentionsOption(obj) {
        Pool.set('mentionSession', JSON.stringify(obj));
    }
    getMentionsOption() {
        return JSON.parse(Pool.get('mentionSession'));
    }
    filterNotMentions(mentions, mentionType1, mentionType2) {
        return mentions.filterNot(message => {
            if (message.mentionType === mentionType1) return true;
            else if (mentionType2 === message.mentionType) return true;
            else return false;
        });
    }
    _onSocketMessage = (event) => {
        let isMention = false;

        if (event.eventType === EnumEventType.TextMsg && Number(event.sessiontype) !== EnumSessionType.P2P) {

            let message = ObjectUtils.toLowercaseKeys(ObjectUtils.flattenObject(_.clone(event)));
            message = fixMention(message, true);

            if (message) {
                isMention = true;
                let channel = ChannelsStore.getChannel(message.sessionid);
                message['displayname'] = channel.channelData.displayname;
                mentionInfo.mentionList = mentionInfo.mentionList.push(createImmutableSchemaData(MentionMsgSchema, message));
            }
        }

        if (isMention) {
            mentionInfo.mentionList = this.sortMentions(mentionInfo.mentionList);
            this.emit('updateMentionList', mentionInfo);
        }
    };

    bindWebsocketEvents() {
        gSocketManager.addEventListener(SOCKET_EVENTS.ON_MESSAGE, this._onSocketMessage);
        mentionInfo = createEmptyMentionInfo();
    }

    unbindWebsocketEvents() {
        gSocketManager.addEventListener(SOCKET_EVENTS.ON_MESSAGE, this._onSocketMessage);
        mentionInfo = createEmptyMentionInfo();
    }
}

export default new MentionStore();
