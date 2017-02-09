import EventBus from '../../utils/EventBus';
import LoginStore from './LoginStore';

var _userinfo = {};

class UserEditorStore extends EventBus {
    deactiveAccount() {
        return _userinfo['status'];
    }

    settingAccount(req) {
        this.emit('SETTING_ACCOUNT', req);
    }

    submitUserEditorFailure(tips) {
        this.emit('SUBMIT_USEREDITOR_FAILURE', tips);
    }

    deactiveAccountSuccess(ret) {
        LoginStore.clearUserSession();
        _userinfo['status'] = ret;
        this.emit('DEACTIVE_ACCOUNT_SUCCESS');
    }

    deactiveAccountFailure(error) {
        this.emit('DEACTIVE_ACCOUNT_FAILURE', error);
    }
}


export default new UserEditorStore();
