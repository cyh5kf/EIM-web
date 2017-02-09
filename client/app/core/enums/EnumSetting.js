export const ACCOUNT_NOTIFY_TYPE = {
    'Browsermsgnotifytype':1,
    'Browsermsgnotifysound':2,
    'Emailnotify':3,
    'Highlightwords':5,
    'MarkAsReadLoading':6
};


export const ACCOUNT_TEAM_SETTING_PAGE = {
    'CurrentPage':1,
    'Pagesize':50,
    'UserStatus':1
}

export const LOGON_RECORD_PAGE = {
    'CurrentPage':1,
    'Pagesize':100,
    'Total':0,
    'Totalpage':0
}

export const LOG_TYPE = {
    'Personal':1,
    'Group':2
}

export const PREFERENCE_NOTIFY_TYPE = {
    'Browsermsgnotifytype':1,
    'Browsermsgnotifysound':2,
    'Notifyshowmsg':3,
    'Disablenotify':4,
    'Muteallsounds':5,
    'Highlightwords':6,
    'Disablenotifystart':7,
    'Disablenotifyend':8
};

export const EMAILNOTIFY_TYPE = {
    'FifteenMinPush':1,
    'OneHourPush':2,
    'NotPush':3
}

export const MARK_MSG_READ_TYPE = {
    'ScrollToOldUnreadMsg':1,
    'DoNotScrollToUnreadMsg':2,
    'DoNotScrToUnreadAndMarkMsg':3
}

export const SEND_NOTIFY_TYPE = {
    'AllMessage':1,
    'RemindMyInfo':2,
    'noNotify':3
}

export const ADVANCED_OPTION = {
    'Rollmsgpageup':1,
    'Ctrlfsearch':2,
    'Ctrlksearch':3,
    'Togglemyawaystatus':4
}

export const MESSAGE_MEDIA = {
    'Showtyping':1,
    'Changeusernamepolicy':2,
    'Time24':3,
    'Faceconvert':4,
    'Showuploadimagefile':5,
    'Showextendfile':6,
    'Showextendbiggertwom':7,
    'Showextendlink':8
}

export const ACCOUNT_TEAM_SETTING_USER_TYPE = {
    'Owner':'1',
    'Manager':'2',
    'User':'3'
}

export const PREFERENCE_RESULT = {
    'Yes':1,
    'No':2
}


//@everyone 1(所有人，默认值)，2(管理员和拥有者)，3(拥有者)
const everyoneSelectData = {
    "all": 1,
    "managerAndOwner": 2,
    "owner": 3
};


//使用@everyone 的警告 1(总是提示，默认值)，2(一天一次)，3(只提示一次)，4(不提示)
const tipsSelectData = {
    "always": 1,
    "firstOneDay": 2,
    "tipsOnce": 3,
    "noTips": 4
};


//谁可以创建群组 1(所有人)，2(管理员和拥有者，默认值)，3(拥有者)
const allSelectData = {
    "all": 1,
    "managerAndOwner": 2,
    "owner": 3
};

//删除消息时间 1(任何时候)，2(不允许删除)，3(1分钟后)，4(5分钟后)，5(30分钟后)，6(1小时后)，7(24小时后)，8(1周后)
const messageEditData = {
    "disallowEdit": 2,//"Never",
    "everytime": 1,//"Any time",
    "fiveMinAfter": 4,//"Up to 5 minutes after posting",
    "oneDayAfter": 7,//"Up to 24 hours after postiong",
    "oneHourAfter": 6,//"Up to 1 hour after postiong",
    "oneMinAfter": 3, //"Up to 1 minute after posting",
    "oneWeekAfter": 8,//"Up to 1 week after postiong",
    "thirtyMinAfter": 5// "Up to 30 minutes after posting"
};

export const PERMISSION_SETTING_ENUM = {
    everyoneSelectData: everyoneSelectData,
    tipsSelectData: tipsSelectData,
    allSelectData: allSelectData,
    messageEditData: messageEditData
};