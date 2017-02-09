import {createCommand} from '../../../utils/command';
import createUuid from '../../core-utils/createUuid';
import AppDataHandler from '../../datarequest/AppDataHandlerMixin';
import ApiConfig from '../../constants/ApiConfig';
import LoginStore from '../../stores/LoginStore';
import ChannelsStore from '../../stores/ChannelsStore';
import FavouritesStore from '../../stores/FavouritesStore';

export default createCommand(function ({sessionid, sessiontype, msguuid, msgsrvtime, isstarred}) {
    return AppDataHandler.doRequest({
        url: ApiConfig.rpc,
        body: {
            smd: 'msgsync.starChangeMsg',
            uid: LoginStore.getUID(),
            sessionId: sessionid,
            sessionType: sessiontype,
            msgUuid: msguuid,
            msgSrvTime: msgsrvtime,
            reqUuid: createUuid(),
            isStar: isstarred
        }
    }).then(() => {
        const channel = ChannelsStore.getChannel(sessionid);
        if (channel) {
            channel.onEditMessages([{
                msguuid,
                isstarred
            }]);
        }
        if(!isstarred) {
            FavouritesStore.deleteStarredMsg(msguuid);
        }

    })
}, {
    getCmdKey: ({msguuid}) => msguuid
});
