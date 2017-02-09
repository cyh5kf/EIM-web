import {compile} from '../../utils/schema';

export const TeamMemberSchema = compile({
    uid: 'string | maybeSourceType: "number"',
    cid: 'string | maybeSourceType: "number"',
    username:'string | maybeSourceKey: "userName"',
    //firstname:"string",
    //lastname:"string",
    email:"string",
    avatar:"string",
    role:"number",
    status:"number",
    gmtcreate: 'number',
    timezone:"string",
    title:"string",
    phone: "string",
    loginstatus: 'number | maybeSourceKey: "signature"', // EnumLoginStatus

    __options: {
        title: 'TeamMemberSchema'
    }
});

export const TeamMemberListSchema = compile([TeamMemberSchema]);
