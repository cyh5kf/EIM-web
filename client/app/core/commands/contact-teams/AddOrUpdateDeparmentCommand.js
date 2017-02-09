//import DataRequest from '../../datarequest/DataRequest';
//import AppDataHandler from '../../datarequest/AppDataHandlerMixin';
//import ApiConfig from '../../constants/ApiConfig';
//import {createCommand} from '../../../utils/command';
//import ContactTeamsStore from '../../stores/ContactTeamsStore';
//import LoginStore from '../../stores/LoginStore';
//import {createImmutableSchemaData} from '../../../utils/schema';
//import {ContactTeamSchema} from '../../schemas/ContactTeamsSchemas';
//import QueryAllDepartmentsShortInfoCmd from './QueryAllDepartmentsShortInfoCmd';
//
//export default createCommand(function ({editingGid = '', name, pid = '-1'}) {
//    const cid = LoginStore.getCid();
//    var dataRequest = new DataRequest({
//        ensureRetAsTrue: true,
//        'body': {
//            'uid': LoginStore.getUID(),
//            'cid': cid,
//            'pid': pid,
//            'name': name,
//            'id': editingGid || undefined,
//            'smd': !editingGid?'organizeService.createDept':'organizeService.modifyDept'
//        },
//        'url': ApiConfig.rpc,
//        'dataType': 'json'
//    });
//    return AppDataHandler.doRequest(dataRequest).then(function(response) {
//        if (!editingGid) {
//            const groupData = createImmutableSchemaData(ContactTeamSchema, {
//                ...response.data.profile,
//                contacts: []
//            });
//            ContactTeamsStore.addContactTeam(groupData, pid);
//        } else {
//            ContactTeamsStore.updateContactTeam(editingGid, group => group.set('name', name));
//            const editingGroup = ContactTeamsStore.getContactTeam(editingGid);
//            if (editingGroup.pid !== pid) {
//                ContactTeamsStore.updateContactTeam(editingGroup.pid, group => {
//                    return group.update('children', children => children.delete(children.findIndex(ch => ch.id === editingGid)));
//                });
//                ContactTeamsStore.addContactTeam(editingGroup, pid);
//            }
//        }
//
//        // 更新团队信息后刷新团队概要信息
//        QueryAllDepartmentsShortInfoCmd();
//
//        ContactTeamsStore.emit('change');
//    });
//}, {
//    name: 'contact-group.AddOrUpdateDepartmentCommand'
//});
