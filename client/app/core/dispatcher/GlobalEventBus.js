import EventBus from './../../utils/EventBus';

var GlobalEventBus = new EventBus();

export const GLOBAL_EVENTS = {
    ON_ALERT_CLOSED:'onAlertClosed',
    ON_SHOW_FILE_FILTER:'onShowFileFilter', //文件过滤展示
    ON_SHOW_FILE_DETAIL:'onShowFileDetail', //展示文件详情, 参数({fileinfo, isEdited})
    ON_VIEW_CHANNEL_ALL_FILES:'onViewChannelFiles'  //查看指定通道的所有文件参数({sessionid,displayname})
};

export default GlobalEventBus;
