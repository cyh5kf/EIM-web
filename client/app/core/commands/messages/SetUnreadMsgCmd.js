import ChannelsStore from '../../stores/ChannelsStore';
import {createCommand} from '../../../utils/command';

export default createCommand(function (sessionid, unreadMsgFromUUID) {
    const channel = ChannelsStore.getChannel(sessionid);
    if (channel) {
        channel.setChannelData({unreadMsgFromUUID: unreadMsgFromUUID});
    }
});
