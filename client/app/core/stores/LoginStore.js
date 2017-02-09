import EventBus from '../../utils/EventBus';
import { UserProfileSchema } from '../schemas/LoginSchemas';
import { QueryLoginInfoCmd } from '../commands/LoginCommands';
import { createImmutableSchemaData, mergeImmutableSchemaData } from '../../utils/schema';
import Pool from './PoolMixin';
import gSocketManager, { SOCKET_EVENTS } from '../gSocketManager';

var userInfo = createImmutableSchemaData(UserProfileSchema, null);

export const ResetPasswordStep = {
    EMAIL: 'email',
    AUTH_CODE: 'authCode',
    NEW_PASSWORD: 'newPassword'
}

export const EVENTS = {
    CHANGE: 'change'
};

var NS = 'userSession$$';
const UserProfile = {
    getLocalUID() {
        return Pool.get(NS + 'uid');
    },
    getLocalToken() {
        return Pool.get(NS + 'token');
    },
    save(profile) {
        if (!profile) {
            Pool.clean();
        } else {
            // 仅保存登录用户的uid和token
            ['uid', 'token'].forEach(key => {
                Pool.set(NS + key, profile[key]);
            });
        }
    }
}

class LoginStore extends EventBus {
    userProfilePool = UserProfile

    getLogined() {
        return this.getUserInfo() && this.getUserInfo().logined;
    }

    getUID() {
        return this.getUserInfo() && this.getUserInfo().uid;
    }

    getToken() {
        return this.getUserInfo() && this.getUserInfo().token;
    }

    getAvatar() {
        return this.getUserInfo() && this.getUserInfo().avatar;
    }

    // getRealName() {
    //     return this.getFirstName() + this.getLastName();
    // }
    // getFirstName() {
    //     return this.getUserInfo() && this.getUserInfo().firstname;
    // }
    // getLastName() {
    //     return this.getUserInfo() && this.getUserInfo().lastname;
    // }
    getTitle() {
        return this.getUserInfo() && this.getUserInfo().title;
    }

    getCompanyName() {
        return this.getUserInfo() && this.getUserInfo().companyName;
    }

    getCompanyLogo() {
        return this.getUserInfo() && this.getUserInfo().coverImg;
    }

    getUserName() {
        return this.getUserInfo() && this.getUserInfo().userName;
    }

    getUserEmail() {
        return this.getUserInfo() && this.getUserInfo().email;
    }
    getCid() {
        return this.getUserInfo() && this.getUserInfo().cid;
    }
    getRoleId() {
        return this.getUserInfo() && this.getUserInfo().role;
    }
    getPhone() {
        return this.getUserInfo() && this.getUserInfo().phone;
    }
    getTimeZone() {
        return this.getUserInfo() && this.getUserInfo().timezone;
    }
    logined() {
        return this.getUserInfo() && this.getUserInfo().logined;
    }
    getUserInfo() {
        return this.getImmutableUserInfo();
    }
    getImmutableUserInfo() {
        return userInfo;
    }
    updateProfile(profileParts) {
        userInfo = mergeImmutableSchemaData(UserProfileSchema, userInfo, profileParts);
        UserProfile.save(userInfo);
        this.emit(EVENTS.CHANGE);
    }
    saveProfile(profile) {
        userInfo = createImmutableSchemaData(UserProfileSchema, profile);
        UserProfile.save(userInfo);
        this.emit(EVENTS.CHANGE);
    }
    clearUserSession({
        notifyEvent = true
    } = {}) {
        userInfo = createImmutableSchemaData(UserProfileSchema, null);
        UserProfile.save(userInfo);

        notifyEvent && this.emit(EVENTS.CHANGE);
    }

    _onSocketOpen() {
        // socket连接时会导致状态变更, 因而重新获取状态
        QueryLoginInfoCmd();
    }
    bindWebsocketEvents() {
        gSocketManager.addEventListener(SOCKET_EVENTS.ON_OPEN, this._onSocketOpen);
    }

    unbindWebsocketEvents() {
        gSocketManager.addEventListener(SOCKET_EVENTS.ON_OPEN, this._onSocketOpen);
    }

    loginSuccess(info) {
        this.saveProfile({
            ...info
        });

        this.emit('LOGINED');
    }

    loginError(alertType, message) {
        this.emit('LOGIN_ERROR', { alertType, message });
    }

    logout() {
        this.clearUserSession({
            notifyEvent: false
        });
        this.emit('LOGOUTED');
        this.emit(EVENTS.CHANGE);
    }


}

export default new LoginStore();
