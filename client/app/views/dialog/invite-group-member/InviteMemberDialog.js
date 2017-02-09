import React from 'react';
import exposeLocale from '../../../components/exposeLocale';
import InvitationStore from '../../../core/stores/InvitationStore';
import ModelDialog from '../../../components/dialog/ModelDialog';
import InviteInputView from './InviteInputView';
import InviteRecordView from './InviteRecordView';
import InviteResultView from './InviteResultView';
import "./InviteMemberDialog.less";


@exposeLocale(['DIALOGS', 'dlg-groupInvite'])
export default class InviteMemberDialog extends ModelDialog {
    static defaultProps = {
        ...ModelDialog.defaultProps,
        name: 'invite-member-dialog'
    }
    constructor() {
        super(...arguments);
        this.state = {
            show: true,
            viewIndex: 1,
            inviteResultData:null
        };
    }

    static open() {
        ModelDialog.openDialog(InviteMemberDialog);
    }

    componentWillMount() {
        super.componentWillMount(...arguments);
    }

    componentWillUnmount() {
        super.componentWillUnmount(...arguments);
    }

    onShowInviteRecordView() {
        this.setState({viewIndex: 3});
    }

    onShowInviteInputView(){
        this.setState({viewIndex: 1});
    }

    onShowInviteResultView(){
        var inviteResultData = InvitationStore.getInviteResultData();
        this.setState({viewIndex: 2,inviteResultData:inviteResultData});
    }

    onCloseDialog(){
        this.close();
    }

    renderContent() {
        var {viewIndex} = this.state;
        var that = this;
        return (
            <div>
                {viewIndex === 1 ? <InviteInputView
                    onShowInviteRecordView={that.onShowInviteRecordView.bind(that)}
                    onShowInviteResultView={that.onShowInviteResultView.bind(that)}
                    onCloseDialog={this.onCloseDialog.bind(this)}></InviteInputView> : null}
                {viewIndex === 2 ? <InviteResultView
                    onShowInviteRecordView={that.onShowInviteRecordView.bind(that)}
                    onShowInviteInputView={that.onShowInviteInputView.bind(that)}
                    onCloseDialog={this.onCloseDialog.bind(this)}
                    dataSource={this.state.inviteResultData}></InviteResultView> : null}
                {viewIndex === 3 ? <InviteRecordView></InviteRecordView> : null}
            </div>
        );
    }

}

