//import AppDataHandler from '../../datarequest/AppDataHandlerMixin';
//import ApiConfig from '../../constants/ApiConfig';
//import {createCommand} from '../../../utils/command';
//import LoginStore from '../../stores/LoginStore';
//import {createImmutableSchemaData} from '../../../utils/schema';
//import {ContactTeamShortListSchema} from '../../schemas/ContactTeamsSchemas';
//
//export default createCommand(function (contactUid) {
//    return AppDataHandler.doRequest({
//        ensureRetAsTrue: true,
//        body: {
//            uid: LoginStore.getUID(),
//            touid: contactUid,
//            smd: 'organizeService.getDepartmentByUid'
//        },
//        url: ApiConfig.rpc
//    }).then(response => createImmutableSchemaData(ContactTeamShortListSchema, response.data.depts));
//}, {
//    name: 'contact-group.QueryDepartmentsForContactCmd'
//})
