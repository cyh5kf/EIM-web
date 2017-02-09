import immutable from 'immutable';
import _ from 'underscore';
import RegExpUtils from '../../utils/RegExpUtils';

export default function searchGroups(groups, keyword) {
    if (!groups) {
        return null;
    } else if (!keyword) {
        return groups.map(group => group.update('name', _.escape));
    } else {
        const list = [];
        keyword = _.escape(keyword);
        groups.forEach(group => {
            const name = _.escape(group.name);
            if (name.indexOf(keyword) !== -1) {
                list.push(group.set('name', name.replace(RegExpUtils.newRegForText(keyword, 'g'), '<span class="highlight">$&</span>')));
            }
        });

        return immutable.List(list);
    }
}
