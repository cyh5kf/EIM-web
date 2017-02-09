import {
    compile
} from '../../utils/schema';
import {
    MemberInvitesStatus
} from '../enums/EnumMemberInvites';

const commonInvitesSouces = {
    email: 'string',
    gmtcreate: 'string',
    byuid: 'string',
    firstname: 'string',
    lastname: 'string',
    status: 'string'
};

const ExistingInvitesSchemas = compile({
    ...commonInvitesSouces,
    status: {
        __compiled: true,
        enum: [MemberInvitesStatus.Existing]
    }
});

const SentEmailInvitesSchemas = compile({
    ...commonInvitesSouces,
    status: {
        __compiled: true,
        enum: [MemberInvitesStatus.SentEmail]
    }
});

const UndoInvitesInvitesSchemas = compile({
    ...commonInvitesSouces,
    status: {
        __compiled: true,
        enum: [MemberInvitesStatus.UndoInvites]
    }
});

export const InvitesSchemas = compile({
    __compiled: true,
    title: 'InvitesSchemas',
    anyOf: [
        ExistingInvitesSchemas,
        SentEmailInvitesSchemas,
        UndoInvitesInvitesSchemas
    ]
});

export const InvitesListSchemas = compile([InvitesSchemas]);
