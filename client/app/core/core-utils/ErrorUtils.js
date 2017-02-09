import {getLocale, LocaleTypeApp} from '../../components/exposeLocale';

export default {
    getErrorMsg(errorCode) {
        return getLocale(LocaleTypeApp).ERROR_CODE_MESSAGES[errorCode];
    }
};
