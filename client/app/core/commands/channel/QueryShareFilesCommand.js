import AppDataHandler from '../../datarequest/AppDataHandlerMixin';
import LoginStore from '../../stores/LoginStore';
import ApiConfig from '../../constants/ApiConfig';
import {createCommand} from '../../../utils/command';
import {FileMsgListSchema} from '../../../core/schemas/SearchStoreSchemas';
import * as schema from '../../../utils/schema';
import _ from 'underscore';

export default createCommand(function({channel, endtime,lastResourceId=NaN}){    
    AppDataHandler.doRequest({
        'body': {
            sessionId: channel.channelData.sessionid,
            sessionType:channel.channelData.sessiontype,
            endTime:endtime,
            limit:10,
            lastResourceId:Number.isNaN(lastResourceId)?undefined:lastResourceId,
            asc:false,
            smd: 'msgsync.querySessionResource',
            uid: LoginStore.getUID()
        },
        'url': ApiConfig.rpc
    }).then(function(response) {
        var files = response.data.sessionResource;

        let tFormatList = [];
        //格式转为FileMsgListSchema
        _.each(files, function(file){
            const resource = file.resource;
            const resloc = resource.resLoc[0];
            const resfile = resource.resFile;
            if(resource && resloc && resfile){
                tFormatList.push(
                    {
                        senderName: file.userInfo.userName,
                        msgTime: resource.createTime,
                        msgId: resource.upMsgUuid,
                        
                        sessionId: resloc.sessionId,//fcj.todo:同一res可能有多个loc，这里schema实际应使用数组
                        sessionType:  resloc.sessionType,

                        senderUid: resource.uploaderUid,
                        resourceid: resource.resourceId,
                        filetype: resfile.fileType,
                        filesize: resfile.fileSize,
                        fileName: resfile.fileName,
                        fileUrl: resfile.fileUrl,
                        imgwidth: resfile.imgWidth?resfile.imgWidth:0,
                        imgheight: resfile.imgHeight?resfile.imgHeight:0
                    }
                );
            }

        });

        channel.onPushShareFiles(schema.createImmutableSchemaData(FileMsgListSchema, tFormatList), {isMsgPush: false, isLast:response.data.isLastBatch});
    });
}, {
    getCmdKey: ({channel}) => channel.channelData.sessionid
});
