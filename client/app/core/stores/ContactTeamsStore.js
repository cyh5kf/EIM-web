//import StoreFactory from './StoreFactory';
//import {createImmutableSchemaData} from '../../utils/schema';
//import {ContactTeamSchema} from '../schemas/ContactTeamsSchemas';
//
//export const ROOT_TEAM_ID = '-1',
//    TMP_ROOT_TEAM_NAME = '__TMP__';
//
//let rootContactTeam = createImmutableSchemaData(ContactTeamSchema, {
//    id: ROOT_TEAM_ID,
//    pid: '',
//    name: TMP_ROOT_TEAM_NAME,
//    order: '0',
//    count: '0'
//});
//let teamsShortInfo = null;
//
//let teamPathsCache;
//function resetCache() {
//    teamPathsCache = {
//        [ROOT_TEAM_ID]: [],
//        __relatedRootTeam: rootContactTeam
//    };
//}
//
//function updateTeamPathsCache() {
//    if (teamPathsCache.__relatedRootTeam === rootContactTeam) {
//        return;
//    }
//
//    resetCache();
//
//    const findTeams = (baseGroup, path) => {
//        teamPathsCache[baseGroup.id] = path;
//        path = path.concat(['children']);
//        (baseGroup.children || []).forEach((childGrp, idx) => findTeams(childGrp, path.concat([idx])));
//    };
//    findTeams(rootContactTeam, []);
//}
//
//function findGroupPath(gid) {
//    const cachedPath = teamPathsCache[gid];
//    if (cachedPath) {
//        // 验证缓存的路径
//        const group = rootContactTeam.getIn(cachedPath);
//        if (group && group.id === gid) {
//            return cachedPath;
//        }
//    }
//
//    // 没找到缓存, 整个遍历一遍, 更新路径缓存
//    updateTeamPathsCache();
//
//    return teamPathsCache[gid] || null;
//}
//
//
//resetCache();
//
//export default StoreFactory.createStore({
//    getAllContactTeamsShortInfo() {
//        return teamsShortInfo;
//    },
//    setAllContactTeamsShortInfo(newTeamsInfo) {
//        teamsShortInfo = newTeamsInfo;
//    },
//
//    getRootContactTeam() {
//        return rootContactTeam;
//    },
//    getContactTeam(gid = ROOT_TEAM_ID) {
//        const groupPath = findGroupPath(gid);
//        return groupPath && rootContactTeam.getIn(groupPath) || null;
//    },
//
//    updateContactTeam(gid, updater) {
//        const groupPath = findGroupPath(gid);
//        if (groupPath) {
//            rootContactTeam = rootContactTeam.updateIn(groupPath, team => {
//                let newTeam = updater(team);
//                if (newTeam.children !== team.children) {
//                    newTeam = newTeam.update('children', children => children && children.sortBy(child => child.order));
//                }
//                if (newTeam.contacts !== team.contacts) {
//                    newTeam = newTeam.update('contacts', contacts => contacts && contacts.sortBy(contact => contact.order));
//                }
//                return newTeam;
//            });
//        } else if (__DEV__) {
//            console.error(`ContactTeamsStore.updateContactTeam: 要更新的团队分组(id: ${gid})不存在`);
//        }
//    },
//    addContactTeam(newGroup, parentGid = ROOT_TEAM_ID) {
//        this.updateContactTeam(parentGid, group => {
//            return group.update('children', children => children && children.push(newGroup));
//        });
//    },
//    deleteContactTeam(teamid) {
//        const deletedTeam = this.getContactTeam(teamid);
//        if (deletedTeam) {
//            this.updateContactTeam(deletedTeam.pid, parentTeam => parentTeam.update('children', children => {
//                return children && children.filter(team => team.id !== deletedTeam.id);
//            }));
//        }
//    },
//    onContactLeave(gid, leavedContactUid) {
//        this.updateContactTeam(gid, group => {
//            return group.update('contacts', contacts => contacts && contacts.delete(contacts.findIndex(ct => ct.uid === leavedContactUid)))
//                .update('count', count => count - 1);
//        });
//    },
//    onContactJoin(gid) {
//        this.updateContactTeam(gid, group => {
//            return group.set('contacts', null) // 标记空以下次重新获取
//                .update('count', count => count + 1);
//        });
//    }
//});
