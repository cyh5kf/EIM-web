import React from 'react';
import Loading from 'react-loading';
import StringUtils from '../../../utils/StringUtils';
import _ from 'underscore';
import PureRenderComponent from '../../../components/PureRenderComponent';
import {inviteMemberCmd} from '../../../core/commands/InvitationCommands';
import LoginStore from '../../../core/stores/LoginStore';
import ValidationUtils from '../../../utils/ValidationUtils';
import ReactPropTypes from '../../../core/ReactPropTypes';
import {showStyle} from '../../../utils/JSXRenderUtils';

import exposeLocale from '../../../components/exposeLocale';

function createInviteMember(email) {
    return {
        email: email,
        status: 3,
        byUid: "" + LoginStore.getUID(),
        _isEmailOK: true
    }
}


function rejectEmptyEmailList(list) {
    return _.reject(list, function (e) {
        var email = (e.email || "").trim();
        return email.length === 0;
    });
}

function validateMemberEmails(memberList) {
    var isOK = true;
    memberList.forEach(function (member) {
        var email = member.email;
        if (!ValidationUtils.validateEmail(email)) {
            isOK = false;
            member._isEmailOK = false;
        } else {
            member._isEmailOK = true;
        }
    });

    return isOK;
}


@exposeLocale(['DIALOGS', 'dlg-groupInvite'])
export default class InviteInputView extends PureRenderComponent {

