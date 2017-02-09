//import _ from 'underscore';
//import AppDataHandler from '../../datarequest/AppDataHandlerMixin';
//import ApiConfig from '../../constants/ApiConfig';
//import {createCommand} from '../../../utils/command';
//import ContactTeamsStore from '../../stores/ContactTeamsStore';
//import LoginStore from '../../stores/LoginStore';
//
///**@param {Array.<{uid, did}>} contacts*/
//export default createCommand(function ({contactUid, teamIds, originTeamIds}) {
//    AppDataHandler.doRequest({
//        ensureRetAsTrue: true,
//        'body': {
//            'cid': LoginStore.getCid(),
//            'uid': LoginStore.getUID(),
//            'uids': [contactUid],
//            'dids': teamIds,
//            'smd': 'organizeService.moveMembers'
//        },
//        'url': ApiConfig.rpc
//    }).then(function () {
//        const leavedTeamIds = _.difference(originTeamIds, teamIds),
//            joinedTeamIds = _.difference(teamIds, originTeamIds);
//        leavedTeamIds.forEach(teamId => ContactTeamsStore.onContactLeave(teamId, contactUid));
//        joinedTeamIds.forEach(teamId => ContactTeamsStore.onContactJoin(teamId));
//
//
//        ContactTeamsStore.emit('change');
//    });
//}, {
//    name: 'contact-group.MoveUserFromDepartmentCommand'
//});
