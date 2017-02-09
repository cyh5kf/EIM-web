import immutable from 'immutable';
import {createEventBus} from '../../utils/EventBus';
import {ContactGroupListSchema} from '../../core/schemas/ContactGroupsSchemas';
import {createImmutableSchemaData} from '../../utils/schema';

let contactGroups = createImmutableSchemaData(ContactGroupListSchema, []);

export const EVENTS = {
    CHANGE: 'change'
}

export default createEventBus({
    getContactGroups() {
        return contactGroups;
    },

    updateContactGroups(updater) {
        contactGroups = (contactGroups || immutable.List()).update(updater);
        this.emit(EVENTS.CHANGE);
    },

    updateContactGroup(guuid, updater) {
        this.updateContactGroups(groups => {
            return groups.updateIn([groups.findIndex(grp =>grp.guuid === guuid)], updater);
        });
    }

});
