import React from 'react';
import {
    Route,
    IndexRoute,
    IndexRedirect
} from 'react-router';

import ApplicationMainWindow from '../ApplicationMainWindow';
import LoginStore from '../../core/stores/LoginStore';
import UserRegisterStore from '../../core/stores/UserRegisterStore';
import ApplicationMainComposer from '../ApplicationMainComposer';
import Index from '../index/Index';
import MemberRegisterComposer from '../user/account/MemberRegisterComposer';
import NotFoundPage from '../NotFoundPage';


import SettingsPage from '../settings/SettingsPage';
import Signout from '../settings/account/Signout';
import AccountInfoDialog from '../settings/account/AccountInfoDialog';
import ManageTeam from '../settings/manage-team/ManageTeamComposer';
import ManageTeamDirectoryComposer from '../settings/manage-team-directory/ManageTeamDirectoryComposer';
import TeamSettingComposer from '../settings/team-settings/TeamSettingComposer';
import TeamDeleteComposer from '../settings/team-settings/TeamDeleteComposer';
import ForgotPasswordComposer from '../user/forgotpassword/ForgotPasswordComposer';
import LoginComposer from '../user/login/LoginComposer';

import ChattingPageComposer from '../chatting-page/ChattingPageComposer';
import ContactView from '../contact-view/ContactView';

const isLoggedIn = () => LoginStore.logined();

// function jumpToMainIfLoggedIn(nextState, replace) {
//     var isIndex = (nextState.location.pathname === '/' || nextState.location.pathname === '/signin');
//     if (isIndex) {
//         if (isLoggedIn()) {
//             replace('/main');
//         }
//     }
// }

//function requireLoginComponent(BaseComponent) {
//    @exposeUserInfo
//    class RequireLogin extends BaseComponent {
//        render() {
//            const {
//                userInfo
//            } = this.state;
//            if (userInfo && userInfo.logined && super.render) {
//                return super.render(...arguments);
//            } else {
//                return null;
//            }
//        }
//    }
//    return RequireLogin;
//}

function requireLogin(nextState, replace) {
    if (!isLoggedIn()) {
        replace('/');
    }
}

function requireCreate(nextState, replace) {
    var step = UserRegisterStore.getNextStep(UserRegisterStore.getCurStep());
    var curParse = (nextState.location.pathname).split('/');
    if (step !== curParse[2]) {
        replace('/create/' + step);
    }
}

// function requireInvite(nextState, replace) {
//     var curParse = (nextState.location.pathname).split('/');
//     if (curParse[2] === 'password') {
//         replace("/invite" + nextState.location.search);
//     }
// }

export default (
    <Route path="/" component={ApplicationMainWindow}>
        <Route path="" getComponent={(c, cb) => cb(null, require('../IndexComposer'))} >
            <IndexRoute component={Index} />
            <Route path="create" component={MemberRegisterComposer} onEnter={requireCreate} >
                <Route path="email" getComponent={(c, cb)=>cb(null, require('../user/account/MemberEmailView'))}/>
                <Route path="authCode" getComponent={(c, cb)=>cb(null, require('../user/account/MemberAuthCodeView'))}/>
                <Route path="userInfo" getComponent={(c, cb)=>cb(null, require('../user/account/MemberUserInfoView'))}/>
            </Route>
            <Route path="invite" getComponent={(n, cb) => cb(null, require('../user/account/InvitationRegisterComposer'))} />
            <Route path="signin" component={LoginComposer} />
            <Route path="forgot" component={ForgotPasswordComposer} />
            <Route path="richbox" getComponent={(n, cb) => cb(null, require('../dialog/EditRichTextDialog'))} />
        </Route>
        <Route path="main" component={ApplicationMainComposer} onEnter={requireLogin}>
            <IndexRedirect to="chatting"/>
            <Route path="chatting" component={ChattingPageComposer}/>
            <Route path="contacts" component={ContactView}/>
            <Route path="message/:sessionid/:sessiontype/:msgsrvtime/:msguuid"/>
            <Route path="*"/>
        </Route>
        <Route path="settings" component={SettingsPage} onEnter={requireLogin}>
            <IndexRedirect to="manage-team"/>
            <Route path="manage-team" component={ManageTeam}/>
            <Route path="team-settings/:currentPage" component={TeamSettingComposer}/>
            <Route path="team-delete" component={TeamDeleteComposer}/>
            <Route path="team-directory" component={ManageTeamDirectoryComposer}/>
            <Route path="manage-account/signout" component={Signout}/>
            <Route path="manage-account/:currentPage" component={AccountInfoDialog}/>
        </Route>
        <Route path="*" component={NotFoundPage}/>
    </Route>
);