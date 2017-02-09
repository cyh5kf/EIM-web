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
    gmtcreate,resourceid, filetype, filename, /*filedesc,*/ filesize, fileurl, imgwidth, imgheight // jyf: TODO: 临时移除 filedesc
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
                    eventtype: EnumEventType.FileShareMsg,
                    senderuid: fromuid,
                    msguuid: msguuid,
                    clientSendTime: clientSendTime,
                    clientSendingStatus: clientSendingStatus,
                    senderavatar: avatar,
                    sendername: username,

                    resourceid: resourceid,
                    fileurl: fileurl,
                    filetype: filetype,
                    filename: filename,
                    filesize: filesize,
                    gmtcreate:gmtcreate,
                    imgwidth:imgwidth,
                    imgheight:imgheight
                }]));
            }
        };

    setMsgStatus({clientSendingStatus: EnumSendingStatus.ClientSending});
    return AppDataHandler.doRequest({
        ensureRetAsTrue: true,
        url: ApiConfig.rpc,
        body: _.assign({
            msgUuid: msguuid,
            fileResourceId: resourceid,
            sendTime: clientSendTime
        }, isP2P ? {smd: 'p2pchat.forwardFile', toUid: toid} : {smd: 'groupchat.forwardGroupFile', gid: toid})
    }).catch(error => {
        setMsgStatus({clientSendingStatus: EnumSendingStatus.ClientSendFailed});
        return Promise.reject(error);
    });

});
