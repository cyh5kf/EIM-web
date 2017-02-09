import AppDataHandler from '../../datarequest/AppDataHandlerMixin';
import LoginStore from '../../stores/LoginStore';
import ChannelsStore, {CHANNELS_EVENTS} from '../../stores/ChannelsStore';
import createUuid from '../../core-utils/createUuid';
import {createCommand} from '../../../utils/command';
import ApiConfig from '../../constants/ApiConfig';

export default createCommand(function({uids=[]}){
    const channelid = createUuid();

    return AppDataHandler.doRequest({
            'body': {
                'uid': LoginStore.getUID(),
                'friendUid':uids,
                'gidUuid':channelid,
                'reqUuid':createUuid(),
                'smd': 'groupchat.createGroup'
            },
            'url': ApiConfig.rpc
    }).then(() => new Promise((resolve) => {
        ChannelsStore.once(CHANNELS_EVENTS.OWN_CHANNEL_CREATED, () => {
            resolve();
        });
    }));
});
