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

var React = require('react');
var sdk = require('matrix-react-sdk')
var dis = require('matrix-react-sdk/lib/dispatcher');
var rate_limited_func = require('matrix-react-sdk/lib/ratelimitedfunc');

module.exports = React.createClass({
    displayName: 'SearchBox',

    propTypes: {
        collapsed: React.PropTypes.bool,
        onSearch: React.PropTypes.func,
    },

    onChange: new rate_limited_func(
        function() {
            if (this.refs.search) {
                this.props.onSearch(this.refs.search.value);
            }
        },
        100
    ),

    onToggleCollapse: function(show) {
        if (show) {
            dis.dispatch({
                action: 'show_left_panel',
            });
        }
        else {
            dis.dispatch({
                action: 'hide_left_panel',
            });
        }
    },

    render: function() {
        var TintableSvg = sdk.getComponent('elements.TintableSvg');

        var toggleCollapse;
        if (this.props.collapsed) {
            toggleCollapse =
                <div className="mx_SearchBox_maximise" onClick={ this.onToggleCollapse.bind(this, true) }>
                    <TintableSvg src="img/maximise.svg" width="10" height="16" alt="&lt;"/>
                </div>
        }
        else {
            toggleCollapse =
                <div className="mx_SearchBox_minimise" onClick={ this.onToggleCollapse.bind(this, false) }>
                    <TintableSvg src="img/minimise.svg" width="10" height="16" alt="&lt;"/>
                </div>
        }

        var searchControls;
        if (!this.props.collapsed) {
            searchControls = [
                    <TintableSvg
                        key="button"
                        className="mx_SearchBox_searchButton"
                        src="img/search.svg" width="21" height="19"
                    />,
                    <input
                        key="searchfield"
                        type="text"
                        ref="search"
                        className="mx_SearchBox_search"
                        onChange={ this.onChange }
                        placeholder="Search room names"
                    />
                ];
        }

        var self = this;
        return (
            <div className="mx_SearchBox">
                { searchControls }
                { toggleCollapse }
            </div>
        );
    }
});
