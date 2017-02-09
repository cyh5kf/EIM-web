import {
    compile
} from '../../utils/schema';

export const UserProfileSchema = compile({
    avatar: 'string',
    cid: 'string | maybeSourceType: "number"',
    companyName: 'string',
    coverImg: 'string',
    email: 'string',
    //firstname: 'string',
    language: 'string',
    //lastname: 'string',
    logined: 'boolean',
    phone: 'string',
    role: 'number',
    loginstatus: 'number | maybeSourceKey: "signature"', // EnumLoginStatus
    timezone: 'number | maybeSourceType: "string"',
    title: 'string',
    token: 'string',
    uid: 'string | maybeSourceType: "number"',
    userName: 'string | maybeSourceKey: "username"',
    __options: {
        title: 'UserProfileSchema'
    }
});
