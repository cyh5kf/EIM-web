/*
这个插件主要用于将一个css class数组转变为标签可以使用的class字符串。
这个其实是github上的一个插件，但代码很少且没有依赖其他插件，所以这里单独提取出来使用。
参数输入：{'foo':true,bar:true,'baz':false}  =>  'foo bar'
*/

'use strict';

var hasOwn = {}.hasOwnProperty;

module.exports = function classNames() {
	var classes = [];

	for (var i = 0; i < arguments.length; i++) {
		var arg = arguments[i];
		if (!arg) continue;

		var argType = typeof arg;

		if (argType === 'string' || argType === 'number') {
			classes.push(arg);
		} else if (Array.isArray(arg)) {
			classes.push(classNames.apply(null, arg));
		} else if (argType === 'object') {
			for (var key in arg) {
				if (hasOwn.call(arg, key) && arg[key]) {
					classes.push(key);
				}
			}
		}
	}

	return classes.join(' ');
};
