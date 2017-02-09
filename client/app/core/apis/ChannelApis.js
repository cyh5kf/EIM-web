import AppDataHandler from '../datarequest/AppDataHandlerMixin';
import LoginStore from '../stores/LoginStore';
import ApiConfig from '../constants/ApiConfig';
import {compile, createImmutableSchemaData} from '../../utils/schema';

const ChannelInfoApiSchema = compile({
    group: {
        groupname: 'string | maybeSourceKey: "groupName"',
        creatoruid: 'string | maybeSourceKey: "creatorUid"  | maybeSourceType: "number"',
        topic: 'string',
        purpose: 'string',
        ispublic: 'boolean | maybeSourceKey: "isPublic"',
        isdefault: 'boolean | maybeSourceKey: "isDefault"',
        gmtcreate: 'number | maybeSourceKey: "createTime"'
    },
    user: [{
        jointime: 'number | maybeSourceKey: "joinTime"',
        memberrole: 'boolean | maybeSourceKey: "memberRole"',
        uid: 'string | maybeSourceType: "number"',
        name: 'string'
    }]
});

export const queryChannelInfo = sessionid => {
    return AppDataHandler.doRequest({
        url: ApiConfig.rpc,
        body: {
            smd: 'groupchat.getGroupInfo',
            uid: LoginStore.getUID(),
            gid:sessionid
        }
    }).then(response => {
        const data = response.data.groupFullInfo;
        return createImmutableSchemaData(ChannelInfoApiSchema, data).toJS();
    });
}
