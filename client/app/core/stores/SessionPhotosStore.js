import immutable from 'immutable';
import {createEventBus} from '../../utils/EventBus';

let sessionPhotos = null,
    status = null;

export default createEventBus({
    getStatus() {
        return status;
    },
    updateStatus(updater) {
        status = updater(status);
        if (status.noPhotosForward) {
            status = status.update('displayOrder', displayOrder => Math.min(sessionPhotos.size - 1 - status.zeroOrderIndex, displayOrder));
        }
        if (status.noPhotosBackward) {
            status = status.update('displayOrder', displayOrder => Math.max(0 - status.zeroOrderIndex, displayOrder));
        }
    },

    getSessionPhotos() {
        return sessionPhotos;
    },
    updateSessionPhotos(updater) {
        sessionPhotos = (sessionPhotos || immutable.List()).update(updater);
    }
});
