/* eslint-env node */
var fs = require('fs'),
    path = require('path');

process.chdir(path.join(__dirname, '..', '.git', 'hooks'));


try {
    fs.unlinkSync('pre-commit');
} catch (e) {
    // pass
}

fs.writeFileSync('pre-commit', [
    '#!/bin/sh',
    'npm run pre-commit'
].join('\n'), {
    mode: 0o777
});
