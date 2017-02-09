
export function showStyle(isShow, style) {
    style = style || {};
    return {
        display: isShow ? 'block' : 'none',
        ...style
    };
}

