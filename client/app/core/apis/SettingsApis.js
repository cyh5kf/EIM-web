import AppDataHandler from '../datarequest/AppDataHandlerMixin';
import LoginStore from '../stores/LoginStore';
import ApiConfig from '../constants/ApiConfig';

export const getLogonLogList = (type, pagenum, pagesize) => {
    return AppDataHandler.doRequest({
        url: ApiConfig.rpc,
        body: {
            smd: 'account.getUserLoginLog',
            uid: LoginStore.getUID(),
            cid: LoginStore.getCid(),
            type: type,
            pagenum: pagenum,
            pagesize: pagesize
        }
    });
}
