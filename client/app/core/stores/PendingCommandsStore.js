import immutable from 'immutable';
import {cmdEventBus} from '../../utils/command';
import {createEventBus} from '../../utils/EventBus';

let pendingCmds = immutable.Map();

const PendingCommandsStore = createEventBus({
    getPendingCmds() {
        return pendingCmds;
    },
    updatePendingCmds({cmd, key, pending}) {
        pendingCmds = pendingCmds.setIn([cmd._name, key], pending);
        this.emit('change');
    }
});

cmdEventBus.addCmdPendingListener(({cmd, key, pending}) => PendingCommandsStore.updatePendingCmds({cmd, key, pending}));

export default PendingCommandsStore;