    static propTypes = {
        onShowInviteResultView: ReactPropTypes.func,
        onShowInviteRecordView: ReactPropTypes.func
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            enteredMembers: [createInviteMember('')], //{}
            isEnteredMemberEmpty: false, //{}
            isEnteredMultiMemberCorrect:false,
            enteredMultiMemberCorrectMsg:'',
            isMultiInput: false,
            multiInputString: '',
            isMultiInputError: false
        };
    }


    onClickAddMember() {
        var enteredMembers = [].concat(this.state.enteredMembers || []);
        enteredMembers.push(createInviteMember(''));
        this.setState({enteredMembers: enteredMembers});
        var scrollObj = this.refs['enteredMembersDiv'];
        window.setTimeout(function () {
            scrollObj.scrollTop = 1000;
        }, 10)
    }


    onClickRemoveMember(member) {
        var enteredMembers = this.state.enteredMembers || [];
        enteredMembers = _.reject(enteredMembers, function (m) {
            return member === m;
        });
        this.setState({enteredMembers: enteredMembers});
    }


    onChangeInput(member, i, e) {
        var enteredMembers = [].concat(this.state.enteredMembers || []);
        var value = e.target.value;
        member.email = value;
        enteredMembers[i] = member;
        this.setState({enteredMembers: enteredMembers});
    }


    onClickInvite() {
        var that = this;
        var {onShowInviteResultView}  = this.props;
        var enteredMembers = this.state.enteredMembers || [];
        //移除掉空的email
        enteredMembers = rejectEmptyEmailList(enteredMembers);
        if (enteredMembers.length === 0) {
            enteredMembers.push(createInviteMember(''));
            this.setState({enteredMembers: enteredMembers, isEnteredMemberEmpty: true});
        } else {
            this.setState({enteredMembers: enteredMembers, isEnteredMemberEmpty: false});
        }

        var isValidateOK = validateMemberEmails(enteredMembers);
        if (isValidateOK) {
            that.setState({loading: true});
            inviteMemberCmd(enteredMembers).then(function () {
                that.setState({loading: false});
                onShowInviteResultView();
            });
        } else {
            enteredMembers = [].concat(enteredMembers || []);
            this.setState({enteredMembers: enteredMembers});
        }
    }


    /**
     * 点击取消按钮或点击切换到批量添加按钮
     */
    onSwitchMultiInput(isMultiInput) {
        this.setState({isMultiInput: isMultiInput});
        if (isMultiInput) {
            let enteredMembers = this.state.enteredMembers || [];
            let emailArray = [];

            enteredMembers.forEach(function (e) {
                var email = (e.email || '').trim();
                if (email.length > 0) {
                    emailArray.push(email);
                }
            });

            let multiInputString = emailArray.join(", ");
            if (emailArray.length > 0) {
                multiInputString += ", ";
            }
            this.setState({
                multiInputString: multiInputString
            });
        }
    }


    /**
     * 批量添加邮箱点击确定按钮
     */
    onClickAddMultiEmail() {

        var {locale} = this.state;
        let multiInputString = this.state.multiInputString || '';
        let emailArray = multiInputString.split(',');

        var enteredMembers = [];
        emailArray.forEach(function (e) {
            var email = e.trim();
            var isOK = ValidationUtils.validateEmail(email);
            if (isOK) {
                enteredMembers.push(createInviteMember(email))
            }
        });

        if (enteredMembers.length === 0) {
            this.setState({
                isMultiInputError: true,
                isEnteredMemberEmpty: true,
                isEnteredMultiMemberCorrect:false
            });
        } else {
            this.setState({
                isMultiInputError: false,
                isEnteredMemberEmpty: false,
                isEnteredMultiMemberCorrect:true,
                enteredMultiMemberCorrectMsg:StringUtils.format(locale.correctEmailFormat, enteredMembers.length),
                enteredMembers: enteredMembers,
                isMultiInput: false
            });
        }
    }

    onChangeMultiInputString(e) {
        var v = e.target.value;
        this.setState({
            multiInputString: v
        });
    }

    renderInputList() {

        var {onShowInviteRecordView}  = this.props;
        var {locale,enteredMembers,isEnteredMemberEmpty,isEnteredMultiMemberCorrect,enteredMultiMemberCorrectMsg,loading} = this.state;
        var enteredMembersCount = enteredMembers.length;
        var that = this;

        return (
            <div className="input-list">

                <div className="errorAlert" style={showStyle(isEnteredMemberEmpty)}>
                    {locale.emailEmptyDesc}
                </div>
                <div className="collectAlert" style={showStyle(isEnteredMultiMemberCorrect)}>
                    {enteredMultiMemberCorrectMsg}
                </div>

                <div className={`entered-members multi-collect-${isEnteredMultiMemberCorrect}`} ref="enteredMembersDiv">
                    {enteredMembers.map(function (member, i) {
                        return (
                            <div className={`member  email-validate-${member._isEmailOK}`} key={i}>
                                <input className="entering-input" type="text" value={member.email}
                                       placeholder="name@domain.com"
                                       onChange={that.onChangeInput.bind(that,member,i)}/>
                                {enteredMembersCount > 1 ? <i className="ficon_delete"
                                                              onClick={that.onClickRemoveMember.bind(that,member)}></i> : null}
                                <div className={`email-validate-msg`}>{locale.errorEmailMsg}</div>
                            </div>
                        );
                    })}
                    <div style={{height:10}}></div>
                </div>

                <div className="enter-more">
                    <a className="floatLeft" onClick={that.onClickAddMember.bind(that)}>{locale.anotherLabel}</a>
                    <div className="inviteLabel floatRight">
                        <span>{locale.invitedQuestion}</span> &nbsp;
                        <a onClick={that.onSwitchMultiInput.bind(that,true)}>{locale.inviteMoreUsers}</a>
                    </div>
                    <div className="clearFloat"></div>
                </div>

                <div className="bottom-button">
                    <div className="invite-button" onClick={that.onClickInvite.bind(that)}>
                        {!loading ? null :
                            <div className="loaddingGif">
                                <Loading type='spokes' width={22} height={22} color='#e3e3e3'/>
                            </div>}
                        <span
                            className="button-text">{StringUtils.format(locale.invitedPersonNum, enteredMembers.length)}</span>
                    </div>
                    <div className="to-pending" onClick={onShowInviteRecordView}>{locale.seeAcceptedInvites}</div>
                </div>
            </div>
        );
    }


    renderMultiInputArea() {
        var that = this;
        var {locale,isMultiInputError,multiInputString} = that.state;
        return (
            <div className="multi-input">
                <div className="errorAlert" style={showStyle(isMultiInputError)}>{locale.errorEmailFormat}</div>
                <div className="subTitle">{locale.enterMutiEmailLabel}</div>
                <textarea value={multiInputString} onChange={that.onChangeMultiInputString.bind(that)}></textarea>
                <div className="desc">{locale.enterMutiEmailDesc}</div>
                <div className="bottom-button">
                    <div className="invite-button invite-button-multi"
                         onClick={that.onClickAddMultiEmail.bind(that)}>{locale.addInvitessLabel}</div>
                    <div className="invite-button invite-button-cancel"
                         onClick={that.onSwitchMultiInput.bind(that,false)}>{locale.cancelInviteLabel}</div>
                </div>
            </div>
        );
    }


    render() {
        var {locale,isMultiInput} = this.state;
        var that = this;
        return (
            <div className="inviteInputView">

                <div className="title">
                    {locale.inviteTitle}
                </div>
                {
                    isMultiInput ?
                        that.renderMultiInputArea() :
                        that.renderInputList()
                }
            </div>
        );
    }
}