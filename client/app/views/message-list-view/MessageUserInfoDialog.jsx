import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore'
import toast from '../../components/popups/toast';
import ModelDialog from '../../components/dialog/ModelDialog';
import PublishP2PCmd from '../../core/commands/channel/PublishP2PCmd';
import TeamMembersStore from '../../core/stores/TeamMembersStore';
import ResetPasswordDialog from '../dialog/ResetPasswordDialog';
import exposeLocale from '../../components/exposeLocale';
import LoginStore from '../../core/stores/LoginStore';
import {updateProfileCmd,updateUserNameCmd} from '../../core/commands/UserEditorCommands';
import EnumLoginStatus from '../../core/enums/EnumLoginStatus';
import AvatarEditor from '../view-components/avatar-editor/AvatarEditor';

import './MessageUserInfoDialog.less';
@exposeLocale(['MESSAGE_COMPOSER', 'MESSAGES'])
export default class MessageUserInfoDialog extends ModelDialog {
    static defaultProps = {
        ...ModelDialog.defaultProps,
        name: 'dlg-userInfoDialog'
    }

    constructor(props) {
        super(props);
        let req = this.openMessageDialog();
        this.state = _.extend(req,{
            editNameFlag:false
            ,editMobileFlag:false
        });
        
    }

    openMessageDialog(){
        let obj = {show:false};
        let userId = this.props.uid;
        let isSelf = this.props.isSelf;
        if (userId){
            if (isSelf){
                let userInfo = LoginStore.getImmutableUserInfo();
                obj = {
                    show:true
                    ,userId:userId
                    ,avatar:userInfo.avatar
                    ,phone:userInfo.phone
                    ,username:userInfo.userName
                    ,userInfo:userInfo
                    ,userDetails:userInfo
                    ,isSelf:isSelf
                };
            }
            else{
                let userDetails = TeamMembersStore.getTeamMemberByUid(userId);
                obj = {
                    show:true
                    ,userId:userId
                    ,avatar:userDetails.avatar
                    ,phone:userDetails.phone
                    ,username:userDetails.username
                    ,userDetails:userDetails
                    ,isSelf:isSelf
                };
            }
        }
        return obj;
    }

    close=()=>{
        this.setState({show:false
            ,phone:''
            ,username:''
            ,isSelf:false
            ,editNameFlag:false
            ,editMobileFlag:false
        });
    }

    showErrorInfo=(msg,obj)=>{
        toast(msg);
        this.setState(obj);
    }

    editMobileNo=()=>{
        this.setState({editMobileFlag:true},()=>{
            ReactDOM.findDOMNode(this.refs.userMobileNo).focus();
        });
    }

    saveMobileNo=()=>{
        let phone = this.state.phone;
        if (phone!==this.state.userInfo.phone){
            let result = {phone:phone};
            updateProfileCmd(result).catch(error => {
                this.setState({phone:this.state.userInfo.phone});
                toast(error.message);
            });
        }
        this.setState({editMobileFlag:false});
    }

    userPhoneChanged=(e)=>{
        let value = e.target.value.replace(/\^|[^0-9|^\\+|^\\\s]/g,'');
        this.setState({phone:value});
    }

    usernameChanged = (e)=>{
        let value = e.target.value.replace(/\^|[^\w|^\\\s]/g,'');
        this.setState({username:value});
    }

    saveUsername=()=>{
        let val = this.state.username;
        if (val!==this.state.userInfo.userName){
            let result = {username:val};
            updateUserNameCmd(result).catch(error => {
                this.setState({username:this.state.userInfo.userName});
                toast(error.message);
            });
        }
        this.setState({editNameFlag:false});
    }

    changeEditNameFlag=()=>{
        this.setState({editNameFlag:true},()=>{
            ReactDOM.findDOMNode(this.refs.usernameInput).focus();
        });
    }

