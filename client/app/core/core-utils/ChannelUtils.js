import LoginStore from '../stores/LoginStore';
import EnumSessionType from '../enums/EnumSessionType';
import _ from 'underscore';

export function getChannelIdByUserId(uid) {
    const mUid = LoginStore.getUID();
    return Number(mUid) < Number(uid) ? (mUid + '_' + uid) : (uid + '_' + mUid);
}

// 从单聊 sessionid 中提取出会话对方的uid
export function getTargetUidByChannelId(channelId) {
    let uids = channelId.split('_');
    let toUID = _.without(uids, LoginStore.getUID());
    if(toUID.length > 0){
        return toUID[0];
    } else {
        return LoginStore.getUID();
    }
}

// 单聊返回对方uid, 频道返回sessionid
export function getChannelToid(sessionid, sessiontype) {
    if (sessiontype === EnumSessionType.Channel) {
        return sessionid;
    } else if (sessiontype === EnumSessionType.P2P) {
        return getTargetUidByChannelId(sessionid);
    } else {
        return null;
    }
}
