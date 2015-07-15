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
var ComponentBroker = require('../../../../src/ComponentBroker');

var LeftPanel = ComponentBroker.get('organisms/LeftPanel');
var RoomView = ComponentBroker.get('organisms/RoomView');
var RightPanel = ComponentBroker.get('organisms/RightPanel');
var VideoView = ComponentBroker.get('organisms/VideoView');
var Login = ComponentBroker.get('templates/Login');

var MatrixChatController = require("../../../../src/controllers/pages/MatrixChat");

// should be atomised
var Loader = require("react-loader");


module.exports = React.createClass({
    displayName: 'MatrixChat',
    mixins: [MatrixChatController],

    render: function() {
        if (this.state.logged_in && this.state.ready) {
            return (
                <div className="mx_MatrixChat">
                    <LeftPanel selectedRoom={this.state.currentRoom} />
                    <RoomView roomId={this.state.currentRoom} key={this.state.currentRoom} />
                    <VideoView />
                    <RightPanel roomId={this.state.currentRoom} />
                </div>
            );
        } else if (this.state.logged_in) {
            return (
                <Loader />
            );
        } else {
            return (
                <Login onLoggedIn={this.onLoggedIn} />
            );
        }
    }
});

