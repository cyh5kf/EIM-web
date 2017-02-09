import _ from 'underscore';
import {createCommand} from '../../../utils/command';
import {createImmutableSchemaData} from '../../../utils/schema';
import {getChannelToid} from '../../core-utils/ChannelUtils';
import createUuid from '../../core-utils/createUuid';
import AppDataHandler from '../../datarequest/AppDataHandlerMixin';
import ApiConfig from '../../constants/ApiConfig';
import LoginStore from '../../stores/LoginStore';
import ChannelsStore from '../../stores/ChannelsStore';
import {MessageListSchema} from '../../schemas/MessageSchemas';
import EnumEventType from '../../enums/EnumEventType';
import EnumSessionType from '../../enums/EnumSessionType';
import {EnumSendingStatus} from '../../enums/MessageEnums';

export default createCommand(function ({
    sessionid, sessiontype, clientSendTime = Date.now(), msguuid = createUuid(),
    text, atAll, atUid
    }) {

    const toid = getChannelToid(sessionid, sessiontype),
        isP2P = sessiontype === EnumSessionType.P2P,
        avatar = LoginStore.getAvatar(),
        username = LoginStore.getUserName(),
        fromuid = LoginStore.getUID(),
        setMsgStatus = ({clientSendingStatus}) => {
            const channel = ChannelsStore.getChannel(sessionid);
            if (channel) {
                channel.onPushMessages(createImmutableSchemaData(MessageListSchema, [{
                    isstarred: false,
                    sessionid: channel.channelData.sessionid,
                    sessiontype: channel.channelData.sessiontype,
                    eventtype: EnumEventType.TextMsg,
                    senderuid: fromuid,
                    msguuid: msguuid,
                    clientSendTime: clientSendTime,
                    clientSendingStatus: clientSendingStatus,
                    senderavatar: avatar,
                    sendername: username,
                    text: text
                }]));
            }
        };

    setMsgStatus({clientSendingStatus: EnumSendingStatus.ClientSending});
    return AppDataHandler.doRequest({
        ensureRetAsTrue: true,
        url: ApiConfig.rpc,
        body: _.assign({
            uid: fromuid,
            msgUuid: msguuid,
            msgType: 0, // Text
            sendTime: clientSendTime,
            msgData: {
                text: {
                    text: text
                }
            }
        }, isP2P ? {
            smd: 'p2pchat.sendMessage',
            toUid: toid
        } : {
            smd: 'groupchat.sendGroupMessage',
            gid: toid,
            atUid: atUid,//[number]
            atAll: atAll //boolean s
        })
    }).catch(function (error) {
        setMsgStatus({clientSendingStatus: EnumSendingStatus.ClientSendFailed});
        return Promise.reject(error);
    });
});
