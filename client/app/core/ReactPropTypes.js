import {PropTypes} from 'react';
import _ from 'underscore';
import {ReactPropTypes as schemaPropTypes} from '../utils/schema';
import createReactTypeChecker from '../utils/createReactTypeChecker';
import {getLocale, LocaleTypeApp} from '../components/exposeLocale';

function getSlice(obj, keys = []) {
    keys = keys.concat();
    while (keys.length) {
        obj = obj[keys.shift()];
    }
    return obj;
}

export default {
    ...PropTypes,

    // 验证为schema数据(默认为immutable格式, 也可以指定为非immutable格式)
    ofSchema: schemaPropTypes.ofSchema,
    ofSchemas: (schemas, {isImmutable = true} = {}) => PropTypes.oneOfType(schemas.map(oneSchema => {
        return schemaPropTypes.ofSchema(oneSchema, {isImmutable});
    })),

    // 验证为enum对象中的值
    ofEnum: enumObj => PropTypes.oneOf(_.values(enumObj)),

    // 验证为 exposePendingCmds 导出的检查cmd进行中状态的对象
    pendingCmds: PropTypes.shape({
        isPending: PropTypes.func.isRequired
    }),

    // 验证为指定路径的本地化, 默认为整个本地化语言的根节点
    ofLocale: (keys = []) => createReactTypeChecker((props, propName, componentName, location, propFullName) => {
        const propValue = props[propName];
        if (propValue !== getSlice(getLocale(LocaleTypeApp), keys)) {
            const pathLabel = keys.length ? `"${keys.join('.')}" 路径` : '根路径';
            const dataKeys = JSON.stringify(_.keys(propValue));
            return new Error(`'${componentName}'中 ${location} '${propFullName}' 数据不合法, 期望得到 ${pathLabel} 上的locale数据, 实际包含字段为: ${dataKeys}.`);
        } else {
            return null;
        }
    })
};
