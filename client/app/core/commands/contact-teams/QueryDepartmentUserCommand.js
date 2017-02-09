//import DataRequest from '../../datarequest/DataRequest';
//import AppDataHandler from '../../datarequest/AppDataHandlerMixin';
//import ApiConfig from '../../constants/ApiConfig';
//import {createCommand} from '../../../utils/command';
//import ContactTeamsStore from '../../stores/ContactTeamsStore';
//import LoginStore from '../../stores/LoginStore';
//import {createImmutableSchemaData} from '../../../utils/schema';
//import {ContactListSchema} from '../../schemas/ContactTeamsSchemas';
//
//export default createCommand(function ({gid = '-1'} = {}) {
//    var dataRequest = new DataRequest({
//        ensureRetAsTrue: true,
//        'body': {
//            'cid': LoginStore.getCid(),
//            'uid': LoginStore.getUID(),
//            'did': gid,
//            'smd': 'organizeService.searchDeptMember'
//        },
//        'url': ApiConfig.rpc,
//        'dataType': 'json'
//    });
//    return AppDataHandler.doRequest(dataRequest).then(function(response) {
//        ContactTeamsStore.updateContactTeam(gid, group => {
//            return group.set('contacts', createImmutableSchemaData(ContactListSchema, response.data.members));
//        });
//
//        ContactTeamsStore.emit('change');
//    });
//}, {
//    name: 'contact-group.QueryDepartmentUserCommand',
//    getCmdKey: ({gid = '-1'} = {}) => gid
//});
