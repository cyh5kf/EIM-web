import EventBus from '../../utils/EventBus';
import _ from 'underscore';
import BrowserUtils from '../../utils/BrowserUtils';
import RegisterStep from '../enums/EnumRegisterStep';

var memberInfo = {};

export const RegisterType = {
    INVITATION: 1,
    SIGNUP: 2
};

export const RegisterEvents = {
    NEXT_STEP: 'nextStep',
    EVENT_FAILURE: 'eventFailure',
    VERIFY_CODE_FAILURE: 'verifyCodeFailure',
    VERIFY_LINK: 'verifyLink',
    REGISTER_FAILURE: 'registerFailure',
    CHECK_EMAIL_SUCCESS: 'checkEmailSuccess',
    EMAIL_REGISTED: 'email_registed'
};

class UserRegisterStore extends EventBus {
    saveUriParam(params) {
        _.extend(memberInfo, params);
    }
    getEmail() {
        return memberInfo.email;
    }
    getToken() {
        return memberInfo.rt;
    }
    getAuthCode() {
        return memberInfo.authCode;
    }
    getEmailName() {
        return memberInfo.email.split('@')[0];
    }
    getCompanyname() {
        return BrowserUtils.UrlDecode(memberInfo.companyName);
    }

    getCid() {
        return memberInfo.cid;
    }
    getCurStep() {
        return memberInfo.step;
    }
    toggleStep(info, step) {
        _.extend(memberInfo, info, {
            step: step
        });
        this.emit(RegisterEvents.NEXT_STEP, step);
    }
    getNextStep(curStep) {
        switch (curStep) {
            case RegisterStep.member.EMAIL:
                return "authCode";
            case RegisterStep.member.AUTHCODE:
                return "userInfo";
            default:
                return "email";
        }
    }
    getAll() {
        memberInfo['realname'] = memberInfo.firstname + ' ' + memberInfo.lastname;
        return memberInfo;
    }
    getUriPrams() {
        return memberInfo.uriParams;
    }

    doFailure(message) {
        this.emit(RegisterEvents.EVENT_FAILURE, message);
    }

    verifyResult(result) {
        this.emit(RegisterEvents.VERIFY_LINK, result);
    }
    checkEmailSuccess(email) {
        this.emit(RegisterEvents.CHECK_EMAIL_SUCCESS, email);
    }
    emailRegisted(email){
        this.emit(RegisterEvents.EMAIL_REGISTED, email);
    }
}

export default new UserRegisterStore();
