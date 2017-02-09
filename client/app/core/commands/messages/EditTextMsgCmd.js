import {createCommand} from '../../../utils/command';
import {createImmutableSchemaData} from '../../../utils/schema';
import createUuid from '../../core-utils/createUuid';
import AppDataHandler from '../../datarequest/AppDataHandlerMixin';
import ApiConfig from '../../constants/ApiConfig';
import LoginStore from '../../stores/LoginStore';
import ChannelsStore from '../../stores/ChannelsStore';
import {EnumSendingStatus} from '../../enums/MessageEnums';
import EnumSessionType from '../../enums/EnumSessionType';
import {MessageListSchema} from '../../schemas/MessageSchemas';
import {getChannelToid} from '../../core-utils/ChannelUtils';

export default createCommand(function ({editingMsg, text}) {
    const setMsgStatus = (clientSendingStatus) => {
        const channel = ChannelsStore.getChannel(editingMsg.sessionid);
        if (channel) {
            channel.onPushMessages(createImmutableSchemaData(MessageListSchema, [{
                ...editingMsg,
                clientSendingStatus: clientSendingStatus,
                text: text
            }]));
        }
    }
    const isP2P = editingMsg.sessiontype === EnumSessionType.P2P;

    setMsgStatus(EnumSendingStatus.ClientEditing);

    return AppDataHandler.doRequest({
        url: ApiConfig.rpc,
        body: {
            smd: isP2P ? 'p2pchat.editMessageContent' : 'groupchat.editGroupMessageContent',
            uid: LoginStore.getUID(),
            [isP2P ? 'toUid' : 'gid']: getChannelToid(editingMsg.sessionid, editingMsg.sessiontype),
            msgUuid: editingMsg.msguuid,
            msgSrvTime: editingMsg.msgsrvtime,
            newMsgContent: text,
            reqUuid: createUuid()
        }
    }).catch(err => {
        setMsgStatus(EnumSendingStatus.ClientEditFailed);
        return Promise.reject(err);
    });
});
