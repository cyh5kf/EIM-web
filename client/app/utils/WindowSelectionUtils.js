function insertAtCursor(target, inputvalue, slient = false) {

    if (document.selection) {
        target.focus();
        const sel = document.selection.createRange();
        sel.text = inputvalue;
        sel.select();
    }
    else if (target.selectionStart || target.selectionStart.toString() === '0') {
        const startPos = target.selectionStart;
        const endPos = target.selectionEnd;
        const restoreTop = target.scrollTop;
        target.value = target.value.substring(0, startPos) + inputvalue + target.value.substring(endPos, target.value.length);
        if (restoreTop > 0) {
            target.scrollTop = restoreTop;
        }
        target.focus();
        target.selectionStart = startPos + inputvalue.length;
        target.selectionEnd = startPos + inputvalue.length;
       
    } else {
        target.value += inputvalue;
        target.focus();
    }
}

function insertAfterAt(target, newvalue){
    const startPos = target.selectionStart;
    const endPos = target.selectionEnd;
    const restoreTop = target.scrollTop;
    let  text = target.value.substring(0, endPos);
    let idx = text.lastIndexOf('@');
    if(text){
        text = text.substring(idx + 1, endPos);
        target.value = target.value.substring(0, idx+1) + newvalue + target.value.substring(endPos, target.value.length);
    }
    if (restoreTop > 0) {
        target.scrollTop = restoreTop;
    }
    target.selectionStart = startPos + newvalue.length;
    target.selectionEnd = startPos + newvalue.length;
    setTimeout(()=>{
     target.focus();
    }, 0);
}

function getTextImmediatelyAfterAt(target){
    const endPos = target.selectionEnd,
         restoreTop = target.scrollTop;
    let text = target.value.substring(0, endPos),
        idx = text.lastIndexOf('@');
    if(idx > -1){
        if(idx > 0){
            //@前面必须是空格
            let spaceText = text.substring(idx-1, idx);
            const strlen = spaceText.length, trimlen = spaceText.replace(/(^\s*)/g,"").length;
            if(trimlen === strlen && spaceText !==':'){
                return null;
            }
        }
        if(text){
            text = text.substring(idx + 1, endPos);
        }
        if (restoreTop > 0) {
            target.scrollTop = restoreTop;
        }
        target.focus();
    }else{
        text = null;
    }
    return text;
}

module.exports = {
    insertAtCursor: insertAtCursor,
    insertAfterAt: insertAfterAt,
    getTextImmediatelyAfterAt:getTextImmediatelyAfterAt
}
