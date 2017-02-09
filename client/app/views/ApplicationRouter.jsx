import '../../less/app.less';

import '../polyfills';
import '../core/registerUnhandledRejection';
import LocaleConfig from '../core/locale-config/LocaleConfig';
import gGlobalEventBus from '../core/dispatcher/GlobalEventBus';

import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import {Router, browserHistory} from 'react-router';
import {QueryLoginInfoCmd} from '../core/commands/LoginCommands';
import AppRouteConfig from './routeconfig/AppRouteConfig';

// 全局moment仅用于提供给webuploader
window.moment = moment;

let queryLoginPromise = QueryLoginInfoCmd();

let onLocaleLoaded = function() {
    queryLoginPromise.then(() => {
        ReactDOM.render(
            (<Router history={browserHistory} routes={AppRouteConfig} />),
            document.getElementById("app")
        );
    });
};


LocaleConfig.load();

gGlobalEventBus.once('onLocaleLoaded', onLocaleLoaded);
