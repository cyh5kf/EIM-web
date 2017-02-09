
export function showStyle(isShow, style) {
    style = style || {};
    return {
        display: isShow ? 'block' : 'none',
        ...style
    };
}


export function hideStyle(isHide, style) {
    style = style || {};
    if(isHide){
        style['display'] = "none";
    }
    return style;
}

