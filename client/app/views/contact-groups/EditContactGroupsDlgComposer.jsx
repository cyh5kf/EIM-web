import React, {PropTypes} from 'react';
import _ from 'underscore';
import PureRenderComponent from '../../components/PureRenderComponent';
import Dialog from '../../components/dialog/Dialog';
import EditContactGroupsDialog from './EditContactGroupsDialog';
import ContactGroupsStore from '../../core/stores/ContactGroupsStore';
import exposePendingCmds from '../view-components/exposePendingCmds';
import {addOrEditContactGroupCmd, updateContactGroupStatusCmd, queryContactGroupsCmd, queryGroupMembersCmd, updateGroupMembersCmd} from '../../core/commands/contactGroupsCommands';

@exposePendingCmds([addOrEditContactGroupCmd, updateContactGroupStatusCmd, queryContactGroupsCmd, queryGroupMembersCmd, updateGroupMembersCmd])
export default class EditContactGroupsDialogComposer extends PureRenderComponent {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        isCreating: PropTypes.bool.isRequired,
        refetchGroups: PropTypes.bool.isRequired
    };

    static open({isCreating = false, refetchGroups = true} = {}) {
        Dialog.openDialog(EditContactGroupsDialogComposer, {
            isCreating,
            refetchGroups
        });
    }

    _updateTeamGroups = () => {
        this.setState({
            contactGroups: ContactGroupsStore.getContactGroups()
        });
    };

    componentWillMount() {
        this._updateTeamGroups();
        ContactGroupsStore.addEventListener('change', this._updateTeamGroups);
    }

    componentWillUnmount() {
        ContactGroupsStore.removeEventListener('change', this._updateTeamGroups);
    }

    render() {
        return <EditContactGroupsDialog {..._.pick(this.state, ['contactGroups', 'pendingCmds'])}
                                        {..._.pick(this.props, ['onClose', 'isCreating', 'refetchGroups'])}/>;
    }
}
