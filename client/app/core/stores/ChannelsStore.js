import immutable from 'immutable';
import {EnsureTeamMembersExistCmd} from '../commands/TeamMembersCommands';
import TeamMembersStore from './TeamMembersStore';
import LoginStore from './LoginStore';
import EnumSessionType from '../enums/EnumSessionType';
import Channel, {SINGLE_CHANNEL_EVENTS} from './Channel';
import _ from 'underscore';
import warning from '../../utils/warning';
import EventBus from '../../utils/EventBus';
import ObjectUtils from '../../utils/ObjectUtils';
import {getTargetUidByChannelId} from '../core-utils/ChannelUtils';
import EnumEventType from '../enums/EnumEventType';
import gSocketManager, {SOCKET_EVENTS} from '../gSocketManager';
import {queryChannelInfo} from '../apis/ChannelApis';

function shouldDiscard(channelMgr, event) {
    const eventtype = Number(event.eventtype);
    // 不处理针对没有sessionid的事件
    if (!event.sessionid) {
        return true;
    }
    // 没有加载过任何会话列表时, 不处理推送
    if (_.isEmpty(channelMgr._channelsMap)) {
        return true;
    }


    //针对ack和del消息,如果当前频道不存在,直接丢掉.
    return ((eventtype === EnumEventType.MsgAck || eventtype === EnumEventType.MsgDeleted) && !channelMgr._channelsMap[event.sessionid]);
}

export const CHANNELS_EVENTS = {
    CURRENT_CHANNEL_CHANGE: 'currentChannelChange',
    CHANNELS_COUNT_CHANGE: 'channelsCountChange',
    CHANNEL_LIST_CHANGE: 'channelListChange',
    NEW_CHANNELS_INSERTED: 'newChannelsInserted',

    OWN_CHANNEL_CREATED: 'ownChannelCreated'
};

export {SINGLE_CHANNEL_EVENTS};

class ChannelManager extends EventBus {
    constructor() {
        super(...arguments);
        this._reset();
        //当window失去焦点的时候，需要推送消息提醒
        this.windowFocused = true;

        window.addEventListener('focus', () => this.windowFocused = true);
        window.addEventListener('blur', () => this.windowFocused = false);
    }

    _reset() {
        this._channelsMap = {};
        this.recentSessionsLoaded = false;
        this.channelCount = 0;
        this.p2pCount = 0;
        this.selectedChannelId = null;
    }

    addCurrentChannelListener(singleChannelEvent, listener, triggerOnCurrentChannelChange = true) {
        const listeningEvents = listener._listeningEvents = listener._listeningEvents || [];
        if (__DEV__ && listeningEvents.indexOf(singleChannelEvent) !== -1) {
            warning(`ChannelsStore.addCurrentChannelListener: ${singleChannelEvent} 重复侦听!`);
        }
        listeningEvents.push(singleChannelEvent);
        const rebindChannelListener = () => {
            if (listener._listeningChannel) {
                listener._listeningEvents.forEach(eventName => {
                    listener._listeningChannel.removeEventListener(eventName, listener);
                });
            }
            const currentChannel = this.getCurrent();
            if (currentChannel) {
                listener._listeningEvents.forEach(eventName => {
                    currentChannel.addEventListener(eventName, listener);
                });
            }
            listener._listeningChannel = currentChannel;
        };
        listener._onCurrentChannelChange = listener._onCurrentChannelChange || function() {
                rebindChannelListener();
                triggerOnCurrentChannelChange && listener();
            }.bind(this);
        rebindChannelListener();
        this.addEventListener(CHANNELS_EVENTS.CURRENT_CHANNEL_CHANGE, listener._onCurrentChannelChange);
    }
    removeCurrentChannelListener(singleChannelEvent, listener) {
        listener._listeningEvents = _.without(listener._listeningEvents, singleChannelEvent);
        if (listener._listeningChannel) {
            listener._listeningChannel.removeEventListener(singleChannelEvent, listener);
        }
        this.removeEventListener(CHANNELS_EVENTS.CURRENT_CHANNEL_CHANGE, listener._onCurrentChannelChange);
    }


