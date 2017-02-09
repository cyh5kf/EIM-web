import React from 'react';
import PureRenderComponent from '../../../components/PureRenderComponent';
import Button from '../../../components/button/Button';
import ReactPropTypes from '../../../core/ReactPropTypes';
import EditContactGroupsDlgComposer from '../../contact-groups/EditContactGroupsDlgComposer';
import StringUtils from '../../../utils/StringUtils';

import './ManageUserGroupsGuide.less';

function getTip(tipText) {
    const highlightPart = part => <span className="tip-highlight">{part}</span>;
    return StringUtils.formatAsReact(tipText, highlightPart, highlightPart, highlightPart);
}

export default class ManageUserGroupsGuide extends PureRenderComponent {
    static propTypes = {
        locale: ReactPropTypes.object.isRequired
    }

    render() {
        const {locale} = this.props;
        return (
            <div className="manage-user-groups-guide">
                <h2>{locale.MANAGE_TEAM['tabUserGroups']}</h2>
                <p>{getTip(locale.MANAGE_TEAM['userGroupsTip1'])}</p>
                <p>{getTip(locale.MANAGE_TEAM['userGroupsTip2'])}</p>
                <Button className="button-green" onClick={EditContactGroupsDlgComposer.open}>{locale.MANAGE_TEAM['editUserGroupsBtn']}</Button>
            </div>
        );
    }
}
