import AppDataHandler from '../../datarequest/AppDataHandlerMixin';
import LoginStore from '../../stores/LoginStore';
import ApiConfig from '../../constants/ApiConfig';
import {createCommand} from '../../../utils/command';

export default createCommand(function (user){
    return AppDataHandler.doRequest({
        'body': {
            'uid': LoginStore.getUID(),
            'targetUid': user.uid,
            'smd': 'account.getUserProfileByID'
        },
        'url': ApiConfig.rpc
    }).then(function(result) {
        user.callback(result.data.profile);
    });
});