    windowIsFocused() {
        return this.windowFocused;
    }

    getChannelCount(){
        return this.channelCount;
    }

    /////////////////
    // 各类更新方法
    onChannelsJoin(channels, {notifyEvent = true} = {}) {
        channels.forEach(channel => {
            if (__DEV__ && this._channelsMap[channel.channelData.sessionid]) {
                warning('ChannelsStore.onChannelsJoin: 会话已存在, 将被覆盖而导致非预期的结果!');
            }
            this._channelsMap[channel.channelData.sessionid] = channel;
        });
        if (notifyEvent) {
            this.emit(CHANNELS_EVENTS.CHANNEL_LIST_CHANGE);
            this.emit(CHANNELS_EVENTS.NEW_CHANNELS_INSERTED, {
                sessionids: channels.map(channel => channel.channelData.sessionid)
            });
        }
    }
    resetDefaultSelectedChannel() {
        const firstChannelId = this.getChannelDataList().filter(channel => channel.sessiontype === EnumSessionType.Channel).first().sessionid;
        this.switchChannel(firstChannelId);
    }
    onHasChannelChange(channel) {
        this.emit(CHANNELS_EVENTS.CHANNEL_LIST_CHANGE);
    }
    queryAndInsertChannel({sessionid, sessiontype, open = true}) {
        if (sessiontype === EnumSessionType.P2P) {
            const targetUid = getTargetUidByChannelId(sessionid);
            return EnsureTeamMembersExistCmd([targetUid])
                .then(() => {
                    const channel = new Channel(this, {
                        sessionid: sessionid,
                        sessiontype: sessiontype,
                        open: open,
                        displayname: TeamMembersStore.getTeamMemberByUid(targetUid).username
                    });
                    this.onChannelsJoin([channel]);
                });
        } else if (sessiontype === EnumSessionType.Channel) {
            return queryChannelInfo(sessionid)
                .then(channelInfo => {
                    return EnsureTeamMembersExistCmd(channelInfo.user.map(user => user.uid).concat([channelInfo.group.creatoruid]))
                        .then(() => {
                            const channel = new Channel(this, {
                                sessionid: sessionid,
                                sessiontype: sessiontype,
                                open: open,
                                displayname: channelInfo.group.groupname,
                                createtime: channelInfo.group.gmtcreate,
                                topic: channelInfo.group.topic,
                                purpose: channelInfo.group.purpose,
                                isdefault: channelInfo.group.isdefault,
                                ispublic: channelInfo.group.ispublic,
                                members: channelInfo.user.map(user => TeamMembersStore.getTeamMemberByUid(user.uid).toJS()),
                                owner: TeamMembersStore.getTeamMemberByUid(channelInfo.group.creatoruid).toJS()
                            });
                            this.onChannelsJoin([channel]);
                        });
                });
        } else {
            warning(`ChannelsStore.insertChannel: 未处理的 sessiontype: ${sessiontype}`);
            return Promise.reject(`ChannelsStore.insertChannel: 未处理的 sessiontype: ${sessiontype}`);
        }
    }

    /////////////////
    // 各类获取方法
    getCurrentChannelData() {
        return this.getCurrent() && this.getCurrent().channelData;
    }
    getChannelData(cid) {
        const channel = this.getChannel(cid);
        return channel && channel.channelData;
    }
    getChannelDataList({openOnly = true} = {}) {
        const stickyChannels = [],
            otherChannels = [];
        _.forEach(this._channelsMap, ({channelData}) => {
            if (!openOnly || channelData.open) {
                if (channelData.issticky) {
                    stickyChannels.push(channelData);
                } else {
                    otherChannels.push(channelData);
                }
            }
        });

        return immutable.List(
            _.sortBy(stickyChannels, channelData => channelData.displayname)
                .concat(_.sortBy(otherChannels, channelData => channelData.displayname))
        );
    }
    // 注意: Channel不能直接当做props传给组件, 而应当传 channel.channelData, channel.messages
    getCurrent() {
        return this._channelsMap[this.selectedChannelId];
    }
    getChannel(cid) {
        return this._channelsMap[cid];
    }


