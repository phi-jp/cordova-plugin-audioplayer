/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

/**
 * This class contains information about any Media errors.
*/
/*
 According to :: http://dev.w3.org/html5/spec-author-view/video.html#AudioPlayerError
 We should never be creating these objects, we should just implement the interface
 which has 1 property for an instance, 'code'

 instead of doing :
    errorCallbackFunction( new AudioPlayerError(3,'msg') );
we should simply use a literal :
    errorCallbackFunction( {'code':3} );
 */

 var _AudioPlayerError = window.AudioPlayerError;


if(!_AudioPlayerError) {
    window.AudioPlayerError = _AudioPlayerError = function(code, msg) {
        this.code = (typeof code != 'undefined') ? code : null;
        this.message = msg || ""; // message is NON-standard! do not use!
    };
}

_AudioPlayerError.MEDIA_ERR_NONE_ACTIVE    = _AudioPlayerError.MEDIA_ERR_NONE_ACTIVE    || 0;
_AudioPlayerError.MEDIA_ERR_ABORTED        = _AudioPlayerError.MEDIA_ERR_ABORTED        || 1;
_AudioPlayerError.MEDIA_ERR_NETWORK        = _AudioPlayerError.MEDIA_ERR_NETWORK        || 2;
_AudioPlayerError.MEDIA_ERR_DECODE         = _AudioPlayerError.MEDIA_ERR_DECODE         || 3;
_AudioPlayerError.MEDIA_ERR_NONE_SUPPORTED = _AudioPlayerError.MEDIA_ERR_NONE_SUPPORTED || 4;
// TODO: AudioPlayerError.MEDIA_ERR_NONE_SUPPORTED is legacy, the W3 spec now defines it as below.
// as defined by http://dev.w3.org/html5/spec-author-view/video.html#error-codes
_AudioPlayerError.MEDIA_ERR_SRC_NOT_SUPPORTED = _AudioPlayerError.MEDIA_ERR_SRC_NOT_SUPPORTED || 4;

module.exports = _AudioPlayerError;
