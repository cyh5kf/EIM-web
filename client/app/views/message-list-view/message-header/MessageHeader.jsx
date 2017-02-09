import React from 'react';
import PureRenderComponent from '../../../components/PureRenderComponent';
import StringUtils from '../../../utils/StringUtils';
import {SwitchRightPanelCmd} from '../../../core/commands/RightPanelConfigCommands';
import {ChannelSchema} from '../../../core/schemas/ChannelSchemas';
import {TeamMemberSchema} from '../../../core/schemas/TeamMembersSchema';
import EnumSessionType from '../../../core/enums/EnumSessionType';
import EnumRightPanelType from '../../../core/enums/EnumRightPanelType';
import ReactPropTypes from '../../../core/ReactPropTypes';

import './MessageHeader.less';

export default class MessageHeader extends PureRenderComponent {
    static propTypes = {
        channelData: ReactPropTypes.ofSchema(ChannelSchema).isRequired,
        p2pMemberInfo: ReactPropTypes.ofSchema(TeamMemberSchema),
        rightPanelType: ReactPropTypes.ofEnum(EnumRightPanelType).isRequired,
        locale: ReactPropTypes.ofLocale(['MESSAGE_COMPOSER', 'HEADER']).isRequired
    }

    onShowDetail=()=>{
        SwitchRightPanelCmd(EnumRightPanelType.SESSION_DETAIL, {
            sessionid: this.props.channelData.sessionid
        });
    }

    render() {
        const {channelData, p2pMemberInfo, rightPanelType, locale} = this.props,
            {sessiontype} = channelData,
            showMemberCnt = sessiontype === EnumSessionType.Channel || sessiontype === EnumSessionType.Mail,
            sessionDetailPanelOpening = rightPanelType === EnumRightPanelType.SESSION_DETAIL;

        let logo = null;
        if (sessiontype === EnumSessionType.P2P && p2pMemberInfo) {
            logo = p2pMemberInfo.avatar;
        }
        
        return (
            <div className="message-header clear-float">
                <i className="channel-logo" onClick={this.onShowDetail} style={logo ? {backgroundImage: `url(${logo})`} : {}}/>
                <div className="channel-info">
                    <div className="channel-name">{channelData.displayname}</div>
                    {showMemberCnt && <div className="channel-member-cnt">{StringUtils.format(locale.memberCnt, channelData.members && channelData.members.size || 0)}</div>}
                </div>

                <div className={`more-actions-icon eficon-more ${sessionDetailPanelOpening? 'active' : ''}`} onClick={this.onShowDetail}></div>
            </div>
        );
    }
}
