import _ from 'underscore';
import createUuid from '../../core-utils/createUuid';
import AppDataHandler from '../../datarequest/AppDataHandlerMixin';
import LoginStore from '../../stores/LoginStore';
import {createCommand} from '../../../utils/command';
import ApiConfig from '../../constants/ApiConfig';
import ChannelsStore from '../../stores/ChannelsStore';
import EnumSessionType from '../../enums/EnumSessionType';
import {getChannelToid} from '../../core-utils/ChannelUtils';

export default createCommand(function({sessionid, sessiontype, msguuid, msgsrvtime}){
    const isP2P = sessiontype === EnumSessionType.P2P,
        toid = getChannelToid(sessionid, sessiontype);

    return AppDataHandler.doRequest({
        url: ApiConfig.rpc,
        body: _.assign({
            uid: LoginStore.getUID(),
            msgUuid: msguuid,
            msgSrvTime: msgsrvtime,
            reqUuid: createUuid()
        }, isP2P ? {smd: 'p2pchat.cancelMessage', toUid: toid} : {smd: 'groupchat.cancelGroupMessage', gid: toid})
    }).then(() => {
        const channel = ChannelsStore.getChannel(sessionid);
        channel && channel.deleteMessage({msguuid});
    });
}, {
    getCmdKey: ({msguuid}) => msguuid
});
