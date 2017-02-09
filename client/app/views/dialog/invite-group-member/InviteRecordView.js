import React from 'react';
import _ from 'underscore';
import toast from '../../../components/popups/toast';
import StringUtils from '../../../utils/StringUtils';
import TimeZoneUtils from '../../../utils/TimeZoneUtils';
import NavTabs from '../../../components/nav-tabs/NavTabs';
import exposeLocale from '../../../components/exposeLocale';
import {createImmutableSchemaData} from '../../../utils/schema';
import TeamMembersStore from '../../../core/stores/TeamMembersStore';
import {InvitationSchema} from '../../../core/schemas/InvitationSchemas';
import InvitationStore,{EVENT} from '../../../core/stores/InvitationStore';
import PureRenderComponent from '../../../components/PureRenderComponent';
import {SortedProps,InvitationStatus} from '../../../core/enums/EnumInvitationResult';
import {getInvitationRecordCmd,revokeInvitationCmd,resentInvitationCmd} from '../../../core/commands/InvitationCommands';
import "./InviteRecordView.less";

@exposeLocale(['DIALOGS', 'dlg-invitationProcessing'])
export default class InviteRecordView extends PureRenderComponent {
    static defaultProps = {
        className: 'account-manage'
    }

    constructor() {
        super(...arguments);
        this.state = {
            show: true,
            status: InvitationStatus.Pending,
            pagenum: 1,
            pagesize: 200,
            sort: SortedProps.Date,
            key: '',
            resentMsg: '',
            openIndex: -1,
            invitationStatus: 'pending',
            pendingData: createImmutableSchemaData(InvitationSchema, {items: [], total: 0}),
            acceptedData: createImmutableSchemaData(InvitationSchema, {items: [], total: 0})
        };
    }

    componentDidMount() {
        this.getInvitationMember();
    }

    componentWillMount() {
        this._onInvitationResult = this.onInvitationResult.bind(this);
        this._onResentInvitation = this.onResentInvitation.bind(this);
        this._onRevokeInvitation = this.onRevokeInvitation.bind(this);
        InvitationStore.addEventListener(EVENT.INVITATION_RECORD, this._onInvitationResult);
        InvitationStore.addEventListener(EVENT.REVOKE_INVITATION, this._onRevokeInvitation);
        InvitationStore.addEventListener(EVENT.RESENT_INVITATION, this._onResentInvitation);
    }

    componentWillUnmount() {
        InvitationStore.removeEventListener(EVENT.INVITATION_RECORD, this._onInvitationResult);
        InvitationStore.removeEventListener(EVENT.REVOKE_INVITATION, this._onRevokeInvitation);
        InvitationStore.removeEventListener(EVENT.RESENT_INVITATION, this._onResentInvitation);
    }

    handleTabSelected = (status) => {
        this.setState({invitationStatus: status})
    }

    onInvitationResult = ()=> {
        this.setState({acceptedData: InvitationStore.getAcceptedData(), pendingData: InvitationStore.getPendingData()});
    }

    onRevokeInvitation = ()=> {
        this.setState({pendingData: InvitationStore.getPendingData(), openIndex: -1});
        this.forceUpdate();
    }

    onResentInvitation = ()=> {
        this.setState({pendingData: InvitationStore.getPendingData(), openIndex: -1});
        this.forceUpdate();
    }

    getInvitationMember(props) {
        let state = this.state;
        let obj = {
            'status': state.status,
            'pagenum': state.pagenum,
            'pagesize': state.pagesize,
            'sort': state.sort,
            'key': state.key
        };
        if (props) {
            obj = _.extend(obj, props);
        }
        getInvitationRecordCmd(obj);
    }

    renderNavTabs() {
        let locale = this.state.locale;
        let pendingLenth = this.state.pendingData.total;
        let acceptedLength = this.state.acceptedData.total;
        let status = this.state.invitationStatus;
        let tabItems = [
            {key: 'pending', label: StringUtils.format(locale.invitingNav, pendingLenth)},
            {key: 'accepted', label: StringUtils.format(locale.invitedNav, acceptedLength)}
        ];
        return <NavTabs navStyle="tabs" activeKey={status} items={tabItems} onSelect={this.handleTabSelected}/>;
    }

    openPadingBox = (openIndex)=> {
        let currentIndex = openIndex === this.state.openIndex ? -1 : openIndex;
        this.setState({openIndex: currentIndex})
    }

    revokeClick = (e, email)=> {
        let that = this;
        let locale = this.state.locale;
        let revokeParam = {email: email};
        revokeInvitationCmd(revokeParam).then((data)=> {
            that.setState({resentMsg: StringUtils.format(locale.hasRevokeMsg, email)});
        }).catch((e)=> {
            toast(that.state.locale.timeout);
            that.setState({resentMsg: ''});
        });
    }

    resendInvitationClick = (e, user)=> {
        let that = this;
        let locale = this.state.locale;
        let users = {email: user.email, byUid: user.byuid, status: user.status};
        resentInvitationCmd([users], '', '').then((data)=> {
            that.setState({resentMsg: StringUtils.format(locale.hasResentMsg, user.email)});
        }).catch((e)=> {
            toast(that.state.locale.timeout);
            that.setState({resentMsg: ''});
        });
    }

    changeSortedProps = (sortType)=> {
        this.setState({sort: sortType, openIndex: -1});
        this.getInvitationMember({sort: sortType});
    }

