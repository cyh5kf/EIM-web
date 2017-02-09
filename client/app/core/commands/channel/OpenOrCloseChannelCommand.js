import AppDataHandler from '../../datarequest/AppDataHandlerMixin';
import LoginStore from '../../stores/LoginStore';
import ApiConfig from '../../constants/ApiConfig';
import {createCommand} from '../../../utils/command';
import createUuid from '../../core-utils/createUuid';

export default createCommand(function({sessionid, sessiontype, open=true}){
    return AppDataHandler.doRequest({
        'body': {
            'uid': LoginStore.getUID(),
            'sessionId':sessionid,
            'sessionType':sessiontype,
            'reqUuid':createUuid(),
            'smd': open?'msgsync.openSession':'msgsync.closeSession'
        },
        'url': ApiConfig.rpc
    });

});
