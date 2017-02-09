import {
    createCommand
} from '../../utils/command';
import WebApiUtils from '../../utils/WebApiUtils';
import MentionStore from '../stores/MentionStore';

export const GetMentionListCmd = createCommand(function(obj) {
    return WebApiUtils.queryAtMsgApi(obj).then((result) => {
        MentionStore.updateMentioinList(result.data.msg || [], result.data.isLastBatch);
    });
}, {
    name: 'mentionList'
});
