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
var filesize = require('filesize');

var MatrixClientPeg = require('matrix-react-sdk/lib/MatrixClientPeg');
var Modal = require('matrix-react-sdk/lib/Modal');
var sdk = require('matrix-react-sdk')

module.exports = React.createClass({
    displayName: 'MVideoTile',

    thumbScale: function(fullWidth, fullHeight, thumbWidth, thumbHeight) {
        if (!fullWidth || !fullHeight) {
            // Cannot calculate thumbnail height for image: missing w/h in metadata. We can't even
            // log this because it's spammy
            return undefined;
        }
        if (fullWidth < thumbWidth && fullHeight < thumbHeight) {
            // no scaling needs to be applied
            return fullHeight;
        }
        var widthMulti = thumbWidth / fullWidth;
        var heightMulti = thumbHeight / fullHeight;
        if (widthMulti < heightMulti) {
            // width is the dominant dimension so scaling will be fixed on that
            return widthMulti;
        }
        else {
            // height is the dominant dimension so scaling will be fixed on that
            return heightMulti;
        }
    },

    render: function() {
        var content = this.props.mxEvent.getContent();
        var cli = MatrixClientPeg.get();

        var videoStyle = {
            maxHeight: "500px",
            maxWidth: "100%",
        };

        var height = null;
        var width = null;
        var poster = null;
        var preload = "metadata";
        if (content.info) {
            var scale = this.thumbScale(content.info.w, content.info.h, 480, 360);
            if (scale) {
                width = Math.floor(content.info.w * scale);
                height = Math.floor(content.info.h * scale);
            }

            if (content.info.thumbnail_url) {
                poster = cli.mxcUrlToHttp(content.info.thumbnail_url);
                preload = "none";
            }
        }

        

        return (
            <span className="mx_MVideoTile">
                <video className="mx_MVideoTile" src={cli.mxcUrlToHttp(content.url)} alt={content.body}
                    controls preload={preload} autoplay="false" loop
                    height={height} width={width} poster={poster}>
                </video>
            </span>
        );
    },
});
