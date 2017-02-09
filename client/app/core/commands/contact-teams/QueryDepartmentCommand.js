//import DataRequest from '../../datarequest/DataRequest';
//import AppDataHandler from '../../datarequest/AppDataHandlerMixin';
//import ApiConfig from '../../constants/ApiConfig';
//import {createCommand} from '../../../utils/command';
//import ContactTeamsStore from '../../stores/ContactTeamsStore';
//import LoginStore from '../../stores/LoginStore';
//import {createImmutableSchemaData} from '../../../utils/schema';
//import {ContactTeamSchema} from '../../schemas/ContactTeamsSchemas';
//
//export default createCommand(function ({gid = '-1'} = {}) {
//    //如果did == -1,默认toplevel一级目录
//    const cid = LoginStore.getCid();
//    var dataRequest = new DataRequest({
//        ensureRetAsTrue: true,
//        'body': {
//            'cid': cid,
//            'uid': LoginStore.getUID(),
//            'did': gid,
//            'smd': 'organizeService.searchDept'
//        },
//        'url': ApiConfig.rpc,
//        'dataType': 'json'
//    });
//    return AppDataHandler.doRequest(dataRequest).then(function(response) {
//        var dept = response.data.dept;
//        ContactTeamsStore.updateContactTeam(dept.id, prevGroup => {
//            const newGroup = createImmutableSchemaData(ContactTeamSchema, dept);
//            return newGroup.set('contacts', prevGroup.contacts);
//        });
//
//        ContactTeamsStore.emit('change');
//    });
//}, {
//    name: 'contact-group.QueryDepartmentCommand',
//    getCmdKey: ({gid = '-1'} = {}) => gid
//})
