import {createCommand} from '../../../utils/command';
import createUuid from '../../core-utils/createUuid';
import AppDataHandler from '../../datarequest/AppDataHandlerMixin';
import ApiConfig from '../../constants/ApiConfig';
import LoginStore from '../../stores/LoginStore';
import ChannelsStore from '../../stores/ChannelsStore';

// 会话置顶
export default createCommand(function ({sessionid, sessiontype, issticky}) {
    const channel = ChannelsStore.getChannel(sessionid);
    const originIsSticky = channel.channelData.issticky,
        fnRevert = () => channel.setChannelData({issticky: originIsSticky});

    channel.setChannelData({
        issticky: issticky
    });
    return AppDataHandler.doRequest({
        url: ApiConfig.rpc,
        body: {
            smd: 'msgsync.starChangeSession',
            uid: LoginStore.getUID(),
            sessionId: sessionid,
            sessionType: sessiontype,
            isStar: issticky,
            reqUuid: createUuid()
        }
    }).catch(err => {
        fnRevert();
        return Promise.reject(err);
    });
}, {
    getCmdKey: ({msguuid}) => msguuid
});
