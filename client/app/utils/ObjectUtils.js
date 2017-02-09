import _ from 'underscore';
import mapKeys from 'lodash/mapKeys';
import mapValues from 'lodash/mapValues';
import warning from './warning';

function _flattenObjectInto(obj, result, mapKeys, keyPath = '') {
    _.forEach(obj, (val, key) => {
        const currKeyPath = keyPath ? `${keyPath}.${key}` : key;
        if (_.isObject(val) && !_.isArray(val)) {
            _flattenObjectInto(val, result, mapKeys, currKeyPath);
        } else {
            const actualKey = mapKeys[currKeyPath] ? mapKeys[currKeyPath] : key;
            if (!result.hasOwnProperty(actualKey)) {
                result[actualKey] = val;
            } else if (result[actualKey] !== val) {
                warning(`flattenObject: 相同key(${actualKey})但是值不同, 一为: ${JSON.stringify(result[actualKey])}, 一为: ${JSON.stringify(val)}`);
            }
        }
    });
}

export default {
    /**
     * 将object扁平化
     *
     * mapKeys 参数为字段映射, 可用来解决扁平化中引起的字段冲突 (字段相同但值不同时为冲突)
     * 比如:
     * mapKeys({a: 1, b: {a: 2}}, {'b.a': 'a_in_b'})
     *  => {a: 1, a_in_b: 2}
     * */
    flattenObject(obj, mapKeys = {}) {
        if (__DEV__) {
            // 检查obj是否无循环引用
            JSON.stringify(obj);
        }
        const result = {_raw: obj};
        _flattenObjectInto(obj, result, mapKeys);
        return result;
    },

    toLowercaseKeys(obj) {
        return mapKeys(obj, (val, key) => {
            return key.toLowerCase();
        });
    },

    mapToString(obj, keys) {
        const keyMap = {};
        keys.forEach(key => keyMap[key] = true);
        return mapValues(obj, (val, key) => {
            if (keyMap[key]) {
                return val.toString();
            } else {
                return val;
            }
        });
    },

    mapKeys(data, keyMapping) {
        const result = {};
        _.forEach(keyMapping, (srcKey, tgtKey) => {
            result[tgtKey] = data[srcKey];
        });
    }
}
