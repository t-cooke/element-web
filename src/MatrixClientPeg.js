/*
Copyright 2015 OpenMarket Ltd

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

// A thing that holds your Matrix Client
var Matrix = require("matrix-js-sdk");

var matrixClient = null;

var localStorage = window.localStorage;
if (localStorage) {
    var hs_url = localStorage.getItem("mx_hs_url");
    var access_token = localStorage.getItem("mx_access_token");
    var user_id = localStorage.getItem("mx_user_id");
    if (access_token && user_id && hs_url) {
        matrixClient = Matrix.createClient({
            baseUrl: hs_url,
            accessToken: access_token,
            userId: user_id
        });
    }
}

module.exports = {
    get: function() {
        return matrixClient;
    },

    replace: function(cli) {
        matrixClient = cli;
    },

    replaceUsingUrl: function(hs_url) {
        matrixClient = Matrix.createClient(hs_url);
    }
};

