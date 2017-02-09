import {updateLocale, LocaleTypeApp, LocaleTypeAntdCalendar} from './../../components/exposeLocale';
import gGlobalEventBus from './../dispatcher/GlobalEventBus';
import moment from 'moment';
import _ from 'underscore';
import LangPool from '../stores/LangPool';
import MomentCustomLocale from '../../locales/moment-custom-locale';

// jyf: TODO: 测试用，默认用英文补全其他语言的本地化
import en_US from '../../locales/en_US';
const defaultLocaleObj = en_US.localeSettings;
function applyDefaultLocale(defLocaleObj, localeObj) {
    _.each(defLocaleObj, (val, key) => {
        if (_.isString(val)) {
            if (val) {
                localeObj[key] = localeObj[key] || val;
            }
        } else {
            localeObj[key] = localeObj[key] || {};
            applyDefaultLocale(val, localeObj[key]);
        }
    });
}


var LocaleMessageLoader = (function() {
    return {
        setLocale: function() {
            const onLocaleObjLoaded = ({localeSettings, antdCalendarLocale, momentLocaleName}) => {
                setTimeout(function () {
                    moment.updateLocale(momentLocaleName, MomentCustomLocale[momentLocaleName]);
                    window.gLocaleSettings = localeSettings;

                    applyDefaultLocale(defaultLocaleObj, window.gLocaleSettings);

                    updateLocale(LocaleTypeApp, window.gLocaleSettings);
                    updateLocale(LocaleTypeAntdCalendar, antdCalendarLocale);

                    gGlobalEventBus.emit('onLocaleLoaded', true);
                }, 0);
            };

            switch (LangPool.getLang()) {
                case 'zh-CN':
                    require(['../../locales/en_US'], onLocaleObjLoaded);
                    break;
                case 'en-US':
                default:
                    require(['../../locales/en_US'], onLocaleObjLoaded);
                    break;
            }
        }
    }
})();

export default {
    load: function() {
        LocaleMessageLoader.setLocale();
    },

    refresh: function(localeCode) {
        LangPool.setLang(localeCode);
        LocaleMessageLoader.setLocale();
    },

    getLocale: function() {
        return LangPool.getLang();
    }
}
