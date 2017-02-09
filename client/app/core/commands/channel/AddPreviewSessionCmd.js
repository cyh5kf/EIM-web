import ChannelsStore from '../../stores/ChannelsStore';
import {createCommand} from '../../../utils/command';

export default createCommand(function ({sessionid, sessiontype}) {
    if (!ChannelsStore.getChannel(sessionid)) {
        return ChannelsStore.queryAndInsertChannel({
            sessionid,
            sessiontype,
            open: false
        });
    } else {
        return Promise.resolve();
    }
}, {getCmdKey: ({sessionid}) => sessionid});

