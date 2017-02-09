import {createCommand} from '../../../utils/command';
import {showAlert} from '../../../components/popups/alert';
import LoginStore from '../../stores/LoginStore';
import ChannelsStore from '../../stores/ChannelsStore';
import OpenOrCloseChannelCommand from './OpenOrCloseChannelCommand';

export default createCommand(function (targetUid) {
    let uid = LoginStore.getUID();
    let cid = Number(targetUid) < Number(uid)? targetUid+ '_' + uid: uid + '_' + targetUid;
    let channelOperationPromise =  OpenOrCloseChannelCommand({sessionid:cid, sessiontype:'0', open:true});
    return channelOperationPromise.then(()=>{
        ChannelsStore.switchChannel(cid);
    }, (e)=>{
        showAlert(gLocaleSettings.CHANNEL_CREATE['createChannelFailed']);
        return Promise.reject(e);
    });
}, {name: 'channel.PublishP2PCmd'});
