import sortedIndexBy from 'lodash/sortedIndexBy';
import ReconnectingWebSocket from 'reconnectingwebsocket';
import StringUtils from '../utils/StringUtils';
import warning from '../utils/warning';
import ApiConfig from './constants/ApiConfig';
import EventBus from '../utils/EventBus';
import LoginStore from './stores/LoginStore';
import MessagePool from './stores/MessagePool';
import AppDataHandler from './datarequest/AppDataHandlerMixin';

class LimitedMap {
    constructor(keysLimit = 1000) {
        this._limit = keysLimit;
        this._internalMap = {};
        this._keys = [];
    }
    get(key) {
        return this._internalMap[key];
    }
    set(key, val) {
        this._keys.push(key);
        this._internalMap[key] = val;
        if (this._keys.length > this._limit) {
            delete this._internalMap[this._keys.shift()];
        }
    }
}

const NOTIFY_EVENT_MISSING_INTERVAL = 2000;

export const SOCKET_EVENTS = {
    ON_OPEN: 'onOpen',
    ON_CLOSE: 'onClose',
    ON_CONNECTED_CHANGE: 'onConnectedChange',
    ON_MESSAGE: 'onMessage'
}

class SocketManager extends EventBus {
    constructor() {
        super(...arguments);

        this.resetState();
    }

    resetState() {
        if (this._interval) {
            clearInterval(this._interval);
        }
        if (this._ws) {
            this._ws.close();
        }
        this._ws = null;
        this._reconnecttimes = -1;
        this._interval = null;
        this._eventQueue = [];
        this._currentEventSeqNum = -1;
        this._handledEventMap = new LimitedMap(1000);
        this._isInited = false;
    }

    _handleQueuedEvent(event) {
        const {eventTime, eventUuid} = event;
        if (!this._handledEventMap.get(eventUuid)) {
            this.emit(SOCKET_EVENTS.ON_MESSAGE, event);
            MessagePool.saveSyncTime(eventTime);
            this._handledEventMap.set(eventUuid, true);
            return true;
        } else {
            if (__DEV__) {
                console.warn('SocketManager._handleQueuedEvent: 发现重复事件');
            }
            return false;
        }
    }

    _runEventQueue() {
        const firstEvent = this._eventQueue[0];
        if (firstEvent && !this._syncingEventLog) {
            const seqNum = firstEvent.seqNum,
                currSeqNum = this._currentEventSeqNum;
            if (currSeqNum !== -1 && currSeqNum < seqNum - 1) {
                this._queuedEventMissingTimer = this._queuedEventMissingTimer || setTimeout(this._onQueuedEventMissing, NOTIFY_EVENT_MISSING_INTERVAL);
            } else {
                if (currSeqNum === -1 || currSeqNum === seqNum - 1) {
                    if (this._handleQueuedEvent(firstEvent)) {
                        this._currentEventSeqNum = seqNum;
                    } else if (__DEV__ && currSeqNum === seqNum - 1) {
                        warning('SocketManager._runEventQueue: 下一个事件的序号正确但是却错误的重复了!');
                    }
                } else if (__DEV__) { // currSeqNum > seqNum - 1
                    warning('SocketManager._runEventQueue: 下一个事件事件的序号错误的比之前处理过的事件序号更小!');
                }

                this._eventQueue.shift();
                if (this._queuedEventMissingTimer) {
                    clearTimeout(this._queuedEventMissingTimer);
                    this._queuedEventMissingTimer = null;
                }

                // 成功执行后, 继续尝试执行下一条
                this._runEventQueue();
            }
        }
    }

    _onQueuedEventMissing = () => {
        if (__DEV__) {
            console.warn('SocketManager._onQueuedEventMissing: 事件序号不正常, 正在同步离线事件...');
        }
        this._syncEventLog();
    }

    _insertQueuedEvent(queuedEvent) {
        const insertIdx = sortedIndexBy(this._eventQueue, queuedEvent, 'seqNum');
        this._eventQueue.splice(insertIdx, 0, queuedEvent);
        this._runEventQueue();
    }

    _syncEventLog() {
        if (!this._syncingEventLog) {
            this._syncingEventLog = true;

            (new Promise((resolve, reject) => {
                const syncNextEventLog = () => {
                    const syncTime = MessagePool.lastSyncTime();
                    return AppDataHandler.doRequest({
                        url: ApiConfig.rpc,
                        body: {
                            uid: LoginStore.getUID(),
                            beginTime: syncTime || Date.now(),
                            endTime: Date.now(),
                            smd: 'msgsync.syncEventLog'
                        }
                    }).then(response => {
                        (response.data.eventLog || []).forEach(event => {
                            this._handleQueuedEvent(event);
                        });

                        if (response.data.isLastBatch === false) {
                            syncNextEventLog();
                        } else {
                            resolve();
                        }
                    }).catch(reject);
                };

                syncNextEventLog();
            })).then(() => {
                this._syncingEventLog = false;
                this._currentEventSeqNum = -1; // 离线事件同步完成后, 重置事件序列号
            });
        }
    }

    isConnected() {
        return this._ws && this._ws.readyState === ReconnectingWebSocket.OPEN;
    }

    openWebSocket() {
        if (!this._isInited) {
            const url = StringUtils.format(ApiConfig.Channel.websocket, LoginStore.getUID(), LoginStore.getToken());

            this._ws = new ReconnectingWebSocket(url, null, {
                // debug: true // 有需要时在本地开发环境开启
            });
            this._ws.onmessage = this._onMessage;
            this._ws.onopen = this._onOpen;
            this._ws.onclose = this._onClose;
            this._isInited = true;
        }
    }

    closeWebSocket() {
        this.resetState();
    }

    _startPing() {
        this._interval = setInterval(() => {
            this._ws.send(JSON.stringify({
                type: 'ping'
            }));
        }, 10000);
    }

    _onOpen = () => {
        this._startPing();

        this._reconnecttimes++;
        //每次断线重连,需要同步消息
        if (this._reconnecttimes > 0) {
            console.warn('Socket 已断线重连.');
            this._syncEventLog();
        }
        this.emit(SOCKET_EVENTS.ON_OPEN);
        this.emit(SOCKET_EVENTS.ON_CONNECTED_CHANGE);
    }

    _onClose = () => {
        clearInterval(this._interval);
        this.emit(SOCKET_EVENTS.ON_CLOSE);
        this.emit(SOCKET_EVENTS.ON_CONNECTED_CHANGE);
    }

    _onMessage = (event) => {
        const eventMessage = JSON.parse(event.data);
        if (eventMessage.type === 'pong') {
            return;
        }

        if (eventMessage.type === 'notify') {
            if (eventMessage.data.seqNum != null) {
                this._insertQueuedEvent(eventMessage.data);
            } else {
                this.emit(SOCKET_EVENTS.ON_MESSAGE, eventMessage.data);
            }
        }
    }
}

export default new SocketManager();
