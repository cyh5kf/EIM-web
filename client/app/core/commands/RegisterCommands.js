import { createCommand } from '../../utils/command';
import UserRegisterStore from '../stores/UserRegisterStore';
import LocaleConfig from '../locale-config/LocaleConfig';
import RegisterStep from '../enums/EnumRegisterStep';
import AppDataHandler from '../datarequest/AppDataHandlerMixin';
import ApiConfig from '../constants/ApiConfig';
import _ from 'underscore';
import LoginStore from '../stores/LoginStore';
import {getLocale} from '../../components/exposeLocale';
import ErrorUtils from '../core-utils/ErrorUtils';

export const CheckEmailCmd = createCommand(function(email) {
    return AppDataHandler.doRequest({
        'ensureRetAsTrue': false,
        'body': {
            'email': email
        },
        'url': ApiConfig.User.registerCheckEmail
    }).then(req => {
        var returnCode = req.ret;
        if (returnCode === 0) {
            UserRegisterStore.checkEmailSuccess(email);
        } else if (returnCode === 516) {
            UserRegisterStore.emailRegisted(email);
        } else {
            Promise.reject({
                error_code: returnCode,
                message: ErrorUtils.getErrorMsg(returnCode) || getLocale().COMMON.unknownError,
                response: req
            });
        }

    }).catch(error => {
        UserRegisterStore.doFailure(error.message);
    });
});

export const SendAuthCodeCmd = createCommand(function(email) {
    let lang = LocaleConfig.getLocale() === 'en-US' ? 'en' : 'zh';
    return AppDataHandler.doRequest({
        'body': {
            'email': email,
            'lang': lang
        },
        'url': ApiConfig.User.registerAuthCode
    }).then(response => {
        UserRegisterStore.toggleStep({
            email: email
        }, RegisterStep.member.EMAIL);
    }).catch(error => {
        UserRegisterStore.doFailure(error.message);
    });
});

export const ResendRegisterCodeCmd = createCommand(function(email) {
    let lang = LocaleConfig.getLocale() === 'en-US' ? 'en' : 'zh';
    return AppDataHandler.doRequest({
        'body': {
            'email': email,
            'lang': lang
        },
        'url': ApiConfig.User.registerAuthCode
    });
})

export const VerifyCodeCmd = createCommand(function(email, authCode) {
    return AppDataHandler.doRequest({
        'body': {
            'email': email,
            'authCode': authCode
        },
        'url': ApiConfig.User.registerVerifyCode
    }).then(req => {
        UserRegisterStore.toggleStep({
            authCode: authCode
        }, RegisterStep.member.AUTHCODE);
    }).catch(error => {
        UserRegisterStore.doFailure(error.message);
    });
});

export const VerifyLinkCmd = createCommand(function(email, token) {

    return AppDataHandler.doRequest({
        'body': {
            'email': email,
            'token': token
        },
        'url': ApiConfig.User.registerVerifyLink
    }).then(req => {
        UserRegisterStore.verifyResult({
            verify: true
        });
    }).catch(error => {
        UserRegisterStore.verifyResult({
            verify: false,
            message: error.message
        });
    });
});

export const RegistUserCmd = createCommand(function(args) {

    return AppDataHandler.doRequest({
        'body': {
            'email': args.email,
            'password': args.password,
            'userName': args.userName,
            'timezone': args.timezone,
            'authCode': args.authCode,
            'token': args.token
        },
        'url': ApiConfig.User.register
    }).then(req => {
        let data = _.extend(req.companyProfile, req.userProfile, {
            logined: true
        });
        LoginStore.loginSuccess(data);
    }).catch(error => {
        UserRegisterStore.doFailure(error.message);
    });

});
