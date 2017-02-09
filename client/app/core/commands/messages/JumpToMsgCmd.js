import {createCommand} from '../../../utils/command';
import SwitchChannelCmd from './../channel/SwitchChannelCmd';
import QueryMessagesCmd, {QUERY_DIRECTION} from './QueryMessagesCmd';

export default createCommand(function ({sessionid, sessiontype, msguuid, msgsrvtime}) {
    return Promise.resolve()
        .then(() => SwitchChannelCmd({sessionid, sessiontype, openIfNotExist: true}))
        .then(() => QueryMessagesCmd({
            baseMsguuid: msguuid,
            sessionid,
            sessiontype,
            timestamp: msgsrvtime,
            queryDirection: QUERY_DIRECTION.AROUND
        }));
}, {
    getCmdKey: ({sessionid}) => sessionid
});
