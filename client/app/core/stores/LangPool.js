import PoolMixin from './PoolMixin';
import BrowserUtils from '../../utils/BrowserUtils';

const NS = 'langPool$$';

export default {
    getLang() {
        return PoolMixin.get(NS + 'lang') || BrowserUtils.getLang();
    },

    setLang(lang) {
        PoolMixin.set(NS + 'lang', lang);
    }
}
