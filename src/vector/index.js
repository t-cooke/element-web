/*
Copyright 2015, 2016 OpenMarket Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

// for ES6 stuff like startsWith() that Safari doesn't handle
// and babel doesn't do by default
// Note we use this, as well as the babel transform-runtime plugin
// since transform-runtime does not cover instance methods
// such as "foobar".includes("foo") which bits of our library
// code use, but the babel transform-runtime plugin allows the
// regenerator runtime to be injected early enough in the process
// (it can't be here as it's too late: the alternative is to put
// the babel-polyfill as the first 'entry' in the webpack config).
// https://babeljs.io/docs/plugins/transform-runtime/
require('babel-polyfill');

// CSS requires: just putting them here for now as CSS is going to be
// refactored "soon" anyway
require('../build/components.css');
require('gemini-scrollbar/gemini-scrollbar.css');
require('gfm.css/gfm.css');
require('highlight.js/styles/github.css');
require('draft-js/dist/Draft.css');


 // add React and ReactPerf to the global namespace, to make them easier to
 // access via the console
global.React = require("react");
if (process.env.NODE_ENV !== 'production') {
    global.ReactPerf = require("react-addons-perf");
}

var RunModernizrTests = require("./modernizr"); // this side-effects a global
var ReactDOM = require("react-dom");
var sdk = require("matrix-react-sdk");
sdk.loadSkin(require('../component-index'));
var VectorConferenceHandler = require('../VectorConferenceHandler');
var UpdateChecker = require("./updater");
var q = require('q');
var request = require('browser-request');

import UAParser from 'ua-parser-js';
import url from 'url';

import {parseQs, parseQsFromFragment} from './url_utils';

var lastLocationHashSet = null;

var CallHandler = require("matrix-react-sdk/lib/CallHandler");
CallHandler.setConferenceHandler(VectorConferenceHandler);

function checkBrowserFeatures(featureList) {
    if (!window.Modernizr) {
        console.error("Cannot check features - Modernizr global is missing.");
        return false;
    }
    var featureComplete = true;
    for (var i = 0; i < featureList.length; i++) {
        if (window.Modernizr[featureList[i]] === undefined) {
            console.error(
                "Looked for feature '%s' but Modernizr has no results for this. " +
                "Has it been configured correctly?", featureList[i]
            );
            return false;
        }
        if (window.Modernizr[featureList[i]] === false) {
            console.error("Browser missing feature: '%s'", featureList[i]);
            // toggle flag rather than return early so we log all missing features
            // rather than just the first.
            featureComplete = false;
        }
    }
    return featureComplete;
}

var validBrowser = checkBrowserFeatures([
    "displaytable", "flexbox", "es5object", "es5function", "localstorage",
    "objectfit"
]);

// Here, we do some crude URL analysis to allow
// deep-linking.
function routeUrl(location) {
    if (!window.matrixChat) return;

    console.log("Routing URL "+location);
    var fragparts = parseQsFromFragment(location);
    window.matrixChat.showScreen(fragparts.location.substring(1),
                                 fragparts.params);
}

function onHashChange(ev) {
    if (decodeURIComponent(window.location.hash) == lastLocationHashSet) {
        // we just set this: no need to route it!
        return;
    }
    routeUrl(window.location);
}

function onVersion(current, latest) {
    window.matrixChat.onVersion(current, latest);
}

var loaded = false;
var lastLoadedScreen = null;

// This will be called whenever the SDK changes screens,
// so a web page can update the URL bar appropriately.
var onNewScreen = function(screen) {
    console.log("newscreen "+screen);
    if (!loaded) {
        lastLoadedScreen = screen;
    } else {
        var hash = '#/' + screen;
        lastLocationHashSet = hash;
        window.location.hash = hash;
        if (ga) ga('send', 'pageview', window.location.pathname + window.location.search + window.location.hash);
    }
}

// We use this to work out what URL the SDK should
// pass through when registering to allow the user to
// click back to the client having registered.
// It's up to us to recognise if we're loaded with
// this URL and tell MatrixClient to resume registration.
var makeRegistrationUrl = function() {
    return window.location.protocol + '//' +
           window.location.host +
           window.location.pathname +
           '#/register';
}


function getDefaultDeviceDisplayName() {
    // strip query-string and fragment from uri
    let u = url.parse(window.location.href);
    u.search = "";
    u.hash = "";
    let app_name = u.format();

    let ua = new UAParser();
    return app_name + " via " + ua.getBrowser().name +
        " on " + ua.getOS().name;
}

window.addEventListener('hashchange', onHashChange);
window.onload = function() {
    console.log("window.onload");
    if (!validBrowser) {
        return;
    }
    UpdateChecker.setVersionListener(onVersion);
    UpdateChecker.run();
    routeUrl(window.location);
    loaded = true;
    if (lastLoadedScreen) {
        onNewScreen(lastLoadedScreen);
        lastLoadedScreen = null;
    }
}

function getConfig() {
    let deferred = q.defer();

    request(
        { method: "GET", url: "config.json", json: true },
        (err, response, body) => {
            if (err || response.status < 200 || response.status >= 300) {
                deferred.reject({err: err, response: response});
                return;
            }

            deferred.resolve(body);
        }
    );

    return deferred.promise;
}

function onLoadCompleted() {
    // if we did a token login, we're now left with the token, hs and is
    // url as query params in the url; a little nasty but let's redirect to
    // clear them.
    if (window.location.search) {
        var parsedUrl = url.parse(window.location.href);
        parsedUrl.search = "";
        var formatted = url.format(parsedUrl);
        console.log("Redirecting to " + formatted + " to drop loginToken " +
                    "from queryparams");
        window.location.href = formatted;
    }
}


async function loadApp() {
    const fragparts = parseQsFromFragment(window.location);
    const params = parseQs(window.location);

    // don't try to redirect to the native apps if we're
    // verifying a 3pid
    const preventRedirect = Boolean(fragparts.params.client_secret);

    if (!preventRedirect) {
        if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
            if (confirm("Riot is not supported on mobile web. Install the app?")) {
                window.location = "https://itunes.apple.com/us/app/vector.im/id1083446067";
                return;
            }
        }
        else if (/Android/.test(navigator.userAgent)) {
            if (confirm("Riot is not supported on mobile web. Install the app?")) {
                window.location = "https://play.google.com/store/apps/details?id=im.vector.alpha";
                return;
            }
        }
    }

    let configJson;
    let configError;
    try {
        configJson = await getConfig();
    } catch (e) {
        // On 404 errors, carry on without a config,
        // but on other errors, fail, otherwise it will
        // lead to subtle errors where the app runs with
        // the default config if it fails to fetch config.json.
        if (e.response.status != 404) {
            configError = e;
        }
    }

    console.log("Vector starting at "+window.location);
    if (configError) {
        window.matrixChat = ReactDOM.render(<div className="error">
            Unable to load config file: please refresh the page to try again.
        </div>, document.getElementById('matrixchat'));
    } else if (validBrowser) {
        var MatrixChat = sdk.getComponent('structures.MatrixChat');

        window.matrixChat = ReactDOM.render(
            <MatrixChat
                onNewScreen={onNewScreen}
                registrationUrl={makeRegistrationUrl()}
                ConferenceHandler={VectorConferenceHandler}
                config={configJson}
                realQueryParams={params}
                startingFragmentQueryParams={fragparts.params}
                enableGuest={true}
                onLoadCompleted={onLoadCompleted}
                defaultDeviceDisplayName={getDefaultDeviceDisplayName()}
            />,
            document.getElementById('matrixchat')
        );
    }
    else {
        console.error("Browser is missing required features.");
        // take to a different landing page to AWOOOOOGA at the user
        var CompatibilityPage = sdk.getComponent("structures.CompatibilityPage");
        window.matrixChat = ReactDOM.render(
            <CompatibilityPage onAccept={function() {
                validBrowser = true;
                console.log("User accepts the compatibility risks.");
                loadApp();
                window.onload(); // still do the same code paths for compatible clients
            }} />,
            document.getElementById('matrixchat')
        );
    }
}

loadApp();
