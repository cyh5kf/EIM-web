import React from 'react';
import exposeLocale from '../../../components/exposeLocale';
import UsersSelector from '../users-selector/UsersSelector';
import EnumSearchUserType from '../../../core/enums/EnumSearchUserType';
import TimeZoneUtils from '../../../utils/TimeZoneUtils';
import EnumLoginStatus from '../../../core/enums/EnumLoginStatus';
import classnames from '../../../utils/ClassNameUtils';

@exposeLocale()
export default class UsersChatSelector extends UsersSelector {
    
    renderOption = (data) => {
        const {userType = this.props.userTypes[0]} = data;

        if (userType === EnumSearchUserType.User) {
            return (
                <div className={classnames("user-info-item clear-float", data.loginstatus === EnumLoginStatus.WebOnline? "online":"offline")}>
                    <div className="item-logo" style={data.logo ? {backgroundImage: `url(${data.logo})`} : {}}>
                        <i className="status-indicator"/>
                    </div>
                    <div className="user-info">
                        <div className="user-info-name" dangerouslySetInnerHTML={{__html: data.name}}></div>
                        <div className="user-info-desc" dangerouslySetInnerHTML={{__html: data.title}}></div>
                    </div>
                    <span className="user-info-time" dangerouslySetInnerHTML={{__html: TimeZoneUtils.formatToTimeLine(data.createDate)}}></span>
                </div>
            );
        } else {
            return (
                <div className="group-chat-item">
                    {this.renderOptionInfo(data)}
                </div>
            );
        }
    }
}
