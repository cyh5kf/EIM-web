import React from 'react';
import PureRenderComponent from '../../components/PureRenderComponent';
import HeaderBar from './HeaderBar';

/*
import MoreItemPopover from './MoreItemPopover';
import UserOperationMenu from './UserOperationMenu';
import {SetGroupTopicCmd} from '../../core/commands/channel/GroupInfoCommands';
import {getTargetUidByChannelId} from '../../utils/ChannelUtils';

import EnumRightPanelType from '../../core/enums/EnumRightPanelType';
import EnumSessionType from '../../core/enums/EnumSessionType';
import TeamMembersStore from '../../core/stores/TeamMembersStore';

import {ChannelSchema} from '../../core/schemas/ChannelSchemas';
import ChannelsStore, {SINGLE_CHANNEL_EVENTS} from '../../core/stores/ChannelsStore';
import LeaveToChannelDialog from '../dialog/leave-to-channel/LeaveToChannelDialog';
import InvitationToChannelDialog from '../dialog/invitation-to-channel/InvitationToChannelDialog';
*/

export default class HeaderBarComposer extends PureRenderComponent {
    
    render() {
        return <HeaderBar />;
    }
}
