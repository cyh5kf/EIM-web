import WebApiUtils from '../../utils/WebApiUtils';
import LoginStore from '../stores/LoginStore';
import UserEditorStore from '../stores/UserEditorStore';
import {
    createCommand
} from '../../utils/command';
import AccountSettingType from '../enums/EnumAccountSetingType';
import _ from 'underscore';

function updateData(obj) {
    var data = {};
    var type = parseInt(obj.type,10);
    switch (type) {
        case AccountSettingType.SetUserName:
            data = {
                'username': obj.username
            };
            break;
        case AccountSettingType.SetPassword:
            data = {
                'password': obj.newpswd
            };
            break;
        case AccountSettingType.SetEmail:
            data = {
                'email': obj.email
            };
            break;
        case AccountSettingType.SetTimeZone:
            data = {
                'timezone': obj.timezone
            }
            break;
    }

    LoginStore.updateProfile(data);
}

export const updateProfileCmd = createCommand(function(obj) {
    return WebApiUtils.updateProfileApi(_.extend(obj, {
        'smd': 'account.updateUserProfile',
        'uid': LoginStore.getUID()
    })).then(req => {
        LoginStore.updateProfile(obj);
        UserEditorStore.settingAccount({
            ret: true
        });
    });
}, {
    name: 'user-editor.updateProfileCmd'
});

export const updateUserNameCmd = createCommand(function(obj) {
    return WebApiUtils.updateProfileApi(_.extend(obj, {
        'smd': 'account.updateUserName',
        'uid': LoginStore.getUID()
    })).then(req => {
        LoginStore.updateProfile(obj);
        UserEditorStore.settingAccount({
            ret: true
        });
    });
}, {
    name: 'user-editor.updateUserNameCmd'
});

export const updateUserPasswordCmd = createCommand(function(obj) {
    return WebApiUtils.updateProfileApi(_.extend(obj, {
        'smd': 'account.updateUserPassword',
        'uid': LoginStore.getUID(),
        'newPasswd':obj.newPasswd,
        'currentPassswd':obj.currentPassswd
    })).then(req => {
        UserEditorStore.settingAccount({
            ret: true
        });
    }).catch(error => {
        UserEditorStore.submitUserEditorFailure(error.message);
    });
}, {
    name: 'user-editor.updateUserPasswordCmd'
});

export const settingAccountCmd = createCommand(function(obj) {
    var arr = [];
    if (obj.type === AccountSettingType.SetUserName) {
        arr.push(WebApiUtils.checkUsername(obj));
    } else if (obj.type === AccountSettingType.SetEmail) {
        arr.push(WebApiUtils.checkEmail(obj));
    }
    arr.push(WebApiUtils.SettingAccountApi(obj));
    return Promise.all(arr).then(function() {
        updateData(obj);
        UserEditorStore.settingAccount({
            ret: true
        });
    }).catch(function(error) {
        UserEditorStore.settingAccount({
            'ret': false,
            'error': error.message
        });
    });
}, {
    name: 'user-editor.settingAccountCmd'
});

// export const stopAccountCmd = createCommand(function(obj) {
//     return new Promise((resolve) => {
//         WebApiUtils.stopAccountApi(obj, {
//             successHandler: function(result) {
//                 UserEditorStore.deactiveAccountSuccess(result.ret);
//                 resolve();
//             },
//             errorHandler: function(error) {
//                 UserEditorStore.deactiveAccountFailure(error.message);
//                 resolve();
//             }
//         });
//     });
// });