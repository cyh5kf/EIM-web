import EventBus from '../../utils/EventBus';

export const FAVOURITES_EVENTS = {
    QUERYSTARREDMSG: 'favouritesInfo'
}

let favouritesInfo = {
    favouritesList: [],
    isLastBatch: false
}


class FavouritesStore extends EventBus {
    getStarredMsg() {
        return favouritesInfo;
    }

    getStarredTime(text) {
        var x = new Date(text);
        var v = x.getFullYear() + '-' + (x.getMonth() + 1) + '-' + x.getDate();
        return v;
    }

    getMsgUuid() {
        let favouritesArray = favouritesInfo.favouritesList;
        return favouritesArray.last().msg.msgUuid;
    }

    getLastTime() {
        let favouritesArray = favouritesInfo.favouritesList;
        return favouritesArray.last().starredTime;
    }

    getMessageTextData(message) {
        let messageData = {};
        messageData.eventtype = message.eventType;
        messageData.text = message.eventData.textMsg.text.text;
        return messageData;
    }

    deleteStarredMsg(msguuid) {
        let messageIndex = favouritesInfo.favouritesList.findIndex(function(n){
            return n.msg.msgUuid === msguuid;
        });
        if(messageIndex > -1) {
            favouritesInfo.favouritesList = favouritesInfo.favouritesList.delete(messageIndex);
        }
        this.emit(FAVOURITES_EVENTS.QUERYSTARREDMSG);
    }

    queryStarredMsg(starredMsg) {
        favouritesInfo.favouritesList = starredMsg.starredMsg;
        favouritesInfo.isLastBatch = starredMsg.isLastBatch;
        this.emit(FAVOURITES_EVENTS.QUERYSTARREDMSG);
    }

    appendStarredMsg(starredMsg) {
        favouritesInfo.favouritesList = favouritesInfo.favouritesList.concat(starredMsg.starredMsg);
        favouritesInfo.isLastBatch = starredMsg.isLastBatch;
        this.emit(FAVOURITES_EVENTS.QUERYSTARREDMSG);
    }
}
export default new FavouritesStore();
