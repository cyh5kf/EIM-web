import React from 'react';
import _ from 'underscore';
import {Link} from 'react-router';
import exposeUserInfo from '../../view-components/exposeUserInfo';
import classnames from '../../../utils/ClassNameUtils';
import EnumRoleId from '../../../core/enums/EnumRoleId';
import TeamMembersStore from '../../../core/stores/TeamMembersStore';
import exposeStoreData from '../../view-components/exposeStoreData';

@exposeUserInfo
@exposeStoreData([
    [TeamMembersStore, () => ({
        teamMemberList: TeamMembersStore.getTeamMembers().filter(member => member.role === EnumRoleId.Owner || member.role === EnumRoleId.Admin).toJS()
    })]
])
export default class TeamSetting extends React.Component{

    constructor(props){
        super(props);
        this.state = {show:true
                    ,roleObject:this.getTeamRoleObject()};
    }

    open(){
        this.setState({show:true});
    }
    
    close(){
        this.setState({show:false});
    }

    getTeamRoleObject(){
        var roleList = {};
        var locale = this.props.locale;
        roleList[EnumRoleId.Owner]=locale.teamOwner,
        roleList[EnumRoleId.Admin]=locale.teamAdmins,
        roleList[EnumRoleId.Normal]=locale.teamOrdinary;
        return roleList;
    }

    renderMemberContent(locale){
        var that = this;
        var content = null;
        var data = this.state.teamMemberList;
        var roleObject = this.state.roleObject;
        if (data&&data.length>0){
            content = _.map(data,(val,i)=>{
                var realName = (val.firstname&&val.lastname)?(val.firstname+" "+val.lastname):val.username;
                var avatar = val.avatar?<img src={val.avatar}/>:<div className="avatar"></div>;
                var isCurrent = that.state.userInfo.uid === val.uid;
                return (<tr key={"teamMember_"+i}>
                            <td><div className="userHead">{avatar}</div></td>
                            <td>
                                <div className={`userName`}>
                                    {isCurrent&&<span className="mineLabel">{locale.youLabel}<i className="disowner-inblock">•</i><span className="normal">{realName}</span></span>}
                                    {(!isCurrent)&&realName}
                                </div>
                                <div className="userTargetName">
                                    <span className="upperUserName">{locale.teamSimpol}{val.username}</span> 
                                    <i className="disowner-inblock">•</i>
                                <span className="email">{val.email}</span></div>
                            </td>
                            <td>{roleObject[val.role]}</td>
                        </tr>);
            });
        }
        return content;
    }

    render(){
        var locale = this.props.locale;
        var showClass = this.state.show?'':'hidden';
        var memberContent = this.renderMemberContent(locale);
        
        return (<div className={classnames("displayBox","teamSetting",showClass)} data-index="4">
                    <div className="headerLabel">{locale.teamTipLabel}</div>
                    <table className="teamMemberList">
                        <tbody>
                            {memberContent}
                        </tbody>
                    </table>
                    <p className="viewCompleted"><Link to="/settings/manage-team">{locale.viewCompltedMem}</Link></p>
                </div>);
    }
}
