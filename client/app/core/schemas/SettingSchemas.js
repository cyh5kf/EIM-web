import {compile} from '../../utils/schema';

export const UserInfoSchema = compile({
    'uid': 'string | maybeSourceType: "number"',
    'emailnotify': 'number',
    'browsermsgnotifytype': 'number',
    'browsermsgnotifysound': 'string',
    'mobilemsgnotifytype': 'number',
    'mobilemsgnotifysound': 'string',
    'mobilemsgnotifytimingtype': 'number',
    'mobilemsgnotifytimingmin': 'number',
    'highlightwords': 'string',
    'markmsgreadtype': 'number',
    'disablenotify': 'number',
    'disablenotifystart': 'string',
    'disablenotifyend': 'string',
    'showtyping': 'number',
    'changeusernamepolicy': 'number',
    'time24': 'number',
    'notifyshowmsg': 'number',
    'faceconvert': 'number',
    'showuploadimagefile': 'number',
    'showextendfile': 'number',
    'showextendbiggertwom': 'number',
    'showextendlink': 'number',
    'muteallsound': 'number',
    'microemaillist': 'number',
    'rollmsgpageup': 'number',
    'ctrlfsearch': 'number',
    'ctrlksearch': 'number',
    'togglemyawaystatus': 'number'
});


export const CompanySettingSchema = compile({
    'cid': 'string',
    'whocanateveryone': 'number',
    'warnbeforeateveryone': 'number',
    'whocanpostgeneral': 'number',
    'invitesonlyadmins': 'number',
    'whocancreategroups': 'number',
    'whocaneditgroups': 'number',
    'msgdeletewindowmins': 'number',
    'allowmessagedeletion': 'number',
    'whocaneditcompanysetting': 'number',
    'disallowpublicfileurls': 'number',
    'signupmode': 'number',
    'emaildomain': 'string',
    'changeusernamepolicy': 'number',
    'disablenotify': 'number',
    'disablenotifystart': 'string',
    'disablenotifyend': 'string',
    'msgretentionpolicy': 'number',
    'fileretentionpolicy': 'number',
    'msgretentiondays': 'number',
    'fileretentiondays': 'number',
    'allowsettingretention': 'number',
    'defaultchannel' : 'string'
});

const LogonLogItemSchema = compile({
    clienttype: 'string',
    firstname: 'string',
    ip: 'string',
    lastname: 'string',
    time: 'number',
    uid: 'string',
    username: 'string'
});
const PageableSchema = compile({
    pageNum: 'number',
    pagesize: 'number',
    total: 'number'
})

export const LogonLogSchema = compile({
    items: [LogonLogItemSchema],
    msg: 'string',
    pageable: PageableSchema,
    ret: 'number',
    __options: {
        notRequired: ['msg','items']
    }
})

export const CompanyInfoSchema = compile({
    'cid': 'string',
    //'companygroupid': 'number',
    'coverimg': 'string',
    //'gmtcreate': 'number',
    'gmtmodify': 'number',
    'name': 'string',
    'ownermail': 'string'
    //'status': 'number'
});
