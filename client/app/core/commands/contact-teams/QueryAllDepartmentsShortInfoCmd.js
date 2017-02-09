//import AppDataHandler from '../../datarequest/AppDataHandlerMixin';
//import ApiConfig from '../../constants/ApiConfig';
//import {createCommand} from '../../../utils/command';
//import ContactTeamsStore from '../../stores/ContactTeamsStore';
//import LoginStore from '../../stores/LoginStore';
//import {createImmutableSchemaData} from '../../../utils/schema';
//import {ContactTeamShortListSchema} from '../../schemas/ContactTeamsSchemas';
//
//export default createCommand(function () {
//    return AppDataHandler.doRequest({
//        ensureRetAsTrue: true,
//        'body': {
//            'cid': LoginStore.getCid(),
//            'uid': LoginStore.getUID(),
//            'smd': 'organizeService.getAllDepartments'
//        },
//        'url': ApiConfig.rpc
//    }).then(function(response) {
//        ContactTeamsStore.setAllContactTeamsShortInfo(createImmutableSchemaData(ContactTeamShortListSchema, response.data.depts));
//        ContactTeamsStore.emit('change');
//    });
//}, {
//    name: 'contact-group.QueryAllDepartmentsShortInfoCmd'
//})
