import EventEmitter from 'eventemitter2';
import _ from 'underscore';

export const COMMON_EVENTS = {
    ON_CHANGE: 'change'
}

export default class EventBus {
    constructor(props) {
        _.assign(this, props);
        this._emitter = new EventEmitter({
            wildcard: true,
            maxListeners: 30
        });
    }

    emit(eventName, message) {
        this._emitter.emit(eventName, message);
    }

    on(eventName, callback) {
        this._emitter.on(eventName, callback);
    }

    off(eventName, callback) {
        this._emitter.off(eventName, callback);
    }

    once(eventName, callback) {
        this._emitter.once(eventName, callback);
    }

    addEventListener(eventName, callback) {
        this._emitter.on(eventName, callback);
    }

    removeEventListener(eventName, callback) {
        this._emitter.off(eventName, callback);
    }

    hasEvent(eventName) {
        return this._emitter.listeners(eventName).length > 0;
    }
}

export function createEventBus(spec = {}) {
    return new EventBus(spec);
}
