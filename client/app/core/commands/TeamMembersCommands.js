import {createCommand} from '../../utils/command';
import AppDataHandler from '../datarequest/AppDataHandlerMixin';
import ApiConfig from '../constants/ApiConfig';
import LoginStore from '../stores/LoginStore';
import TeamMembersStore from '../stores/TeamMembersStore';

export const QueryTeamMembersCmd = createCommand(function () {
    const uid = LoginStore.getUID();
    return AppDataHandler.doRequest({
        url: ApiConfig.rpc,
        body: {
            smd: 'account.getAllCompanyUser',
            uid
        }
    }).then(response => {
        TeamMembersStore.onMembersChanged(response.data.user);
    });
});


const _queryUsers = uids => AppDataHandler.doRequest({
    url: ApiConfig.rpc,
    body: {
        uid: LoginStore.getUID(),
        targetUid: uids,
        smd: 'account.batchGetUserProfileByID'
    }
}).then(response => TeamMembersStore.onMembersChanged(response.data.profile));

export const EnsureTeamMembersExistCmd = createCommand(function (uids) {
    const notExistedUids = uids.filter(uid => !TeamMembersStore.getTeamMemberByUid(uid, {showWarning: false}));
    return notExistedUids.length ? _queryUsers(notExistedUids) : Promise.resolve();
});

export const UpdateMemberRoleCmd = createCommand(function ({originStatus, targetUid, role}) {
    return AppDataHandler.doRequest({
        url: ApiConfig.rpc,
        body: {
            smd: 'account.updateUserRole',
            uid: LoginStore.getUID(),
            targetUid: targetUid,
            role: role
        }
    }).then(() => {
        TeamMembersStore.onMembersChanged([{
            uid: targetUid,
            role: role
        }])
    });
}, {
    getCmdKey: ({targetUid}) => targetUid
});


export const UpdateMemberStatusCmd = createCommand(function ({originStatus, targetUid, status}) {
    return AppDataHandler.doRequest({
        url: ApiConfig.rpc,
        body: {
            smd: 'account.updateUserStatus',
            uid: LoginStore.getUID(),
            targetUid: targetUid,
            status: status
        }
    }).then(() => {
        TeamMembersStore.onMembersChanged([{
            uid: targetUid,
            status: status
        }]);
    });
}, {
    getCmdKey: ({targetUid}) => targetUid
});
