import AppDataHandler from '../../datarequest/AppDataHandlerMixin';
import LoginStore from '../../stores/LoginStore';
import ChannelsStore from '../../stores/ChannelsStore';
import TeamMembersStore from '../../stores/TeamMembersStore';
import ApiConfig from '../../constants/ApiConfig';
import {createCommand} from '../../../utils/command';
import {EnsureTeamMembersExistCmd} from '../TeamMembersCommands';
import {queryChannelInfo} from '../../apis/ChannelApis';
import createUuid from '../../core-utils/createUuid';

export const QueryGroupInfoCommand = createCommand(function (sessionid){
    if(!ChannelsStore.getChannel(sessionid).channelData.isDetailPulled){
        return queryChannelInfo(sessionid).then(function(groupfullinfo) {
            return EnsureTeamMembersExistCmd(groupfullinfo.user.map(user => user.uid).concat([groupfullinfo.group.creatoruid]))
                .then(() => {
                    const uidMap = groupfullinfo.user.reduce((result, user) => {
                        result[user.uid] = user;
                        return result;
                    }, {});
                    const channel = ChannelsStore.getChannel(sessionid);
                    if (channel) {
                        channel.setChannelData({
                            displayname: groupfullinfo.group.groupname,
                            createtime: groupfullinfo.group.gmtcreate,
                            topic: groupfullinfo.group.topic,
                            purpose: groupfullinfo.group.purpose,
                            ispublic: groupfullinfo.group.ispublic,
                            isdefault: groupfullinfo.group.isdefault,
                            isDetailPulled: true,
                            owner: TeamMembersStore.getTeamMemberByUid(groupfullinfo.group.creatoruid).toJS(),
                            members: TeamMembersStore.getTeamMembers().filter(member => uidMap[member.uid]).toJS()
                        });
                    }
                });
        });
    }else{
        return Promise.resolve();
    }
}, {
    getCmdKey: (sessionid) => sessionid
});

export const SetGroupTopicCmd = createCommand(function (channelData, topic){
        return AppDataHandler.doRequest({
            'body': {
                'uid': LoginStore.getUID(),
                'gid':channelData.sessionid,
                'topic':topic,
                'smd': 'groupchat.setGroupTopic',
                'reqUuid':createUuid()
            },
            'url': ApiConfig.rpc
        }).then(function(response) {
            const channel = ChannelsStore.getChannel(channelData.sessionid);
            if (channel) {
                channel.setChannelData({topic: topic});
            }
        });
});


export const RenameFileCmd = createCommand(function (uid, resourceid, newfilename, isP2P){
        return AppDataHandler.doRequest({
            'body': {
                "smd": isP2P?"p2pchat.editFileName":"groupchat.editGroupFileName",
                'uid': uid,
                'resourceId':resourceid,
                'newFileName':newfilename,
                'reqUuid':createUuid()
            },
            'url': ApiConfig.rpc
        }).then(function(response) {
            //channel.topic = topic;
            //channel.handleOnReload();
        });
});

export const SetGroupPurposeCmd = createCommand(function (channelData, purpose){
        return AppDataHandler.doRequest({
            'body': {
                'uid': LoginStore.getUID(),
                'gid':channelData.sessionid,
                'purpose':purpose,
                'smd': 'groupchat.setGroupPurpose',
                'reqUuid':createUuid()
            },
            'url': ApiConfig.rpc
        }).then(function(response) {
            const channel = ChannelsStore.getChannel(channelData.sessionid);
            if (channel) {
                channel.setChannelData({purpose: purpose});
            }
        });
});
