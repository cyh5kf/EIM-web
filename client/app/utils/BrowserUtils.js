export default {
	getLang: function() {
		return navigator.language || navigator.userLanguage;
	},
	parseURLPara: function() {
		var url = location.search; //获取url中"?"符后的字串
		var theRequest = {
			uriParams: url
		};
		if (url.indexOf("?") !== -1) {
			var str = url.substr(1);
			var strs = str.split("&");
			for (var i = 0; i < strs.length; i++) {
				theRequest[strs[i].split("=")[0]] = (strs[i].split("=")[1]);
			}
		}
		return theRequest;
	},
	platform: {
		isMac: navigator.platform.indexOf('Mac') !== -1
	},
	// parseUrlRelativePath: function() {
	// 	var url = document.location.toString();
	// 	var arrUrl = url.split("//");

	// 	var start = arrUrl[1].indexOf("/");
	// 	var relUrl = arrUrl[1].substring(start); //stop省略，截取从start开始到结尾的所有字符
	// 	if (relUrl.indexOf("?") !== -1) {
	// 		relUrl = relUrl.split("?")[0];
	// 	}
	// 	return relUrl.split('/');
	// },
	// checkPathWithRouter: function(paramArr) {
	// 	if (_.isArray(paramArr)) {
	// 		for (var i = 0; i < paramArr.length; i++) {

	// 			switch (paramArr[i]) {
	// 				case 'signup':
	// 				case 'invite':
	// 				case 'set':
	// 				case 'reset':
	// 					return true;
	// 				default:
	// 					break;
	// 			}
	// 		}
	// 	}
	// 	return false;
	// },
	UrlDecode: function(zipStr) {
		var uzipStr = "";
		if (zipStr) {
			for (var i = 0; i < zipStr.length; i++) {
				var chr = zipStr.charAt(i);
				if (chr === "+") {
					uzipStr += " ";
				} else if (chr === "%") {
					var asc = zipStr.substring(i + 1, i + 3);
					if (parseInt("0x" + asc) > 0x7f) {
						uzipStr += decodeURI("%" + asc.toString() + zipStr.substring(i + 3, i + 9).toString());
						i += 8;
					} else {
						uzipStr += String.fromCharCode(parseInt("0x" + asc));
						i += 2;
					}
				} else {
					uzipStr += chr;
				}
			}
		}

		return uzipStr;
	}
};
