/* eslint-env node */
var fse = require('fs-extra'),
    jsonStableStringify = require('json-stable-stringify'),
    _ = require('lodash'),
    path = require('path'),
    ROOT = path.join(__dirname, '..');

function stringifyForOutput(jsonObj) {
    return jsonStableStringify(jsonObj, {space: 2});
}

// 以 en_US 为默认, 填充其他本地化的未翻译字段
var path_en_US = path.join(ROOT, 'client/app/locales/en_US.json'),
    path_zh_CN = path.join(ROOT, 'client/app/locales/zh_CN.json'),
    en_US = require(path_en_US),
    zh_CN = require(path_zh_CN);

_.defaultsDeep(zh_CN, en_US);

fse.writeFileSync(path_en_US, stringifyForOutput(en_US));
fse.writeFileSync(path_zh_CN, stringifyForOutput(zh_CN));

console.log('locale 生成成功.');
