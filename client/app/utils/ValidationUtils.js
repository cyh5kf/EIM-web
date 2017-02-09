import _ from 'underscore';
import revalidator from 'revalidator';

function getSchemaDefintion(locale) {
	return {
		email: {
			type: 'string',
			maxLength: 255,
			format: 'email',
			required: true,
			allowEmpty: false,
			messages: locale.email
		},
		emailName: {
			type: 'string',
			maxLength: 255,
			pattern: '^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+$',
			required: true,
			allowEmpty: false,
			messages: locale.username
		},
		companyname: {
			type: 'string',
			maxLength: 255,
			required: true,
			allowEmpty: false,
			messages: locale.companyname
		},
		username: {
			type: 'string',
			maxLength: 255,
			pattern: '^([a-zA-Z0-9_\.\-])+$',
			required: true,
			allowEmpty: false,
			messages: locale.username
		},
		authCode: {
			type: 'string',
			maxLength: 255,
			required: true,
			allowEmpty: false,
			pattern: '^\\d*$',
			messages: locale.authCode
		},
		password: {
			type: 'string',
			minLength: 6,
			maxLength: 60,
			required: true,
			allowEmpty: false,
			messages: locale.password
		},
		phone: {
			required: true,
			pattern: '^((\\d{11})|^((\\d{7,8})|(\\d{4}|\\d{3})-(\\d{7,8})|(\\d{4}|\\d{3})-(\\d{7,8})-(\\d{4}|\\d{3}|\\d{2}|\\d{1})|(\\d{7,8})-(\\d{4}|\\d{3}|\\d{2}|\\d{1}))$)$', // 支持手机号码,3-4位区号,7-8位直播号码,1-4位分机号
			messages: locale.phone
		}
	};
}

function getSchema(data, locale) {
	var schema = {
		"properties": {}
	};
	_.mapObject(getSchemaDefintion(locale), function(value, key) {
		if (_.has(data, key))(schema.properties)[key] = value;
	});

	return schema;
}

module.exports = {
	getButtonState: function(buttonState) {
		var result = false;
		if (_.isEmpty(buttonState)) {
			return true;
		}
		_.mapObject(buttonState, function(value) {
			if (!value) result = true;
		});

		return result;
	},
	validateData: function(inputInfo, locale) {
		var data = {};
		data[inputInfo.datatype] = inputInfo.value;

		var schema = {
			"properties": {}
		};
		_.mapObject(getSchemaDefintion(locale), function(value, key) {
			if (_.has(data, key))(schema.properties)[key] = value;
		});
		return revalidator.validate(data, schema);
	},
	validateInput: function(inputInfo, locale) {

		var validatorResult = this.validateData(inputInfo, locale);
		var result = {
			validatorResult: {},
			buttonState: {}
		};
		if (inputInfo.value && !validatorResult.valid) {
			result.validatorResult[inputInfo.name + 'tips'] = validatorResult.errors[0].message;
		} else {
			result.validatorResult[inputInfo.name + 'tips'] = "";
		}
		result.validatorResult[inputInfo.name + 'valid'] = validatorResult.valid;
		result.buttonState[inputInfo.name] = validatorResult.valid;

		return result;
	},
	validUserInfo: function(obj, locale) {
		var validResult = {
			valid: true
		};

		_.mapObject(obj, function(value, key) {
			var tmp = {};
			tmp[key] = value;
			var validTmp = revalidator.validate(tmp, getSchema(tmp, locale));
			if (!validTmp.valid) validResult = validTmp;
		});

		return validResult;
	},

	validateEmail(email) {
		return (email && /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test(email));
	}
}