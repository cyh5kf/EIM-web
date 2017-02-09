import React from 'react';
import _ from 'underscore';
import PureRenderComponent from '../../components/PureRenderComponent';
import exposeLocale from '../../components/exposeLocale';
import exposeStoreData from '../view-components/exposeStoreData';
import EnumMemberStatus from '../../core/enums/EnumMemberStatus';
import TeamDirectoryView from './TeamDirectoryView';
import TeamMembersStore from '../../core/stores/TeamMembersStore';
import ContactGroupsStore, {EVENTS as GroupsEvents} from '../../core/stores/ContactGroupsStore';
import ReactPropTypes from '../../core/ReactPropTypes';

@exposeLocale()
@exposeStoreData([
    [TeamMembersStore, () => ({
        enabledMembers: TeamMembersStore.getTeamMembers(EnumMemberStatus.Enabled),
        disabledMembers: TeamMembersStore.getTeamMembers(EnumMemberStatus.Disabled)
    })]
])
export default class TeamDirectoryComposer extends PureRenderComponent {
    static propTypes = {
        TeamDirectoryViewComponent: ReactPropTypes.func
    }
    static defaultProps = {
        TeamDirectoryViewComponent: TeamDirectoryView
    }
    _updateData = () => {
        this.setState({
            contactGroups: ContactGroupsStore.getContactGroups()
        });
    }
    componentWillMount() {
        this._updateData();
        ContactGroupsStore.addEventListener(GroupsEvents.CHANGE, this._updateData)
    }
    componentWillUnmount() {
        ContactGroupsStore.removeEventListener(GroupsEvents.CHANGE, this._updateData);
    }
    render() {
        const {TeamDirectoryViewComponent} = this.props;
        return <TeamDirectoryViewComponent {..._.pick(this.state, ['enabledMembers', 'disabledMembers', 'contactGroups', 'locale'])}/>;
    }
}