    addSingleChat=()=>{        
        PublishP2PCmd(this.state.userId);
        this.close();
    }

    openResetBox=()=>{
        this.close();
        ModelDialog.openDialog(ResetPasswordDialog, {
            onClose: () => ModelDialog.openDialog(MessageUserInfoDialog)
        })
    }


    onUpdateAvatar(result){
        var img = result.avatar;
        this.setState({avatar:img});
        updateProfileCmd({avatar:img}).catch(error => {
            this.setState({avatar:this.state.userInfo.avatar});
            toast(error.message);
        });
    }

    renderCurrentUserContent(userLocale,userDetails){
        return (<div className="userOptDetails">
                    <ul className="userOption">
                        <li><label>{userLocale.deskMobileId}</label><div className="userText"></div></li>
                        <li><label>{userLocale.emailLabel}</label><div className="userText">{userDetails.email}</div></li>
                        <li><label>{userLocale.mobileLabel}</label>
                            <div className="userText userPhone">
                                {this.state.editMobileFlag&&
                                    <input type="text" ref="userMobileNo" className="userMobileNo" value={this.state.phone} onBlur={this.saveMobileNo} onChange={e=>this.userPhoneChanged(e)}/>
                                }
                                {!this.state.editMobileFlag&&
                                    <span onClick={this.editMobileNo}>{this.state.phone}{!this.state.phone&&<a onClick={this.editMobileNo} className="editLabel">{userLocale.editLabel}</a>}</span>
                                }
                            </div>
                        </li>
                    </ul>
                    <div className="resetCacheBox">
                        <span onClick={this.openResetBox}>{this.state.locale.resetCache}</span>
                    </div>
                </div>);
    }

    renderOtherUserContent(userLocale,userDetails){
        return (<div className="userOptDetails">
                    <ul className="userOption">
                        <li className="hidden"><label>{userLocale.deskMobileId}</label><div className="userText"></div></li>
                        <li><label>{userLocale.emailLabel}</label><div className="userText">{userDetails.email}</div></li>
                        {userDetails.phone&&<li><label>{userLocale.mobileLabel}</label><div className="userText">{userDetails.phone}</div></li>}
                    </ul>
                    <ul className="operationBox">
                        <li><div className="operateIcon chat" onClick={this.addSingleChat}></div></li>
                        <li><div className="operateIcon email" onClick={this.addSingleChat}></div></li>
                    </ul>
                </div>);
    }

    renderContent(){
        if (!this.state.userId) {
            return null;
        }
        let userLocale = this.state.locale.userOption;
        let userDetails = this.state.userDetails;
        let optionContent = this.state.isSelf?this.renderCurrentUserContent(userLocale,userDetails):this.renderOtherUserContent(userLocale,userDetails);
        let canEditName = this.state.editNameFlag?'canEditNameStyle':'';
        let statusCss = (!this.state.isSelf && userDetails.loginstatus===EnumLoginStatus.Offline)?'offline':'';
        return (<div className="userInfoBox">
                    <div className="avatarBox"></div>
                    <AvatarEditor className="smallAvatar" editable={this.state.isSelf} avatar={this.state.avatar} onUpdate={this.onUpdateAvatar.bind(this)}></AvatarEditor>
                    <div className="userDetail">
                        <div className="username">
                            <circle className={statusCss}></circle>
                            {!this.state.editNameFlag&&<span className={`text ${canEditName}`}>{this.state.username}</span>}
                            {this.state.editNameFlag&&
                                <input type="text" ref="usernameInput" className="usernameInput" name="username" value={this.state.username} onBlur={this.saveUsername} onChange={e=>this.usernameChanged(e)}/>
                            }
                            {this.state.isSelf&&!this.state.editNameFlag&&
                                <div className="editNameIcon" onClick={this.changeEditNameFlag}></div>    
                            }
                        </div>
                    </div>
                    {optionContent}
                </div>);
        }
}
