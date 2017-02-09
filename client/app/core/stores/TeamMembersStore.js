import {createImmutableSchemaData, mergeImmutableSchemaData} from '../../utils/schema';
import EventBus, {COMMON_EVENTS} from '../../utils/EventBus';
import warning from '../../utils/warning';
import {TeamMemberListSchema, TeamMemberSchema} from '../schemas/TeamMembersSchema';
import EnumMemberStatus from '../enums/EnumMemberStatus';
import EnumEventType from '../enums/EnumEventType';
import gSocketManager, {SOCKET_EVENTS} from '../gSocketManager';

let allMembers = createImmutableSchemaData(TeamMemberListSchema, []),
    memberIdxCache = {};

function resetMemberIdxMap() {
    allMembers.forEach((member, idx) => {
        memberIdxCache[member.uid] = idx;
    });
}

export const TEAM_MEMBERS_EVENTS = COMMON_EVENTS;

class TeamMembersStore extends EventBus {
    getTeamMembers(status = EnumMemberStatus.Enabled) {
        return allMembers.filter(member => member.status === status);
    }

    getTeamMemberByUid(uid, {showWarning = true} = {}) {
        if (memberIdxCache[uid] != null) {
            return allMembers.get(memberIdxCache[uid]);
        } else {
            showWarning && warning(`TeamMembersStore.getTeamMemberByUid: 成员(uid: ${uid}) 未找到! 检查是否本地数据同步有误!`);
            return null;
        }
    }

    onMembersChanged(changedMembersInfo) {
        changedMembersInfo.forEach(memberChange => {
            const uid = memberChange.uid.toString(),
                idx = allMembers.findIndex(m => m.uid === uid);
            if (idx === -1) {
                // 对于不存在的用户, 信息必须完备
                allMembers = allMembers.push(createImmutableSchemaData(TeamMemberSchema, memberChange));
            } else {
                allMembers = allMembers.update(idx, member => mergeImmutableSchemaData(TeamMemberSchema, member, memberChange));
            }
        });
        allMembers = allMembers.sortBy(member => member.username.toLowerCase());
        resetMemberIdxMap();
        this.emit(COMMON_EVENTS.ON_CHANGE);
    }

    _onSocketMessage = (event) => {
        if (event.eventType === EnumEventType.UserInfoChanged) {
            this.onMembersChanged([event]);
        }
    }

    bindWebsocketEvents() {
        gSocketManager.addEventListener(SOCKET_EVENTS.ON_MESSAGE, this._onSocketMessage);
    }

    unbindWebsocketEvents() {
        gSocketManager.addEventListener(SOCKET_EVENTS.ON_MESSAGE, this._onSocketMessage);
    }
}

export default new TeamMembersStore();
