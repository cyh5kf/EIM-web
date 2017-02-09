import StringUtils from '../../utils/StringUtils';
import InitDataStore from '../../core/stores/InitDataStore';
import EnumEventType from '../../core/enums/EnumEventType';
import EmojifyResource from '../../components/emojify/EmojifyResource';
import _ from 'underscore';

const defaultNameEmoji = {};
_.map(EmojifyResource, (arr, key)=>{
    _.each(arr, (emoji) =>{
        defaultNameEmoji[emoji] = true;
    });
});

export default {

    parserEmoji: function(text, emojiMap){
          //标记字符串emoji截取的起始位置,因为每次递归处理字符串长度会变化,所以是累加的.
        let markIdx = text.indexOf(':');
        //需要处理的字符串
        let searchText = text;
        //返回的所有的emoji字符串对象
        //{idx:原字符串中，它截取的位置,text:对应的文本}
        let emojiObjects = null;
        let idx = markIdx;
        while(idx > -1){
            searchText = searchText.substring(idx+1);
            if(searchText.length === 0){
                return emojiObjects;
            }
            let nextColonIdx = searchText.indexOf(':');
            if(nextColonIdx === -1){
                return emojiObjects;
            }

            let emojiText = searchText.substring(0, nextColonIdx);

            if(emojiMap[emojiText]){
                let emojiObj = {
                    text:':'+emojiText+':',
                    idx:markIdx
                }
                if(emojiObjects == null){
                    emojiObjects = [];
                }
                emojiObjects.push(emojiObj);

                searchText = searchText.substring(nextColonIdx + 1);
                idx = searchText.indexOf(':');
                markIdx += nextColonIdx + idx + 2;
            } else {
                idx = nextColonIdx;
                markIdx += nextColonIdx + 1;
            }

        }
        return emojiObjects;
    },


    /**
     *
     * @param message
     * @param emojiResource 必选参数,表情库
     * @param loginUser [可选参数]  当前登录的用户.用来判断是不是at了当前用户.数据跟LoginStore.getUserInfo()一致.
     * @returns {*}
     */
    parse: function(message, loginUser = null, emojiResource = defaultNameEmoji){
        let target = null;
        if(message.eventtype === EnumEventType.TextMsg){
                target = message.text;
                
            //bug EW-144   尽量早的处理emoji. 减少针对':'的处理
            const matchAllEmoji  = this.parserEmoji(target, emojiResource);
            if(matchAllEmoji != null){
                //需要标记文本偏移，每次替换都会引起文本长度变化
                let textPosOffset = 0;
                let emojiText = target;
                _.each(matchAllEmoji, (emojiObj)=>{
                    const prefixstr = emojiText.substring(0, textPosOffset + emojiObj.idx);
                    const suffixstr = emojiText.substring(textPosOffset + emojiObj.idx + emojiObj.text.length);
                    const emojiNames = emojiObj.text.split(':');
                    emojiText = prefixstr + '<div class="emoji-' + emojiNames[1] + ' emoji"></div>' + suffixstr;
                    textPosOffset = emojiText.length - target.length;
                });
                target = emojiText;
            }

            const emails = StringUtils.emailMatches(target);
            let len, i;
            if(emails){
                for(len=emails.length - 1, i=len; i>=0; i--){
                    target = target.replace(new RegExp(emails[i], 'i'), '__emailtrap__'+i);
                }
            }
            if(target.indexOf('http') > -1 || target.indexOf('https') > -1){
                target = StringUtils.convertURLToLink(target);
            }
            if(emails){
                for(len=emails.length - 1, i=len; i>=0; i--){
                    target = target.replace(new RegExp('__emailtrap__'+i, 'i'), emails[i]);
                }
                target = StringUtils.convertMailToLink(target);
            }

            let atObjectTexts = StringUtils.atMatches(target);

            if(atObjectTexts){
                for (len = atObjectTexts.length - 1, i = len; i >= 0; i--) {
                    const atText = atObjectTexts[i];
                    let atTarget = '';
                    let idendifyId = '';
                    var actionType = 'atLink';
                    if (atText.indexOf('Session') === -1) {
                        idendifyId = StringUtils.getMentionIdentify(atText);
                        atTarget = InitDataStore.getNameByIdentifyId(idendifyId);
                    } else {
                        atTarget = 'channel';
                        idendifyId = '@channel';
                        actionType = 'atLinkChannel';
                    }

                    if (loginUser && loginUser.uid === idendifyId) {
                        actionType += "  atLinkCurUser";
                    }

                    const atObjLink = StringUtils.format('<a href="javascript:void(0)" class="{3}" data-action="{3}" data-id="{0}" target="/{1}">@{2}</a>',
                        idendifyId, atTarget, atTarget, actionType);
                    target = target.replace(new RegExp(atText, 'i'), atObjLink);
                }
            }
        }

        return target;
    }
}

