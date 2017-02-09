import createUuid from '../core-utils/createUuid';
import {createCommand} from '../../utils/command';
import AppDataHandler from '../datarequest/AppDataHandlerMixin';
import ApiConfig from '../constants/ApiConfig';
import EnumContactGroupStatus from '../enums/EnumContactGroupStatus';
import {EnsureTeamMembersExistCmd} from '../commands/TeamMembersCommands';
import {createImmutableSchemaData, mergeImmutableSchemaData} from '../../utils/schema';
import {ContactGroupListSchema, ContactGroupSchema, GroupMemberListSchema} from '../schemas/ContactGroupsSchemas';
import LoginStore from '../stores/LoginStore';
import ContactGroupsStore from '../stores/ContactGroupsStore';
import TeamMembersStore from '../stores/TeamMembersStore';
import {queryChannelInfo} from '../apis/ChannelApis';

function getChannelInfo(channelId) {
    return queryChannelInfo(channelId)
        .then(groupfullinfo => {
            const channelInfo = groupfullinfo.group;
            return EnsureTeamMembersExistCmd([channelInfo.creatoruid])
                .then(() => {
                    return {
                        channelId,
                        ispublic: channelInfo.ispublic,
                        channelCreateTime: channelInfo.gmtcreate,
                        channelName: channelInfo.groupname,
                        channelCreatorInfo: TeamMembersStore.getTeamMemberByUid(channelInfo.creatoruid).toJS()
                    };
                });
        });
}

export const queryContactGroupsCmd = createCommand(function () {
    return AppDataHandler.doRequest({
        ensureRetAsTrue: true,
        url: ApiConfig.rpc,
        body: {
            smd: 'organize.getAllGroupTeams',
            uid: LoginStore.getUID(),
            cid: LoginStore.getCid()
        }
    }).then(response => {
        const groups = response.data.members;
        return EnsureTeamMembersExistCmd(groups.filter(group => group.channel).map(group => group.channelCreator))
            .then(() => {
                ContactGroupsStore.updateContactGroups(() => createImmutableSchemaData(ContactGroupListSchema, groups.map(group => ({
                    ...group,
                    channel: !group.channel ? null : {
                        channelId: group.channel,
                        ispublic: group.ispublic,
                        channelCreateTime: group.channelCreateTime,
                        channelName: group.channelName,
                        channelCreatorInfo: TeamMembersStore.getTeamMemberByUid(group.channelCreator).toJS()
                    }
                }))));
            });
    });
}, {
    name: 'queryContactGroupsCmd'
});

export const queryGroupMembersCmd = createCommand(function ({guuid}) {
    return AppDataHandler.doRequest({
        ensureRetAsTrue: true,
        url: ApiConfig.rpc,
        body: {
            smd: 'organizeService.getGroupTeamMember',
            uid: LoginStore.getUID(),
            guuid
        }
    }).then(response => {
        ContactGroupsStore.updateContactGroup(guuid, group => {
            return group.set('members', createImmutableSchemaData(GroupMemberListSchema, response.data.members));
        });
    });
}, {
    name: 'queryGroupMembersCmd',
    getCmdKey: ({guuid}) => guuid
});


let syncingInterval = null;
export const KeepSyncingGroupsCmd = createCommand(function () {
    if (!syncingInterval) {
        return queryContactGroupsCmd()
            .then(() => {
                syncingInterval = setInterval(queryContactGroupsCmd, 300 * 1000);
            }); // 每隔五分钟同步一次
    }
}, {name: 'teamMembers.KeepSyncingGroupsCmd'});

export const StopSyncingGroupsCmd = createCommand(function () {
    syncingInterval && clearInterval(syncingInterval);
});


export const addOrEditContactGroupCmd = createCommand(function ({guuid = '', name, desc = undefined, defaultChannelId = undefined, uids = undefined}) {
    const uid = LoginStore.getUID(),
        isCreating = !guuid,
        tgtGuuid = isCreating ? createUuid() : guuid;
    return AppDataHandler.doRequest({
        ensureRetAsTrue: true,
        url: ApiConfig.rpc,
        body: {
            smd: isCreating ? 'organizeService.addGroupTeam' : 'organizeService.updateGroupTeam',
            uid: uid,
            uids: isCreating ? (uids || []) : undefined,
            groupTeam: {
                uid: uid,
                cid: LoginStore.getCid(),
                guuid: tgtGuuid,
                name,
                desc,
                channel: defaultChannelId || undefined
            }
        }
    }).then(() => {
        (defaultChannelId ? getChannelInfo(defaultChannelId) : Promise.resolve(null))
            .then(channelInfo => {
                const groupInfo = {
                    guuid: tgtGuuid,
                    name,
                    desc,
                    channel: channelInfo
                };
                if (isCreating) {
                    ContactGroupsStore.updateContactGroups(groups => {
                        return groups.push(createImmutableSchemaData(ContactGroupSchema, {
                            ...groupInfo,
                            members: (uids || []).map(uid => {
                                const member = TeamMembersStore.getTeamMemberByUid(uid);
                                return {
                                    guuid: tgtGuuid,
                                    uid: member.uid,
                                    username: member.username,
                                    firstname: member.firstname,
                                    lastname: member.lastname,
                                    avatar: member.avatar
                                };
                            }),
                            username: LoginStore.getUserName(),
                            status: EnumContactGroupStatus.Enabled,
                            time: Date.now().toString(),
                            count: (uids && uids.length || 0).toString()
                        }));
                    });
                } else {
                    ContactGroupsStore.updateContactGroup(tgtGuuid, group => mergeImmutableSchemaData(ContactGroupSchema, group, groupInfo));
                }
            });
    });
}, {
    name: 'addOrEditContactGroupCmd'
});


export const updateContactGroupStatusCmd = createCommand(function ({guuid, status}) {
    return AppDataHandler.doRequest({
        url: ApiConfig.rpc,
        ensureRetAsTrue: true,
        body: {
            smd: 'organizeService.updateGroupTeamStatus',
            uid: LoginStore.getUID(),
            cid: LoginStore.getCid(),
            guuid,
            status
        }
    }).then(() => {
        ContactGroupsStore.updateContactGroup(guuid, group => {
            return group.set('status', status);
        });
    });
}, {
    name: 'updateContactGroupStatusCmd',
    getCmdKey: ({guuid}) => guuid
});


export const updateGroupMembersCmd = createCommand(function ({guuid, uids}) {
    return AppDataHandler.doRequest({
        ensureRetAsTrue: true,
        url: ApiConfig.rpc,
        body: {
            smd: 'organizeService.addGroupTeamMember',
            uid: LoginStore.getUID(),
            cid: LoginStore.getCid(),
            guuid,
            uids
        }
    }).then(() => {
        ContactGroupsStore.updateContactGroup(guuid, group => {
            return mergeImmutableSchemaData(ContactGroupSchema, group, {
                count: uids.length.toString(),
                members: (uids || []).map(uid => {
                    const member = TeamMembersStore.getTeamMemberByUid(uid);
                    return {
                        guuid: guuid,
                        uid: member.uid,
                        username: member.username,
                        firstname: member.firstname,
                        lastname: member.lastname,
                        avatar: member.avatar
                    };
                })
            });
        });
    });
}, {
    name: 'updateGroupMembersCmd'
});
