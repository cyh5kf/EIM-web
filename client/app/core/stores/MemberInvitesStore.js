import EventBus from '../../utils/EventBus';
import {
    InvitesListSchemas
} from '../schemas/MemberInvitesSchemas';
import {
    createImmutableSchemaData
} from '../../utils/schema';
import {
    PanelType
} from '../enums/EnumMemberInvites';

let memberInvitesInfo = {
    pendingData: createImmutableSchemaData(InvitesListSchemas, []),
    acceptedData: createImmutableSchemaData(InvitesListSchemas, []),
    pendingTotal: 0,
    acceptedTotal: 0,
    pageSize: 225,
    pendingPageNum: 0,
    acceptedPageNum: 0,
    panelType: PanelType.PENDING
};

class MemberInvitesStore extends EventBus {
    updateMemberInvitesData(data) {
        switch (data.panelType) {
            case PanelType.PENDING:
                memberInvitesInfo.panelType = data.panelType;
                memberInvitesInfo.pendingTotal = data.pageable.total;
                memberInvitesInfo.acceptedTotal = data.pageable.othertotal;
                memberInvitesInfo.pendingPageNum = data.pageable.pagenum;
                memberInvitesInfo.pendingData = createImmutableSchemaData(InvitesListSchemas, data.items);
                break;
            case PanelType.ACCEPTED:
                memberInvitesInfo.panelType = data.panelType;
                memberInvitesInfo.acceptedTotal = data.pageable.total;
                memberInvitesInfo.pendingTotal = data.pageable.othertotal;
                memberInvitesInfo.acceptedPageNum = data.pageable.pagenum;
                memberInvitesInfo.acceptedData = createImmutableSchemaData(InvitesListSchemas, data.items);
                break;
        }

        this.emit("updateMemberInvites", memberInvitesInfo);
    }

    revokeInvitation(email) {
        memberInvitesInfo.pendingData = memberInvitesInfo.pendingData.filterNot(record => record.email === email);
        memberInvitesInfo.pendingTotal -= 1;
        this.emit("updateMemberInvites", memberInvitesInfo);
    }

    getPageSize() {
        return memberInvitesInfo.pageSize;
    }

    getMemberInvitesInfo() {
        return memberInvitesInfo;
    }
}

export default new MemberInvitesStore();
