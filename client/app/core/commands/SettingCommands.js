import _ from 'underscore';
import {
    createCommand
} from '../../utils/command';
import AppDataHandler from '../datarequest/AppDataHandlerMixin';
import ApiConfig from '../constants/ApiConfig';
import LoginStore from '../stores/LoginStore';
import {
    createImmutableSchemaData
} from '../../utils/schema';
import {
    UserInfoSchema,
    CompanyInfoSchema,
    CompanySettingSchema
} from '../schemas/SettingSchemas';
import SettingStore from '../../core/stores/SettingStore';
import ObjectUtils from '../../utils/ObjectUtils';

export const getCompanySettingCmd = createCommand(function() {
    var reqDataParam = {
        url: ApiConfig.rpc,
        dataType: 'json',
        body: {
            'smd': 'account.getCompanySetting',
            'uid': LoginStore.getUID(),
            'cid': LoginStore.getCid()
        }
    }
    return AppDataHandler.doRequest(reqDataParam).then(response => {
        var responseData = createImmutableSchemaData(CompanySettingSchema, response.data.setting);
        SettingStore.saveCompanySetting(responseData);
    });
}, {
    name: 'getCompanySettingCmd'
});

export const getCompanyByIdCmd = createCommand(function() {
    var reqDataParam = {
        ensureRetAsTrue: true,
        url: ApiConfig.rpc,
        dataType: 'json',
        body: {
            'smd': 'account.getCompanyByID',
            'uid': LoginStore.getUID(),
            'cid': LoginStore.getCid()
        }
    }
    return AppDataHandler.doRequest(reqDataParam).then(response => {
        var responseData = createImmutableSchemaData(CompanyInfoSchema, response.data.profile).toJS();
        SettingStore.saveCompanyInfo(responseData);
    });
}, {
    name: 'getCompanyByIdCmd'
});

export const getUserSettingCmd = createCommand(function() {
    var dataRequest = {
        body: {
            'smd': 'account.getUserSetting',
            'uid': LoginStore.getUID()
        },
        ensureRetAsTrue: true,
        url: ApiConfig.rpc,
        dataType: 'json'
    };
    AppDataHandler.doRequest(dataRequest).then(function(response) {
        var responseData = createImmutableSchemaData(UserInfoSchema, ObjectUtils.toLowercaseKeys(response.data.setting));
        SettingStore.saveUserSetting(responseData);
    });
}, {
    name: 'getUserSettingCmd'
});

export const updateCompanySettingCmd = createCommand(function(company) {
    var dataRequest = {
        body: {
            'smd': 'account.updateCompanySetting',
            'uid': LoginStore.getUID(),
            'setting': company
        },
        ensureRetAsTrue: true,
        url: ApiConfig.rpc,
        dataType: 'json'
    };
    AppDataHandler.doRequest(dataRequest).then(function(response) {
        SettingStore.updateCompanySetting(response.data, company);
    }).catch((error) => {
        // SettingStore.updateCompanySetting(error, company);
    });
}, {
    name: 'updateCompanySettingCmd'
});

export const updateCompanyInfoCmd = createCommand(function(newInfo) {
    var dataRequest = {
        body: _.extend({
            'smd': 'account.updateCompany',
            'uid': LoginStore.getUID(),
            'cid': LoginStore.getCid()
        },newInfo),
        ensureRetAsTrue: true,
        url: ApiConfig.rpc,
        dataType: 'json'
    };
    AppDataHandler.doRequest(dataRequest).then(function(response) {
        SettingStore.updateCompanyInfo(response.data, newInfo);
    }).catch((error) => {
        // SettingStore.updateCompanyInfo(error);
    });
}, {
    name: 'updateCompanyCmd'
});

export const updateCompanyLogoCmd = createCommand(function(coverimg) {
    var dataRequest = {
        body: {
            'smd': 'account.updateCompany',
            'uid': LoginStore.getUID(),
            'cid': LoginStore.getCid(),
            'coverimg': coverimg
        },
        ensureRetAsTrue: true,
        url: ApiConfig.rpc,
        dataType: 'json'
    };
    AppDataHandler.doRequest(dataRequest).then(function(response) {
        SettingStore.updateGroupLogo(response.data);
    }).catch((error) => {
        //SettingStore.updateGroupLogo(error, company);
    });
}, {
    name: 'updateCompanyLogoCmd'
});

export const updateUserSettingCmd = createCommand(function(user) {
    var dataRequest = {
        body: {
            'smd': 'account.updateUserSetting',
            'uid': LoginStore.getUID(),
            'setting': user
        },
        ensureRetAsTrue: true,
        url: ApiConfig.rpc,
        dataType: 'json'
    };
    return AppDataHandler.doRequest(dataRequest).then(function(response) {
        SettingStore.updateUserSetting(response.data, user);
    });
}, {
    name: 'updateUserSettingCmd'
});

export const getTeamSettingLogsCmd = createCommand(function(type, pagenum, pagesize) {
    var dataRequest = {
        ensureRetAsTrue: true,
        'body': {
            'smd':'account.getUserLoginLog',
            'uid': LoginStore.getUID(),
            'cid': LoginStore.getCid(),
            'type': type,
            'pagenum': pagenum,
            'pagesize': pagesize
        },
        'url': ApiConfig.rpc,
        'dataType': 'json'
    };
    AppDataHandler.doRequest(dataRequest).then(function(response) {
        SettingStore.updateTeamSettingLog(response.data);
    }).catch((error) => {
        // SettingStore.updateTeamSettingLog(error);
    });
}, {
    name: 'getTeamSettingLogsCmd'
});

export const checkPasswordCmd = createCommand(function(password) {
    var dataRequest = {
        ensureRetAsTrue: true,
        'body': {
            'smd':'account.checkUserPassword',
            'uid': LoginStore.getUID(),
            'password': password
        },
        'url': ApiConfig.rpc,
        'dataType': 'json'
    };
    AppDataHandler.doRequest(dataRequest).then(function(response) {
        SettingStore.checkPassword(response.data.pass);
    }).catch((error) => {
        // SettingStore.checkPassword(error);
    });
}, {
    name: 'checkPasswordCmd'
});

export const deleteTeamCmd = createCommand(function(password) {
    var dataRequest = {
        ensureRetAsTrue: true,
        'body': {
            'smd':'account.deleteCompany',
            'uid': LoginStore.getUID(),
            'password': password
        },
        'url': ApiConfig.rpc,
        'dataType': 'json'
    };
    AppDataHandler.doRequest(dataRequest).then(function(response) {
        SettingStore.deleteTeam(response.ret);
    }).catch((error) => {
        // SettingStore.deleteTeam(error);
    });
}, {
    name: 'deleteTeamCmd'
});
