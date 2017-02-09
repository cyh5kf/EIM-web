let webservice = '', // webservice接口访问同域名, 不再跨域
    ws = 'wss://wsx-beta.mission.im',
    upload = 'https://uploadx-beta.mission.im/webupload',
    download = 'https://downx-beta.mission.im/webdown';

export default {
    "User": {
        "login": webservice + "/api/v1/signup/login/loginByUserPassword",
        "register": webservice + "/api/v1/signup/regist/registUser",
        "registerAuthCode": webservice + "/api/v1/signup/regist/sendAuthCode",
        "registerVerifyCode": webservice + "/api/v1/signup/regist/verifyCode",
        "registerVerifyLink": webservice + "/api/v1/signup/regist/verifyLink",
        "registerCheckEmail": webservice + "/api/v1/signup/regist/checkEmail",

        "resetCheckEmail": webservice + "/api/v1/signup/reset/checkEmail",
        "resetAuthCode": webservice + "/api/v1/signup/reset/sendAuthCode",
        "resetVerifyCode": webservice + "/api/v1/signup/reset/verifyCode",
        "resetPassword": webservice + "/api/v1/signup/reset/resetPassword"
    },

    "upload": {
        "base": upload + "/file/webupload",
        "getLastChunkIdx": upload + "/file/getLastChunkIdx",
        "download": download
    },

    "rpc": webservice + "/api/v1/rpc",

    "checkEmail": webservice + "/httpapi/user/checkEmail",
    "checkUsername": webservice + "/httpapi/user/checkUsername",
    "companyPasswordSetting": webservice + "/httpapi/user/reset",
    "preSignup": webservice + "/httpapi/user/preSignup",
    "checkAcount": webservice + "/httpapi/company/checkCreateAccount",

    "Channel": {
        "websocket": ws + "/connect?uid={0}&token={1}"
    }
}