    keyworsChanged = (e)=> {
        let obj = {key: e.target.value, openIndex: -1};
        this.setState(obj);
        this.getInvitationMember(obj);
    }

    resetKeyWordsClick = ()=> {
        let obj = {key: '', openIndex: -1};
        this.setState(obj);
        this.getInvitationMember(obj);
    }

    pendingInvitation(locale) {
        let renderNode = [];
        let openIndex = this.state.openIndex;
        let pendingData = this.state.pendingData.items;
        if (pendingData && pendingData.size > 0) {
            renderNode = pendingData.map((val, i)=> {
                let result = i === openIndex;
                let member = TeamMembersStore.getTeamMemberByUid(val.byuid);
                let inviteDate = TimeZoneUtils.formatToString(val.gmtcreate, "YYYY/MM/DD");
                let inviteStatus = (val.status === 4 ? locale.inviteStatusResent : locale.inviteStatusInvited);
                return (
                    <li key={`pending_${i}`} onClick={e=>this.openPadingBox(i)}>
                        <div className="floatLeft">
                            <div className="email">{val.email}</div>
                            {
                                result &&
                                <div className="memberActions">
                                    <a className="btn_small"
                                       onClick={e=>this.revokeClick(e,val.email)}>{locale.revokeLabel}</a>
                                    <a className="btn_small btn_resend"
                                       onClick={e=>this.resendInvitationClick(e,val)}>{locale.resendLabel}</a>
                                </div>
                            }
                        </div>
                        <div className="floatRight ownerLine textRight">{member.username}</div>
                        <div className="floatRight date"> {inviteStatus} {inviteDate}</div>
                        {result && <i className="ficon_caret_down"></i>}
                        {!result && <i className="ficon_caret_right"></i>}
                    </li>);
            })
        }
        else {
            renderNode = (
                <div className="noRequestData">
                    <div className="noRequestMsg">
                        {locale.noPendingMsg} <b>{this.state.key}</b>
                    </div>
                    {
                        this.state.key &&
                        <p className="clearText">
                            <span className="btn_small"
                                  onClick={this.resetKeyWordsClick}>{locale.clearSearchLabel}</span>
                        </p>
                    }
                </div>
            );
        }
        return renderNode;
    }

    acceptedInvitation(locale) {
        let renderNode = [];
        let acceptedData = this.state.acceptedData.items;
        if (acceptedData && acceptedData.size > 0) {
            renderNode = acceptedData.map(function (val, i) {
                let member = TeamMembersStore.getTeamMemberByUid(val.byuid);
                let stadardDate = TimeZoneUtils.formatToString(val.gmtcreate, "YYYY/MM/DD");
                return (<li key={`accepted_${i}`}>
                    <div className="floatLeft avatar"
                         style={val.avatar?{backgroundImage:'url('+val.avatar+')'}:{}}></div>
                    <div className="floatLeft">
                        <div className="userName">{val.username}</div>
                        <div className="email2">{val.email}</div>
                    </div>
                    <div className="floatRight ownerLine textRight">{member.username}</div>
                    <div className="floatRight date">{locale.inviteStatusJoined} {stadardDate}</div>
                </li>);
            });
        }
        else {
            renderNode = (<div className="noRequestData">
                <div className="noRequestMsg">
                    {locale.noAcceptedMsg} <b>{this.state.key}</b>
                </div>
                {this.state.key && <p className="clearText">
                    <span className="btn_small" onClick={this.resetKeyWordsClick}>{locale.clearSearchLabel}</span>
                </p>}
            </div>);
        }
        return renderNode;
    }

    render() {
        let locale = this.state.locale;
        let status = this.state.invitationStatus;
        return (
            <div className="invitation_Result_box">

                <div className="manage-team-directory-header">
                    {locale.title}
                </div>

                {
                    this.state.resentMsg &&
                    <div className="invitationHintMsg success">
                        <i className="ficon_check_circle_o"></i>
                        <span dangerouslySetInnerHTML={{__html: this.state.resentMsg}}></span>
                    </div>
                }

                {
                    this.state.pendingData &&
                    <div className="invitationHintMsg error">
                        <i className="eficon-23"></i>
                        {locale.resultMessage1}{locale.resultMessage2}
                    </div>
                }

                <div className="invitationContent">
                    {this.renderNavTabs()}
                    <div className="operationLine">

                        <div className="sortedWords floatLeft">
                            <i className="eficon-search"/>
                            <input value={this.state.key} className="searchWords" onChange={e=>this.keyworsChanged(e)}
                                   placeholder={locale.keywordsPlacehoder}/>
                        </div>

                        <ul className="sortInfoLine floatRight">
                            <li data-id={SortedProps.Date}
                                className={`${this.state.sort===SortedProps.Date?'active':''}`}
                                onClick={e=>{this.changeSortedProps(SortedProps.Date)}}>{locale.dateProps}</li>
                            <li data-id={SortedProps.Name}
                                className={`sortedName ${this.state.sort===SortedProps.Name?'active':''}`}
                                onClick={e=>{this.changeSortedProps(SortedProps.Name)}}>{locale.nameProps}</li>
                        </ul>

                    </div>
                </div>

                <div className="invitations">
                    {status === 'accepted' && <ul className="acceptedInviteBox">{this.acceptedInvitation(locale)}</ul>}
                    {status === 'pending' && <ul className="paddingInviteBox">{this.pendingInvitation(locale)}</ul>}
                </div>

            </div>
        );
    }

}

