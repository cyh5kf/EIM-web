/* eslint-env node */
var child_process = require('child_process');

var isWin = /^win/.test(process.platform);

function execCmd(cmd, cmdOptions, getoutput) {
    return new Promise(function (resolve, reject) {
        if (getoutput) {
            child_process.exec([cmd].concat(cmdOptions || []).join(' '), function (error, stdout, stderr) {
                if (error) {
                    reject(stderr);
                } else {
                    resolve(stdout.split('\n').filter(function (line) {
                        return !!line;
                    }));
                }
            });
        } else {
            child_process.spawn(cmd, cmdOptions, {
                stdio: 'inherit'
            }).on('close', function (code) {
                if (code !== 0) {
                    reject();
                } else {
                    resolve();
                }
            });
        }
    });
}

function exec_npm(options) {
    options = options || [];
    return execCmd(isWin ? 'npm.cmd' : 'npm', options);
}

execCmd('git', ['diff', '--cached', '--name-status'], true)
    .then(function (lines) {
        var jsFilesInfo = lines.reduce(function (filesInfo, line) {
            const match = line.match(/\w\s+([^\s]+\.(js|jsx))($|\W)/);
            if (match) {
                var path = match[1];
                if (line.startsWith('A')) {
                    filesInfo.newFiles.push(path);
                } else if (line.startsWith('M')) {
                    filesInfo.changedFiles.push(path);
                }
            }
            return filesInfo;
        }, {
            changedFiles: [],
            newFiles: []
        });

        var promise = Promise.resolve();
        if (jsFilesInfo.changedFiles.length) {
            promise = promise.then(function () {
                return exec_npm(['run', 'eslint-cmd', '--', '--rule', 'react/prop-types:off'].concat(jsFilesInfo.changedFiles));
            });
        }
        if (jsFilesInfo.newFiles.length) {
            promise = promise.then(function () {
                return exec_npm(['run', 'eslint-cmd', '--', '--rule', 'react/prop-types:error'].concat(jsFilesInfo.newFiles));
            });
        }

        return promise;
    })
    .catch(function (error) {
        error && console.error(error);
        process.exit(1);
    });
