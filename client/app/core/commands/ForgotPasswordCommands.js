import {
    createCommand
} from '../../utils/command';
import ForgotPasswordStore, {
    ResetPasswordStep
} from '../stores/ForgotPasswordStore';
import AppDataHandler from '../datarequest/AppDataHandlerMixin';
import ApiConfig from '../constants/ApiConfig';
import LocaleConfig from '../locale-config/LocaleConfig';

export const CheckEmailCmd = createCommand(function(email) {
    return AppDataHandler.doRequest({
        'body': {
            'email': email
        },
        'url': ApiConfig.User.resetCheckEmail
    }).then(req => {
        ForgotPasswordStore.checkEmailSuccess(email);
    }).catch(error => {
        ForgotPasswordStore.doFailure(error.message);
    });
});

export const SendPasswordAuthCodeCmd = createCommand(function(email) {
    let lang = LocaleConfig.getLocale() === 'en-US' ? 'en' : 'zh';

    return AppDataHandler.doRequest({
        'body': {
            'email': email,
            'lang': lang
        },
        'url': ApiConfig.User.resetAuthCode
    }).then(response => {
        ForgotPasswordStore.goNextStep(ResetPasswordStep.AUTH_CODE, {
            email: email
        });
    }).catch(error => {
        ForgotPasswordStore.doFailure(error.message);
    });
});

export const ResendPasswordAuthCodeCmd = createCommand(function(email) {
    let lang = LocaleConfig.getLocale() === 'en-US' ? 'en' : 'zh';
    return AppDataHandler.doRequest({
        'body': {
            'email': email,
            'lang': lang
        },
        'url': ApiConfig.User.resetAuthCode
    });
});

export const VerifyPasswordAuthCodeCmd = createCommand(function(email, authCode) {
    return AppDataHandler.doRequest({
        'body': {
            'email': email,
            'authCode': authCode
        },
        'url': ApiConfig.User.resetVerifyCode
    }).then(req => {
        ForgotPasswordStore.goNextStep(ResetPasswordStep.NEW_PASSWORD, {
            'authCode': authCode
        })
    }).catch(error => {
        ForgotPasswordStore.verifyCodeFailure(error.message);
    });
});

export const ResetPasswordCmd = createCommand(function(info, psdValue) {
    return AppDataHandler.doRequest({
        'body': {
            'email': info.email,
            'authCode': info.authCode,
            'password': psdValue
        },
        'url': ApiConfig.User.resetPassword
    }).then(req => {
        ForgotPasswordStore.resetPsdSuccess(psdValue);
    }).catch(error => {
        ForgotPasswordStore.resetPsdFailure(error.message);
    });
});