import LoginStore from '../../stores/LoginStore';
import MessagePool from '../../stores/MessagePool';
import ApiConfig from '../../constants/ApiConfig';
import ChannelsStore from '../../stores/ChannelsStore';
import TeamMembersStore from '../../stores/TeamMembersStore';
import Channel from '../../stores/Channel';
import EnumEventType from '../../enums/EnumEventType';
import AppDataHandler from '../../datarequest/AppDataHandlerMixin';
import {createCommand} from '../../../utils/command';
import ObjectUtils from '../../../utils/ObjectUtils';
import {EnsureTeamMembersExistCmd} from '../TeamMembersCommands';

export default createCommand(function () {
    return AppDataHandler.doRequest({
        'body': {
            smd:'msgsync.querySessionList',
            uid: LoginStore.getUID()
        },
        'url': ApiConfig.rpc
    }).then(function(response) {
        MessagePool.saveSyncTime((new Date()).getTime());
        const sessions = (response.data.session || []).map(session => ObjectUtils.mapToString(ObjectUtils.toLowercaseKeys(ObjectUtils.flattenObject(session, {
            'modifyTime': 'gmtmodify',
            'firstUnreadMsgUuid': 'first_unread_msguuid'
        })), ['senderuid']));

        const lastMsgSenderuids = [];
        sessions.forEach(session => {
            if (session.eventtype === EnumEventType.TextMsg || session.eventtype === EnumEventType.FileMsg) {
                if (session.senderuid !== '0') { // jyf: TODO: 临时跳过错误数据
                    lastMsgSenderuids.push(session.senderuid);
                } else {
                    console.error('SyncRecentSessionCommand: 后端接口脏数据, sessionid: ' + session.sessionid);
                }
            }
        });

        return EnsureTeamMembersExistCmd(lastMsgSenderuids)
            .then(() => {
                ChannelsStore.setChannelsCounts({
                    channelCount: parseInt(response.data.channelCount),
                    p2pCount: parseInt(response.data.p2pCount)
                });
                const channels = sessions.map(session => {
                    let lastMsgData = null;
                    if (session.eventtype === EnumEventType.TextMsg) {
                        lastMsgData = {
                            text: session.text
                        };
                    } else if (session.eventtype === EnumEventType.FileMsg) {
                        lastMsgData = {};
                    }
                    return new Channel(ChannelsStore, {
                        sessionid: session.sessionid,
                        sessiontype: session.sessiontype,
                        issticky: session.isstar,
                        ispublic: session.ispublic,
                        isdefault: session.isdefault,
                        newMsgCount: session.badge,
                        displayname: session.username != null ? session.username : (session.groupname != null ? session.groupname : ''),
                        lastMessage: !lastMsgData || session.senderuid === '0' /* jyf: TODO 临时跳过错误数据 */? null : {
                            ...lastMsgData,
                            eventtype: session.eventtype,
                            msgsrvtime: session.msgsrvtime,
                            sendername: TeamMembersStore.getTeamMemberByUid(session.senderuid.toString()).username
                        }
                    });
                });
                
                ChannelsStore.onChannelsJoin(channels);
                ChannelsStore.setRecentSessionsLoaded();
                sessions.length && ChannelsStore.switchChannel(sessions[sessions.length-1].sessionid);
            });
    });
});
