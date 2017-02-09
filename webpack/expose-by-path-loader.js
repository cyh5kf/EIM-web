/* eslint-env node */
/**
 * 将模块按路径名导出到全局 _dev 变量下
 */

var path = require('path'),
    APP_DIR = path.resolve(__dirname, '..', 'client', 'app'),
    _ = require('lodash');

module.exports = function (content, sourcemap) {
    this.cacheable();
    var modulePath = path.relative(APP_DIR, this.resourcePath),
        shortName = path.basename(modulePath).replace(/\.(js|jsx)$/, ''),
        longName = shortName + '_' + path.dirname(modulePath).replace(/[\/\\\.]/g, '_'),
        newContent = content + '\n\n' +
            '/** INJECTED BY "EXPOSE BY PATH" LOADER **/\n' +
            'window._dev = window._dev || {};\n' +
            _.template('window._dev[ !window._dev["<%= shortName %>"] ? "<%= shortName %>" : "<%= longName =>" ] = module.exports;')({
                shortName: shortName,
                longName: longName
            });

    this.callback(null, newContent, sourcemap);
};
