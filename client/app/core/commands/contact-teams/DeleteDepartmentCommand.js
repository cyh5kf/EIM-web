//import AppDataHandler from '../../datarequest/AppDataHandlerMixin';
//import ApiConfig from '../../constants/ApiConfig';
//import {createCommand} from '../../../utils/command';
//import ContactTeamsStore from '../../stores/ContactTeamsStore';
//import LoginStore from '../../stores/LoginStore';
//
//export default createCommand(function (teamid) {
//    return AppDataHandler.doRequest({
//        ensureRetAsTrue: true,
//        'body': {
//            'cid': LoginStore.getCid(),
//            'uid': LoginStore.getUID(),
//            'id': teamid,
//            'smd': 'organizeService.deleteDept'
//        },
//        'url': ApiConfig.rpc
//    }).then(function() {
//        ContactTeamsStore.deleteContactTeam(teamid);
//        ContactTeamsStore.emit('change');
//    });
//}, {
//    name: 'contact-group.DeleteDepartmentCommand'
//})
