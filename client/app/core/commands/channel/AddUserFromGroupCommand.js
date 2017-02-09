import AppDataHandler from '../../datarequest/AppDataHandlerMixin';
import LoginStore from '../../stores/LoginStore';
import ApiConfig from '../../constants/ApiConfig';
import {createCommand} from '../../../utils/command';
import createUuid from '../../core-utils/createUuid';

export default createCommand(function({options}){
    return AppDataHandler.doRequest({
        'body': {
            'uid': LoginStore.getUID(),
            'gid':options.gid,
            'reqUuid':createUuid(),
            'friendUid':options.members,
            'smd': 'groupchat.addGroupUser'
        },
        'url': ApiConfig.rpc
    });

});