    switchChannel(cid) {
        //创建频道是异步event推送，避免出现当异步回调没有回来的时候，切换频道出错
        if (!this._channelsMap[cid]) {
            _.delay(() => {
                this.switchChannel(cid);
            }, 200);
            return;
        }

        if (this.selectedChannelId !== cid) {
            //清除之前通道信息中的的unreadStart
            if (this.getCurrent()) {
                this.getCurrent().setChannelData({
                    unreadMsgFromUUID: null
                });
            }
            this.selectedChannelId = cid;

            this.emit(CHANNELS_EVENTS.CURRENT_CHANNEL_CHANGE, this.getCurrent());
        }

        return this.getCurrent();
    }


    _onSocketMessage = (event) => {
        event = ObjectUtils.mapToString(
            ObjectUtils.toLowercaseKeys(ObjectUtils.flattenObject(event)),
            ['senderuid']
        );

        if (shouldDiscard(this, event)) {
            return;
        }

        const {eventtype, sessionid, sessiontype} = event;
        switch (eventtype) {
            case EnumEventType.GroupCreated: { //创建群聊的事件推送
                let channel = this._channelsMap[sessionid];
                if (channel) {
                    channel.setChannelData({
                        open: true,
                        displayname: event.groupname,
                        ispublic: event.ispublic,
                        isdefault: event.isdefault
                    });
                } else {
                    this.onChannelsJoin([new Channel(this, {
                        sessionid: sessionid,
                        sessiontype: sessiontype,
                        displayname: event.groupname,
                        ispublic: event.ispublic,
                        isdefault: event.isdefault
                    })]);
                }

                // 如果是由自己创建的群，切换为当前会话
                const operatoruid = event._raw.eventData.createGroup.msg.operator.uid.toString();
                if (operatoruid === LoginStore.getUID()) {
                    this.switchChannel(sessionid);
                    this.emit(CHANNELS_EVENTS.OWN_CHANNEL_CREATED, channel);
                }
                break;
            }

            default: {
                const doHandleChannelEvent = () => {
                    const channel = this._channelsMap[sessionid];
                    channel._onReceiveSocketEvent(event);
                };

                if (!this._channelsMap[sessionid]) {
                    this.queryAndInsertChannel({
                        sessionid,
                        sessiontype
                    }).then(doHandleChannelEvent);
                } else {
                    doHandleChannelEvent();
                }
            }
        }
    }


    bindWebSocketEvents() {
        if (__DEV__ && this._socketEventsBinded) {
            warning('ChannelManager.bindWebSocketEvents 重复调用!');
        }
        this._socketEventsBinded = true;
        gSocketManager.addEventListener(SOCKET_EVENTS.ON_MESSAGE, this._onSocketMessage);
    }

    unbindWebSocketEvents() {
        this._socketEventsBinded = false;
        gSocketManager.removeEventListener(SOCKET_EVENTS.ON_MESSAGE, this._onSocketMessage);
    }

    setChannelsCounts({
        channelCount,
        p2pCount,
        notifyEvent = true
    }) {
        this.channelCount = channelCount;
        this.p2pCount = p2pCount;

        notifyEvent && this.emit(CHANNELS_EVENTS.CHANNELS_COUNT_CHANGE);
    }
    setRecentSessionsLoaded() {
        this.recentSessionsLoaded = true;
    }

    dispose() {
        this._reset();
        this.unbindWebSocketEvents();
    }
}

export default new ChannelManager();
