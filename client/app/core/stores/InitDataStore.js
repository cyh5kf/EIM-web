import {createEventBus} from '../../utils/EventBus';
import ContactGroupsStore, {EVENTS as ContactGroupsEvents} from './ContactGroupsStore';
import TeamMembersStore, {TEAM_MEMBERS_EVENTS} from './TeamMembersStore';
import _ from 'underscore';

let name2UIDMap = {};

const getUsers = () => TeamMembersStore.getTeamMembers();
const updateGroupsIdMap = () => {
    const groups = ContactGroupsStore.getContactGroups();
    groups && groups.forEach((item, key)=>{
        if(item.name){
            name2UIDMap[item.name] = {id:item.guuid, isgroup:true};
        }
    });
};
const updateTeamMembersIdMap = () => {
    const teamMembers = getUsers();
    teamMembers && teamMembers.forEach((item, key)=>{
        const username = item.username;
        const realname = item.firstname + item.lastname;
        const uid = item.uid;
        if(username){
            name2UIDMap[username] = {id:uid, isgroup:false};
        }
        if(realname){
            name2UIDMap[realname] = {id:uid, isgroup:false};
        }
    });
};

updateGroupsIdMap();
updateTeamMembersIdMap();

ContactGroupsStore.addEventListener(ContactGroupsEvents.CHANGE, updateGroupsIdMap);
TeamMembersStore.addEventListener(TEAM_MEMBERS_EVENTS.ON_CHANGE,updateTeamMembersIdMap);


export default createEventBus({
    getContactGroups() {
        return ContactGroupsStore.getContactGroups();
    },

    getUIDByAtText(text){
        return name2UIDMap[text];
    },

    getNameByIdentifyId(identifyId){
        let name = '';
        _.map(name2UIDMap, (value, key)=>{
            if(value.id === identifyId){
                name = key;
                return false;
            }
        });
        return name;
    },

    getMatchByInputString(inputStr = ''){
        let contactGroup = this.getContactGroups();
        let users = getUsers();
        let queryMatch = [];
        if(!inputStr){
            if(users){
                queryMatch.push(users);
            }
        }else{
            //what about the performance of filter ..todo testing
             if(users){
                let filters = users.filter(item=>{
                    const realname = item.firstname + item.lastname;
                    return item.username.indexOf(inputStr) > -1 || realname && realname.indexOf(inputStr) > -1
                    || item.email && item.email.indexOf(inputStr) > -1;
                });
                if(filters.size  > 0){
                  queryMatch.push(filters);
                }
            }
             if(contactGroup){
                let filters = contactGroup.filter(item=>{
                    return item.name.indexOf(inputStr) > -1;
                });
                if(filters.size  > 0){
                  queryMatch.push(filters);
                }
            }
        }
        return queryMatch;
    }
});
