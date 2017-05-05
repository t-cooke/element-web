/*
Copyright 2017 Vector Creations Ltd

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

import React from 'react';
import sdk from 'matrix-react-sdk';
import Modal from 'matrix-react-sdk/lib/Modal';

export default React.createClass({
    onUpdateClicked: function() {
        // TODO: Implement dialog to set password
        // const SetPasswordDialog = sdk.getComponent('dialogs.SetPasswordDialog');
        // Modal.createDialog(SetPasswordDialog, {
        //     onFinished: () => {
        //     }
        // });
    },

    render: function() {
        const AccessibleButton = sdk.getComponent('elements.AccessibleButton');
        return (
            <div className="mx_MatrixToolbar">
                <img className="mx_MatrixToolbar_warning" src="img/warning.svg" width="24" height="23" alt="/!\"/>
                <div className="mx_MatrixToolbar_content">
                    To be able to return to your account, you need to set a password.
                </div>
                <button className="mx_MatrixToolbar_action" onClick={this.onUpdateClicked}>
                    Set Password
                </button>
            </div>
        );
    }
});
