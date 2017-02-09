import EventBus from '../../utils/EventBus';

let pendingData = [];
let acceptedData = [];
let inviteResultData = [];
export const EVENT = {
    INVITATION_MEMBER:'invitation',
    REVOKE_INVITATION:'revoke',
    RESENT_INVITATION:'resent',
    INVITATION_RECORD:'record'
}

class InvitationStore extends EventBus{
    
    getPendingData(){
        return pendingData;
    }

    getAcceptedData(){
        return acceptedData;
    }

    getInviteResultData(){
        return inviteResultData;
    }

    memberInvitation(data){
        inviteResultData = data;
        this.emit(EVENT.INVITATION_MEMBER, data);
    }

    revokeInvitation(email){
        let total = 0, pendingList = pendingData.items;
        let index = pendingList.findIndex(n => n.email === email);
        if (index > -1) {
            pendingList = pendingList.delete(index);
            total = pendingData.total - 1;
        }
        pendingData = pendingData.set("total", total);
        pendingData = pendingData.set("items", pendingList);
        this.emit(EVENT.REVOKE_INVITATION);
    }

    resentInvitation(itemList){
        let pendingList = pendingData.items;
        if (itemList&&itemList.size>0){
            itemList.forEach(function(val,i){
                let index = pendingList.findIndex(n => n.email === val.email);
                pendingList = pendingList.delete(index);
            });
        }
        pendingList = itemList.concat(pendingList);
        pendingData = pendingData.set("items",pendingList);
        this.emit(EVENT.RESENT_INVITATION);
    }

    saveInvitationRecord(result){
        pendingData = result[0];
        acceptedData = result[1];
        this.emit(EVENT.INVITATION_RECORD);
    }
}

export default new InvitationStore();