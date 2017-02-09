import AppDataHandler from '../../datarequest/AppDataHandlerMixin';
import LoginStore from '../../stores/LoginStore';
import ChannelsStore from '../../stores/ChannelsStore';
import ApiConfig from '../../constants/ApiConfig';
import {createCommand} from '../../../utils/command';
import createUuid from '../../core-utils/createUuid';

// 重置自己的未读数, 通常与 AckMsg 一起发送, 触发推送 EnumEventType.SessionRead
export default createCommand(function({sessionid, sessiontype}){
    const channel = ChannelsStore.getChannel(sessionid),
        originNewMsgCount = channel.channelData.newMsgCount;
    channel.setChannelData({
        newMsgCount: 0
    });

    return AppDataHandler.doRequest({
        'body': {
            'uid': LoginStore.getUID(),
            'sessionType': sessiontype,
            'sessionId': sessionid,
            'reqUuid': createUuid(),
            'smd': 'msgsync.resetSession'
        },
        'url': ApiConfig.rpc
    }).catch(err => {
        channel.setChannelData({
            newMsgCount: originNewMsgCount
        });
        return Promise.reject(err);
    });
}, {
    getCmdKey: ({sessionid}) => sessionid
});
