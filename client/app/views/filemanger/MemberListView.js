import React, {PropTypes} from  'react';
import ContactListItem from './ContactListItem';
import {TeamMemberListSchema} from '../../core/schemas/TeamMembersSchema';
import LeaveToChannelDialog from '../dialog/leave-to-channel/LeaveToChannelDialog';
import ReactPropTypes from '../../core/ReactPropTypes';
import {ChannelSchema} from '../../core/schemas/ChannelSchemas';
import EnumSessionType from '../../core/enums/EnumSessionType';

//群组成员不分层级，这里只遍历一层成员生成相应的ListView即可
function getMembersListView(members, that){
    var memList = [];
    members.forEach(function(member){
        memList.push(
            <ContactListItem member={member} key={member.uid} locale={that.props.locale}/>
        );
    });
    return (
        <div className="ul-listview ul-member">
            {memList}
        </div>
    );
}

export default class MemberListView extends React.Component{
    static propTypes = {
        members: ReactPropTypes.ofSchema(TeamMemberListSchema).isRequired,
        onAddMember: ReactPropTypes.func.isRequired,
        channelData: ReactPropTypes.ofSchema(ChannelSchema).isRequired,
        locale: ReactPropTypes.ofLocale(['DASHBOARD', 'sessiondetail']).isRequired,
        displayState: PropTypes.string
    }

    constructor(props){
        super(props);
    }

    onLeaveGroup=()=>{
        this.refs.leavedlg.open();
    }

    render(){
        const {channelData} = this.props;
        const isDefault = channelData.sessiontype === EnumSessionType.Channel && channelData.isdefault
        return (
            <div className={"member-view content " + this.props.displayState}>
                {!isDefault && <div className="disp-block addmember" onClick={this.props.onAddMember}>
                    <i className="icon icon-channel-button-action-add"></i>
                    <span>{this.props.locale.addmember}</span>
                </div>}
                {getMembersListView(this.props.members, this)}
                {!isDefault && <div className="disp-block leavegroup" onClick={this.onLeaveGroup}>
                    <div className="disp-inblock inner">
                        <i className="eficon-18"></i>
                        <span>{this.props.locale.leavegroup}</span>
                    </div>                    
                </div>}
                <LeaveToChannelDialog ref='leavedlg' show={false} targetChannel={this.props.channelData}/>
            </div>
        );
    }
}
