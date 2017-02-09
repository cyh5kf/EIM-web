const RE_REG_KEYWORDS = /[-\/\\^$*+?.()|[\]{}]/g;

function escapeForRegExp(str) {
        return str.replace(RE_REG_KEYWORDS, '\\$&');
}

export default {
    newRegForText(text, flags) {
        return new RegExp(escapeForRegExp(text), flags);
    }
}
