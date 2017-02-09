import StorageType from '../enums/EnumStorageType';

export default {
    get: function(key, type) {
        if (type === StorageType.SESSION) {
            return sessionStorage.getItem(key);
        } else {
            return localStorage.getItem(key);
        }

    },
    set: function(key, value, type) {
        if (type === StorageType.SESSION) {
            sessionStorage.setItem(key, value);
        } else {
            localStorage.setItem(key, value);
        }

    },
    clean: function(type) {
        if (type === StorageType.SESSION) {
            sessionStorage.clear();
        } else {
            localStorage.clear();
        }
    },
    remove: function(key, type) {
        if (type === StorageType.SESSION) {
            sessionStorage.removeItem(key);
        } else {
            localStorage.removeItem(key);
        }

    }
}
