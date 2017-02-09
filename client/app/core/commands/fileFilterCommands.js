import {createCommand} from '../../utils/command';
import AppDataHandler from '../datarequest/AppDataHandlerMixin';
import ApiConfig from '../constants/ApiConfig';
import LoginStore from '../stores/LoginStore';
import FileFilterStore from '../stores/FileFilterStore';
import {FileMsgListSchema} from '../schemas/SearchStoreSchemas';
import * as schema from '../../utils/schema';
import _ from 'underscore';
import ChannelsStore from '../stores/ChannelsStore';
import TeamMembersStore from '../stores/TeamMembersStore';

export const GetFilterFilesCmd = createCommand(function ({
    uploaduid = '',
    limit = 10,   
    startTime=NaN, 
    endTime=NaN,
    lastResourceId=NaN
    }) {
    return AppDataHandler.doRequest({
            'body': {
                uid: LoginStore.getUID(),
                uploaderUid:(uploaduid==='')?undefined:uploaduid,
                beginTime: Number.isNaN(startTime) ? undefined : startTime,
                endTime: Number.isNaN(endTime) ? undefined : endTime,
                limit:limit,
                lastResourceId:Number.isNaN(lastResourceId)?undefined:lastResourceId,
                asc:false,
                smd: 'msgsync.getUserResourceList'
            },
            'url': ApiConfig.rpc
        }).then((response) => {
            var files = response.data.resource;
            let tFormatList = [];
            //格式转为FileMsgListSchema
            _.each(files, function(file){
                const resource = file;
                const resloc = resource.resLoc[0];
                const resfile = resource.resFile;
                if(resource && resloc && resfile){                        
                    const channelData = ChannelsStore.getChannelData(resloc.sessionId);
                    const member = TeamMembersStore.getTeamMemberByUid(resource.uploaderUid);                    
                    if(channelData && member){
                         tFormatList.push(
                            {
                                sessionName: channelData.displayname,
                                senderName: member.username,
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
                   
                }

            });

            FileFilterStore.addLoadedFiles(schema.createImmutableSchemaData(FileMsgListSchema, tFormatList), response.data.isLastBatch);
        });
}, {
    name: 'filterFiles'
});
