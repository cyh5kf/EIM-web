import EventBus from '../../utils/EventBus';
import { ForgotPasswordSchema } from '../schemas/ForgotPasswordSchemas';
import { createImmutableSchemaData, mergeImmutableSchemaData } from '../../utils/schema';

var passwordInfo = createImmutableSchemaData(ForgotPasswordSchema, null);

export const ResetPasswordStep = {
    EMAIL: 1,
    AUTH_CODE: 2,
    NEW_PASSWORD: 3
}

export const RESET_PASSWORD_EVENTS = {
    CHANGE: 'PsdChange',
    EVENT_FAILURE: 'eventFailure',
    RESET_PSD_SUCCESS: 'resetPsdSuccess',
    RESET_PSD_FAILURE: 'resetPsdFailure',
    VERIFY_CODE_FAILURE: 'verifyPsdCodeFailure',
    CHECK_EMAIL_SUCCESS: 'checkPsdEmailSuccess'
};


class ForgotPasswordStore extends EventBus {
    getEmail() {
        return passwordInfo.email;

    }

    getAll() {
        return passwordInfo;
    }

    goNextStep(step, info) {
        this.updateInfo(info);
        this.emit(RESET_PASSWORD_EVENTS.CHANGE, step);
    }

    updateInfo(info) {
        if (passwordInfo) {
            passwordInfo = mergeImmutableSchemaData(ForgotPasswordSchema, passwordInfo, info);
        } else {
            passwordInfo = createImmutableSchemaData(ForgotPasswordSchema, info);
        }
    }

    doFailure(message) {
        this.emit(RESET_PASSWORD_EVENTS.EVENT_FAILURE, message);
    }

    resetPsdSuccess(psdValue) {
        this.updateInfo({
            password: psdValue
        });
        this.emit(RESET_PASSWORD_EVENTS.RESET_PSD_SUCCESS);
    }

    resetPsdFailure(message) {
        this.emit(RESET_PASSWORD_EVENTS.RESET_PSD_FAILURE, message);
    }

    verifyCodeFailure(message) {
        this.emit(RESET_PASSWORD_EVENTS.VERIFY_CODE_FAILURE, message);
    }

    checkEmailSuccess(email) {
        this.emit(RESET_PASSWORD_EVENTS.CHECK_EMAIL_SUCCESS, email);
    }


}

export default new ForgotPasswordStore();
