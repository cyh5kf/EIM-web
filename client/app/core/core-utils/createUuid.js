import uuid from '../../utils/uuid';

export default function createUuid() {
    return uuid.create().toString().replace(/[-]/g, '');
}
