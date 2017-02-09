import _ from 'underscore';
import EventBus from '../../utils/EventBus';
import EnumEventType from '../enums/EnumEventType';
import gSocketManager, {SOCKET_EVENTS} from '../gSocketManager';
import {getUserSettingCmd} from '../commands/SettingCommands';
import {UserInfoSchema, CompanySettingSchema, LogonLogSchema} from '../../core/schemas/SettingSchemas';
import {createImmutableSchemaData, mergeImmutableSchemaData} from '../../utils/schema';

let userinfo = createImmutableSchemaData(UserInfoSchema, null);
let companySetting = createImmutableSchemaData(CompanySettingSchema, null);
let companyInfo = {};
let checkpwResult = {};
let deleteTeamResult = {};
let logondata = createImmutableSchemaData(LogonLogSchema, {
    items: [],
    msg: '',
    pageable: {pageNum: 0, pagesize: 0, total: 0},
    ret: 0
});

export const SETTING_EVENTS = {
    USER: 'user',
    COMPANY: 'company',
    COMPANY_INFO: 'companyInfo',
    USER_CHANGE: 'userChange',
    UPDATE_USER: 'updateUser',
    UPDATE_COMPANY: 'updateCompany',
    COMPANY_CHANGE: 'companyChange',
    CHECK_PASSWORD: 'checkpwResult',
    DELETE_TEAM: 'deleteTeamResult',
    UPDATE_GROUP_LOGO: 'updateGroupLogo',
    UPDATE_LOG: 'updateLog'
}


class SettingStore extends EventBus {
    getCompanySetting() {
        return companySetting;
    }

    getUserSetting() {
        return userinfo;
    }

    getCompanyInfo() {
        return companyInfo;
    }

    getTeamSettingLog() {
        return logondata;
    }

    getCheckpwResult() {
        return checkpwResult;
    }

    getDeleteTeamResult() {
        return deleteTeamResult;
    }

    saveCompanySetting(company) {
        companySetting = company;
        this.emit(SETTING_EVENTS.COMPANY);
        this.emit(SETTING_EVENTS.COMPANY_CHANGE);
    }

    saveCompanyInfo(company) {
        companyInfo = company;
        this.emit(SETTING_EVENTS.COMPANY_INFO);
    }

    saveUserSetting(user) {
        userinfo = user;
        this.emit(SETTING_EVENTS.USER);
        this.emit(SETTING_EVENTS.USER_CHANGE);
    }

    updateCompanyInfo(resData, newInfo) {
        var result = resData&&resData.ret===0;
        if (result && newInfo){
            _.extend(companyInfo, newInfo);
        }
        this.emit(SETTING_EVENTS.COMPANY_INFO,result);
    }

    updateCompanySetting(resData, setting) {
        var result = resData&&resData.ret===0;
        if (result){
            companySetting = mergeImmutableSchemaData(CompanySettingSchema, companySetting, setting);
            this.emit(SETTING_EVENTS.COMPANY_CHANGE);
        }
        this.emit(SETTING_EVENTS.UPDATE_COMPANY,result);
    }

    updateUserSetting(resData, setting) {
        var result = resData&&resData.ret===0;
        if (result){
            userinfo = mergeImmutableSchemaData(UserInfoSchema, userinfo, setting);
            this.emit(SETTING_EVENTS.USER_CHANGE);
        }
        this.emit(SETTING_EVENTS.UPDATE_USER);
    }

    _onSocketMessage = (event) => {
        if (event.eventType === EnumEventType.NotifyChanged){
            getUserSettingCmd();
        }
    }

    bindWebsocketEvents() {
        gSocketManager.addEventListener(SOCKET_EVENTS.ON_MESSAGE, this._onSocketMessage);
    }

    unbindWebsocketEvents() {
        gSocketManager.removeEventListener(SOCKET_EVENTS.ON_MESSAGE, this._onSocketMessage);
    }

    updateGroupLogo() {
        this.emit(SETTING_EVENTS.UPDATE_GROUP_LOGO);
    }

    updateTeamSettingLog(resData) {
        logondata = createImmutableSchemaData(LogonLogSchema, resData);
        this.emit(SETTING_EVENTS.UPDATE_LOG);
    }

    checkPassword(resData) {
        checkpwResult = resData;
        this.emit(SETTING_EVENTS.CHECK_PASSWORD);
    }

    deleteTeam(resData) {
        deleteTeamResult = resData;
        this.emit(SETTING_EVENTS.DELETE_TEAM);
    }

}
export default new SettingStore();
