//import {createCommand} from '../../../utils/command';
//import ContactTeamsStore, {ROOT_TEAM_ID} from '../../stores/ContactTeamsStore';
//
//export default createCommand(function () {
//    ContactTeamsStore.updateContactTeam(ROOT_TEAM_ID, rootTeam => rootTeam.update('children', subteams => {
//        // 初始化时, 尽量保留根分组数据以提升首次渲染效果, 但是移除子分组的数据
//        return subteams && subteams.map(subteam => subteam.set('children', null).set('contacts', null));
//    }));
//}, {
//    name: 'contact-group.InitializeContactTeamsDataCmd'
//})
