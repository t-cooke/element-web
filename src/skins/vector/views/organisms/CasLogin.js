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

var React = require('react');

var MatrixClientPeg = require('matrix-react-sdk/lib/MatrixClientPeg');

var CasLoginController = require('matrix-react-sdk/lib/controllers/organisms/CasLogin');

module.exports = React.createClass({
    displayName: 'CasLogin',
    mixins: [CasLoginController],

    render: function() {
        return (
            <div>
                <button onClick={this.onCasClicked}>Sign in with CAS</button>
            </div>
        );
    }
    
});
