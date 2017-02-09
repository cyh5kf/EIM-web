import React from 'react';
import PureRenderComponent from '../../components/PureRenderComponent';
import RecentSessionsList from '../view-components/recent-sessions/RecentSessionsList';
import MessageListViewComposer from '../message-list-view/MessageListViewComposer';
import ChannelsStore, {CHANNELS_EVENTS} from '../../core/stores/ChannelsStore';
import TeamMembersStore from '../../core/stores/TeamMembersStore';
import SwitchChannelCmd from '../../core/commands/channel/SwitchChannelCmd';
import SyncRecentSessionCommand from '../../core/commands/channel/SyncRecentSessionCommand';
import exposeStoreData from '../view-components/exposeStoreData';

import './ChattingPageComposer.less';

@exposeStoreData([
    [ChannelsStore, CHANNELS_EVENTS.CURRENT_CHANNEL_CHANGE, () => ({
        currentSessionid: ChannelsStore.getCurrentChannelData() && ChannelsStore.getCurrentChannelData().sessionid
    })],
    [ChannelsStore, CHANNELS_EVENTS.CHANNEL_LIST_CHANGE, () => ({
        recentSessions: ChannelsStore.getChannelDataList()
    })],
    [TeamMembersStore, () => ({
        teamMembers: TeamMembersStore.getTeamMembers()
    })]
])
export default class ChattingPageComposer extends PureRenderComponent {
    handleSessionSelect = ({sessionid}) => {
        SwitchChannelCmd({sessionid: sessionid});
    }

    componentWillMount() {
        if (!ChannelsStore.recentSessionsLoaded && !SyncRecentSessionCommand.isPending()) {
            SyncRecentSessionCommand();
        }
    }

    render() {
        const {recentSessions, teamMembers, currentSessionid} = this.state;
        return (
            <div className="chatting-view">
                <RecentSessionsList recentSessions={recentSessions} teamMembers={teamMembers} currentSessionid={currentSessionid} onSessionSelect={this.handleSessionSelect}/>
                <MessageListViewComposer sessionid={currentSessionid}/>
            </div>
        );
    }
}
