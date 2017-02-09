import _ from 'underscore';
import ErrorUtils from '../core-utils/ErrorUtils';
import axios from 'axios';
import LoginStore from '../stores/LoginStore';
import {getLocale} from '../../components/exposeLocale';

export default {
    /** return Promise to deal with the result chain if you need
     * @param {{timeout, ensureRetAsTrue, ...}} options
     */
    doRequest: function(options) {

        var {
            body,
            dataType = 'json',
            ensureRetAsTrue /*是否强制response.ret === true*/ = true
        } = options;

        // 纠正传入格式
        // 新格式为: {rpc: '...', request: { }}
        let data;
        const rpc = body.rpc || body.smd;
        if (rpc) {
            data = body.request ? body : {
                rpc: rpc,
                request: _.omit(body, ['rpc', 'smd'])
            };
            // jyf: TODO: rpc请求临时添加uid参数
            options.url = options.url + '?uid=' + LoginStore.userProfilePool.getLocalUID();
        } else {
            data = body;
        }


        if (dataType === 'json') {
            // pass
        } else {
            if (data) {
                const formData = new FormData();
                _.forEach(data, (val, key) => {
                    formData.append(key, val);
                });
                data = formData;
            }
        }
        return axios({
            method: 'post',
            withCredentials: true,
            timeout: 10000,
            ...options,
            data: data
        }).then(function(response) {
            response = response.data;
            let returnCode = response.ret;
            if (response.response) {
                response.data = response.response;
                returnCode = returnCode !== 0 ? returnCode : response.data.ret;
            }
            if (returnCode === -1) {
                LoginStore.logout();
            }

            if (ensureRetAsTrue && returnCode !== 0) {
                return Promise.reject({
                    error_code: returnCode,
                    message: ErrorUtils.getErrorMsg(returnCode) || getLocale().COMMON.unknownError,
                    response: response
                });
            } else {
                return response;
            }
        });
    }
}
