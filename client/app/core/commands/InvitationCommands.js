import _ from 'underscore';
import WebApiUtils from '../../utils/WebApiUtils';
import {createCommand} from '../../utils/command';
import LoginStore from '../../core/stores/LoginStore';
import InvitationStore from '../../core/stores/InvitationStore';
import LocaleConfig from '../../core/locale-config/LocaleConfig';
import {createImmutableSchemaData} from '../../utils/schema';
import {InvitationSchema,InvitationResultSchema} from '../schemas/InvitationSchemas';
import {EnsureTeamMembersExistCmd} from '../commands/TeamMembersCommands';


function makeUidString(data,propName){
    if(data){
        if (_.isArray(data)) {
            _.each(data, function (d) {
                var v = d[propName];
                if (v) {
                    d[propName] = "" + v;
                }
            });
        }

        else if (_.isObject(data)) {
            var v = data[propName];
            if (v) {
                data[propName] = "" + v;
            }
        }
    }

    return data;
}


export const getInvitationRecordCmd = createCommand(function(obj) {
    obj.uid = LoginStore.getUID();
    obj.cid = LoginStore.getCid();


    var otherObj = _.extend({}, obj, {status: 1});

    var arr = [WebApiUtils.getInviteUserApi(obj),WebApiUtils.getInviteUserApi(otherObj)];

    Promise.all(arr).then(function(result) {
        let pendingReq = result[0].data,acceptedsReq = result[1].data;

        var pendingReqUser =  makeUidString(pendingReq.user,'byUid');
        var acceptedsReqUser = makeUidString(acceptedsReq.user,'byUid');


        let pendings = createImmutableSchemaData(InvitationSchema, {items:pendingReqUser,total:pendingReq.pageable.total});
        let accepteds = createImmutableSchemaData(InvitationSchema, {items:acceptedsReqUser,total:acceptedsReq.pageable.total});
        let totalData = _.union(pendingReq.user,acceptedsReq.user);
        let uids = totalData.map(user => user.byUid);
        uids = _.uniq(uids);
        EnsureTeamMembersExistCmd(uids).then(()=>{
            let invitesData = [pendings,accepteds];
            InvitationStore.saveInvitationRecord(invitesData);
        });
    }).catch(function(error) {
        console.log(error);
    });

}, {
    name: 'getInvitationRecordCmd'
});

export const inviteMemberCmd = createCommand(function(users, message, gids) {
    return WebApiUtils.inviteUserApi({
        users: users,
        message: message,
        gids: gids,
        uid: LoginStore.getUID(),
        cid: LoginStore.getCid()
    }).then((result)=>{
        var user = makeUidString(result.data.user,'byUid');
        let invitationItem = createImmutableSchemaData(InvitationResultSchema,user);
        InvitationStore.memberInvitation(invitationItem);
        return invitationItem;
    });

}, {
    name: 'inviteMemberCmd'
});

export const revokeInvitationCmd = createCommand(function(item){
    item.uid = LoginStore.getUID();
    item.cid = LoginStore.getCid();
    return WebApiUtils.undoInvitationApi(item).then((data)=>{
        InvitationStore.revokeInvitation(item.email);
    });
});

export const resentInvitationCmd = createCommand(function(users,message,gids){
    return WebApiUtils.inviteUserApi({
        users: users,
        message: message,
        gids: gids,
        langType: LocaleConfig.getLocale() === 'en-US' ? 0 : 1,
        uid: LoginStore.getUID(),
        cid: LoginStore.getCid()
    }).then((result)=>{
        var user = makeUidString(result.data.user,'byUid');
        let invitationItem = createImmutableSchemaData(InvitationResultSchema,user);
        InvitationStore.resentInvitation(invitationItem);
    });
})
