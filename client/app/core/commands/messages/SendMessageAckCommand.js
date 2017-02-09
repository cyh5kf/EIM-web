import AppDataHandler from '../../datarequest/AppDataHandlerMixin';
import LoginStore from '../../stores/LoginStore';
import ChannelsStore from '../../stores/ChannelsStore';
import ApiConfig from '../../constants/ApiConfig';
import {createCommand} from '../../../utils/command';
import createUuid from '../../core-utils/createUuid';
import EnumSessionType from '../../enums/EnumSessionType';
import {EnumReceiveStatus} from '../../enums/MessageEnums';
import _ from 'underscore';

export default createCommand(function({sessionid, sessiontype, messages}){
    const channel = ChannelsStore.getChannel(sessionid);
    let senderuids = [];
    let msgsrvtimes = [];
    let msguuids = [];
    messages.forEach(function(message){
        senderuids.push(message.senderuid);
        msgsrvtimes.push(message.msgsrvtime);
        msguuids.push(message.msguuid);
    });

    channel.onEditMessages(msguuids.map(msguuid => ({
        msguuid,
        receivestatus: EnumReceiveStatus.Read
    })));

    return AppDataHandler.doRequest({
        'body': _.assign({
            uid: LoginStore.getUID(),
            msgUuid: msguuids,
            senderUid: senderuids,
            msgSrvTime: msgsrvtimes,
            reqUuid: createUuid()
        }, sessiontype === EnumSessionType.Channel ? {smd: 'groupchat.ackGroupMessages', gid: sessionid} : {smd: 'p2pchat.ackMessage'}),
        'url': ApiConfig.rpc
    }).catch(err => {
        channel.onEditMessages(msguuids.map(msguuid => ({
            msguuid,
            receivestatus: EnumReceiveStatus.Sent
        })));
        return Promise.reject(err);
    });

});
