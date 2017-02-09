import warning from '../../utils/warning';
import ChannelsStore, {CHANNELS_EVENTS, SINGLE_CHANNEL_EVENTS} from '../../core/stores/ChannelsStore';
import {QueryGroupInfoCommand} from '../../core/commands/channel/GroupInfoCommands';
import QueryShareFilesCommand from '../../core/commands/channel/QueryShareFilesCommand';
import QueryMessagesCmd, {QUERY_DIRECTION} from '../../core/commands/messages/QueryMessagesCmd';
import EnumSessionType from '../../core/enums/EnumSessionType';

// 导出会话相关数据
// 要求 props: sessionid
export default ({channelData = false, channelFiles = false, messages = false}) => BaseComponent => {
    const displayName = BaseComponent.displayName || BaseComponent.name;
    if (!BaseComponent.propTypes.sessionid) {
        warning(`ExposeChannelData: 目标对象 ${displayName} 并未定义 sessionid props!`);
    }

    return class ExposeChannelData extends BaseComponent {
        static displayName = displayName

        _updateChannelData = sessionid => {
            const channel = sessionid ? ChannelsStore.getChannel(sessionid) : null;
            const newState = {};

            if (channelData) {
                newState.channelData = channel && channel.channelData;
                if (channel) {
                    const {channelData: {sessiontype, members}} = channel;
                    if (sessiontype === EnumSessionType.Channel && !members && !QueryGroupInfoCommand.isPending(sessionid)) {
                        QueryGroupInfoCommand(sessionid);
                    }
                }
            }

            if (channelFiles) {
                newState.channelFiles = channel && channel.files;            
                if (channel && !channel.files && !QueryGroupInfoCommand.isPending(channelData.sessionid)) {
                    //频道或单聊文件信息没取
                    QueryShareFilesCommand({channel, 'endtime':(new Date()).getTime()});
                }            
            }

            if (messages) {
                newState.messages = channel && channel.messages;
                if (channel && !channel.messages) {
                    const {sessiontype} = channel.channelData,
                        isLoadingMsg = QueryMessagesCmd.isPending(`${sessionid}-${QUERY_DIRECTION.FORWARD}`) ||
                            QueryMessagesCmd.isPending(`${sessionid}-${QUERY_DIRECTION.BACKWARD}`) ||
                            QueryMessagesCmd.isPending(`${sessionid}-${QUERY_DIRECTION.AROUND}`);
                    if (!isLoadingMsg) {
                        QueryMessagesCmd({
                            sessionid: sessionid,
                            sessiontype: sessiontype,
                            timestamp: Date.now(),
                            queryDirection: QUERY_DIRECTION.BACKWARD
                        });
                    }
                }
            }
            this.setState(newState);
        }

        _handleChannelAnyDataChange = ({sessionid}) => {
            if (sessionid === this.props.sessionid) {
                this._updateChannelData(sessionid);
            }
        }

        _handleNewChannelInsert = ({sessionids}) => {
            if (sessionids.indexOf(this.props.sessionid) !== -1) {
                this._updateChannelData(this.props.sessionid);
            }
        }

        componentWillReceiveProps(nextProps) {
            if (super.componentWillReceiveProps) {
                super.componentWillReceiveProps(...arguments);
            }
            if (nextProps.sessionid !== this.props.sessionid) {
                this._updateChannelData(nextProps.sessionid);
            }
        }

        componentWillMount() {
            if (super.componentWillMount) {
                super.componentWillMount(...arguments);
            }

            this._updateChannelData(this.props.sessionid);

            ChannelsStore.addEventListener(CHANNELS_EVENTS.NEW_CHANNELS_INSERTED, this._handleNewChannelInsert);
            if (channelData) {
                ChannelsStore.addEventListener(SINGLE_CHANNEL_EVENTS.CHANNEL_DATA_CHANGE, this._handleChannelAnyDataChange);
            }
            if (channelFiles) {
                ChannelsStore.addEventListener(SINGLE_CHANNEL_EVENTS.FILES_CHANGE, this._handleChannelAnyDataChange);
            }
            if (messages) {
                ChannelsStore.addEventListener(SINGLE_CHANNEL_EVENTS.MESSAGES_CHANGE, this._handleChannelAnyDataChange);
            }
        }

        componentWillUnmount() {
            if (super.componentWillUnmount) {
                super.componentWillUnmount(...arguments);
            }

            ChannelsStore.removeEventListener(CHANNELS_EVENTS.NEW_CHANNELS_INSERTED, this._handleNewChannelInsert);
            if (channelData) {
                ChannelsStore.removeEventListener(SINGLE_CHANNEL_EVENTS.CHANNEL_DATA_CHANGE, this._handleChannelAnyDataChange);
            }
            if (channelFiles) {
                ChannelsStore.removeEventListener(SINGLE_CHANNEL_EVENTS.FILES_CHANGE, this._handleChannelAnyDataChange);
            }
            if (messages) {
                ChannelsStore.removeEventListener(SINGLE_CHANNEL_EVENTS.MESSAGES_CHANGE, this._handleChannelAnyDataChange);
            }
        }

    }
}
