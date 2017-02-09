import {createCommand} from '../../../utils/command';
import ChannelsStore from '../../stores/ChannelsStore';
import OpenOrCloseChannelCommand from './OpenOrCloseChannelCommand';
import {breakingError} from '../../../utils/warning';

export default createCommand(function ({sessionid, openIfNotExist = false, sessiontype = null/**仅当 openIfNotExist=true 时需要*/}) {
    const doSwitch = () => Promise.resolve(ChannelsStore.switchChannel(sessionid));
    if (openIfNotExist) {
        if (__DEV__ && sessiontype == null) {
            breakingError('SwitchChannelCmd: sessiontype 未指定');
        }
        const channel = ChannelsStore.getChannel(sessionid);
        if (channel && channel.channelData.open) {
            return doSwitch();
        } else {
            OpenOrCloseChannelCommand({sessionid: sessionid, sessiontype: sessiontype, open: true});
            let promise = Promise.resolve();
            if (!channel) {
                promise = promise.then(() => ChannelsStore.queryAndInsertChannel({sessionid: sessionid, sessiontype: sessiontype}));
            } else {
                channel.setChannelData({open: true});
            }
            return promise.then(doSwitch);
        }
    } else {
        return doSwitch();
    }
}, {name: 'channel.SwitchChannelCmd'});
