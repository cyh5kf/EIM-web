import {
    createCommand
} from '../../utils/command';
import LoginStore from '../stores/LoginStore';
import AppDataHandler from '../datarequest/AppDataHandlerMixin';
import ApiConfig from '../constants/ApiConfig';
import toast from '../../components/popups/toast';
import WebApiUtils from '../../utils/WebApiUtils';
import AlertType from '../enums/EnumAlertType';
import _ from 'underscore';

export const QueryLoginInfoCmd = createCommand(function() {
    if (LoginStore.logined()) {
        return Promise.resolve();
    }

    const uid = LoginStore.userProfilePool.getLocalUID(),
        token = LoginStore.userProfilePool.getLocalToken();
    let promise = null;

    if (uid && token) {
        promise = AppDataHandler.doRequest({
            url: ApiConfig.rpc,
            body: {
                uid: uid,
                targetUid: uid,
                smd: 'account.getUserProfileByID'
            }
        });
    } else {
        promise = Promise.reject();
    }

    return promise.then(response => {
        LoginStore.saveProfile({
            ...response.data.profile,
            logined: true,
            token,

            // jyf: TODO: 临时添加调试字段
            companyName: '',
            coverImg: ''
        });
    }, () => {
        LoginStore.clearUserSession();
    });
});

export const SetLoginStatusCmd = createCommand(function(loginStatus) {
    const prevLoginStatus = LoginStore.getImmutableUserInfo().loginstatus;
    // 立即生效
    LoginStore.updateProfile({
        loginstatus: loginStatus
    });
    return AppDataHandler.doRequest({
        url: ApiConfig.rpc,
        body: {
            smd: 'account.updateUserSignature',
            uid: LoginStore.getUID(),
            signature: loginStatus,
            auto: false
        }
    }).catch(err => {
        // 失败则回退
        LoginStore.updateProfile({
            loginstatus: prevLoginStatus
        });
        toast('Change login status failed.'); // jyf: TODO: locale

        return Promise.reject(err);
    });
});

export const LoginAccountCmd = createCommand(function(email, password, rememberMe) {
    return AppDataHandler.doRequest({
        'body': {
            email: email,
            password: password,
            rememberMe: rememberMe,
            timezone: (new Date()).getTimezoneOffset().toString()
        },
        'url': ApiConfig.User.login
    }).then(req => {
        LoginStore.loginSuccess(_.extend(req.userProfile, req.companyProfile, {
            email: email,
            logined: true
        }));
    }).catch(error => {
        LoginStore.loginError(AlertType.AlertError, error.message);
    });
});

export const LogoutAccountCmd = createCommand(function(uid, rt) {
    WebApiUtils.logoutAccountApi({
        uid: uid,
        rt: rt
    }).then(req => {
        LoginStore.logout();
    });
});
