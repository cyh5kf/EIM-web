/* eslint-env node */
var path = require('path'),
    nsg = require('node-sprite-generator'),
    ROOT_DIR = path.join(__dirname, '..');

nsg({
    src: [
        path.join(ROOT_DIR, 'client/static/sprites/*.png')
    ],
    compositor: 'jimp',
    spritePath: path.join(ROOT_DIR, 'client/static/images/_eim-sprites.png'),
    stylesheetPath: path.join(ROOT_DIR, 'client/less/eim-sprites.less'),
    layout: 'packed',
    layoutOptions: {
        padding: 0
    },
    stylesheet: path.join(ROOT_DIR, 'scripts/build-sprites-css.tpl'),
    stylesheetOptions: {
        prefix: 'icon-',
        pixelRatio: 2
    }
}, function (err) {
    if (err) {
        console.log(err);
        process.exit(1);
    } else {
        console.log('Sprites 生成成功.')
    }
});
