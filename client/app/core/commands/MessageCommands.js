import {createCommand} from '../../utils/command';
import {createImmutableSchemaData} from '../../utils/schema';
import {MessageListSchema} from '../schemas/MessageSchemas';
import ChannelsStore from '../stores/ChannelsStore';
import EnumEventType from '../enums/EnumEventType';

export const writeMsgCmd = createCommand(function ({
    text, avatar, name, senderuid, eventtype, msguuid, clientSendTime, msgsrvtime = null, clientSendingStatus,
    resourceid, fileurl, filetype, filename, filesize,gmtcreate,
    title, content, preview,targetchannelid,imgwidth,imgheight
    }) {
    let channel = targetchannelid ? ChannelsStore.getChannel(targetchannelid) : ChannelsStore.getCurrent();

    const message = {
        sessiontype: channel.channelData.sessiontype,
        sessionid: channel.channelData.sessionid,
        text: text,
        senderavatar: avatar,
        sendername: name,
        senderuid: senderuid,
        eventtype: eventtype,
        msguuid: msguuid,
        clientSendTime: clientSendTime,
        msgsrvtime: msgsrvtime,
        clientSendingStatus: clientSendingStatus,
        ...((eventtype === EnumEventType.FileMsg|| eventtype === EnumEventType.FileShareMsg) ? {
            resourceid,
            fileurl,
            filetype,
            filename,
            filesize: filesize.toString(),
            gmtcreate,
            ...((imgwidth && imgheight) ? {
                imgwidth:imgwidth.toString(),
                imgheight:imgheight.toString()
            } : {})
        } : {}),
        ...(eventtype === EnumEventType.RichTextMsg ? {
            title, content, preview
        } : {})
    };


    var messageData = createImmutableSchemaData(MessageListSchema, [message]);

    channel.onPushMessages(messageData);
}, {
    name: 'message.writeMsgCmd'
});
