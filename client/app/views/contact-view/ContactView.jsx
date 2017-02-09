/**
 * Created by zhengyingya on 16/8/29.
 */

import React from 'react';
import {browserHistory} from 'react-router';
import _ from 'underscore';
import ChannelsStore, {CHANNELS_EVENTS} from '../../core/stores/ChannelsStore';
import TeamMembersStore from '../../core/stores/TeamMembersStore';
import SwitchChannelCmd from '../../core/commands/channel/SwitchChannelCmd';
import AddPreviewSessionCmd from '../../core/commands/channel/AddPreviewSessionCmd';
import SyncRecentSessionCommand from '../../core/commands/channel/SyncRecentSessionCommand';
import PureRenderComponent from '../../components/PureRenderComponent';
import ContactComposer from '../contact-view/contact/ContactComposer';
import MessageComposer from '../message-list-view/MessageListViewComposer';
import exposeStoreData from '../view-components/exposeStoreData';
import EnumLoginStatus from '../../core/enums/EnumLoginStatus';
import EnumSessionType from '../../core/enums/EnumSessionType';
import { getChannelIdByUserId } from '../../core/core-utils/ChannelUtils';
import './ContactView.less';

@exposeStoreData([
    [ChannelsStore, CHANNELS_EVENTS.CHANNEL_LIST_CHANGE, () => ({
        channelList: ChannelsStore.getChannelDataList()
    })],
    [TeamMembersStore, () => ({
        teamMembers: TeamMembersStore.getTeamMembers()
    })]
])
export default class ContactView extends PureRenderComponent {

    ifSessionidChange = false;
    state = {
        sessionid: ''

    };

    onChangeSessionid(sessionid) {
        this.ifSessionidChange = true;
        this.setState({
            sessionid
        });
    }

    onSendMessage () {
        SwitchChannelCmd({sessionid: this.state.sessionid})
        browserHistory.replace('/main/chatting');
    }

    setDefalutSessionid () {
        if (!this.ifSessionidChange) {
            const onLineTeamMembers = this.state.teamMembers.filter((member) => {
                return member.loginstatus === EnumLoginStatus.WebOnline;
            });
            if (onLineTeamMembers.first()) {
                const uid = onLineTeamMembers.first().uid;
                const sessionid = getChannelIdByUserId(uid);
                if (!AddPreviewSessionCmd.isPending(sessionid)) {
                    AddPreviewSessionCmd({sessionid, sessiontype: EnumSessionType.P2P});
                    this.setState({                         //依赖PureRenderComponent的state检查,不然会出现死循环
                        sessionid
                    })
                }
            }
        }
    }

    componentWillMount() {
        if (!ChannelsStore.recentSessionsLoaded && !SyncRecentSessionCommand.isPending()) {
            SyncRecentSessionCommand();
        }
    }

    //componentDidMount () {
    //    this.setDefalutSessionid();
    //}

    componentDidUpdate () {
        this.setDefalutSessionid();
    }

    render() {
        return (
            <div className="contact-view">
                <ContactComposer {..._.pick(this.state, ['channelList', 'teamMembers', 'sessionid'])} onChangeSessionid={this.onChangeSessionid.bind(this)}/>
                <MessageComposer sessionid={this.state.sessionid} onSendMessage={this.onSendMessage.bind(this)}/>
            </div>
        );
    }
}
