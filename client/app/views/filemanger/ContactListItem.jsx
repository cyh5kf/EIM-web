import React from 'react';
import {TeamMemberSchema} from '../../core/schemas/TeamMembersSchema';
import ReactPropTypes from '../../core/ReactPropTypes';
import EnumLoginStatus from '../../core/enums/EnumLoginStatus';
import Dropdown from '../../components/dropdown/Dropdown';
import Menu, {MenuItem} from '../../components/rc-menu/Menu';
import PureRenderComponent from '../../components/PureRenderComponent';
import './ContactListItem.less';

const MEMBER_OPT = {
    MAKE_ADM:0,
    REMOVE:1
};

class ChannelMemberActionsDropdown extends PureRenderComponent {
    static propTypes = {
        locale: ReactPropTypes.ofLocale(['DASHBOARD', 'sessiondetail']).isRequired
    }
    
    handleMenuSelect = ({key}) => {        
        switch (key) {
            case MEMBER_OPT.MAKE_ADM:
                //
                break;
            case MEMBER_OPT.REMOVE:
                //
                break;            
        }
    }

    render() {
        const {locale} = this.props;

        return (
            <Dropdown className="eficon-ic_next_pressed" onSelect={this.handleMenuSelect}>
                <Menu>
                    <MenuItem key={MEMBER_OPT.MAKE_ADM}>{locale.makeadm}</MenuItem>
                    <MenuItem key={MEMBER_OPT.REMOVE}>{locale.removemember}</MenuItem>
                </Menu>
            </Dropdown>
        );
    }
}

export default class ContactListItem extends React.Component{
    static propTypes = {
        member: ReactPropTypes.ofSchema(TeamMemberSchema).isRequired,
        locale: ReactPropTypes.ofLocale(['DASHBOARD', 'sessiondetail']).isRequired
    }

    render(){
        var viewClass = "member-item";
        
        const {member} = this.props,
            online = member.loginstatus === EnumLoginStatus.WebOnline;

        //在线状态
        viewClass += online ? " online":" offline";       

        let name = member.username;

        return (
            <div className={viewClass} >            
                <div className="member-avatar" style={ member.avatar ? {backgroundImage: `url(${member.avatar})`} : {}}                                 ><i className="status-indicator"/></div>                
                <span className="disp-inblock member-name">
                    {name}
                    <div className="opt-action">
                        <ChannelMemberActionsDropdown locale={this.props.locale} />
                    </div>
                </span>
                
            </div>
        );
    }
}
