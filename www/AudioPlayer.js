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

var argscheck = require('cordova/argscheck'),
    utils = require('cordova/utils'),
    exec = require('cordova/exec');

var mediaObjects = {};

/**
 * This class provides access to the device media, interfaces to both sound and video
 *
 * @constructor
 * @param src                   The file name or url to play
 * @param successCallback       The callback to be called when the file is done playing or recording.
 *                                  successCallback()
 * @param errorCallback         The callback to be called if there is an error.
 *                                  errorCallback(int errorCode) - OPTIONAL
 * @param statusCallback        The callback to be called when media status has changed.
 *                                  statusCallback(int statusCode) - OPTIONAL
 */
var AudioPlayer = function(src, successCallback, errorCallback, statusCallback) {
    argscheck.checkArgs('sFFF', 'Media', arguments);
    this.id = utils.createUUID();
    mediaObjects[this.id] = this;
    this.src = src;
    this.successCallback = successCallback;
    this.errorCallback = errorCallback;
    this.statusCallback = statusCallback;
    this._duration = -1;
    this._position = -1;
    exec(null, this.errorCallback, "AudioPlayer", "create", [this.id, this.src]);
};

// Media messages
AudioPlayer.MEDIA_STATE = 1;
AudioPlayer.MEDIA_DURATION = 2;
AudioPlayer.MEDIA_POSITION = 3;
AudioPlayer.MEDIA_ERROR = 9;

// Media states
AudioPlayer.MEDIA_NONE = 0;
AudioPlayer.MEDIA_STARTING = 1;
AudioPlayer.MEDIA_RUNNING = 2;
AudioPlayer.MEDIA_PAUSED = 3;
AudioPlayer.MEDIA_STOPPED = 4;
AudioPlayer.MEDIA_MSG = ["None", "Starting", "Running", "Paused", "Stopped"];

// "static" function to return existing objs.
AudioPlayer.get = function(id) {
    return mediaObjects[id];
};

/**
 * Start or resume playing audio file.
 */
AudioPlayer.prototype.play = function(options) {
    exec(null, null, "AudioPlayer", "startPlayingAudio", [this.id, this.src, options]);
};

/**
 * Stop playing audio file.
 */
AudioPlayer.prototype.stop = function() {
    var me = this;
    exec(function() {
        me._position = 0;
    }, this.errorCallback, "AudioPlayer", "stopPlayingAudio", [this.id]);
};

/**
 * Seek or jump to a new time in the track..
 */
AudioPlayer.prototype.seekTo = function(milliseconds) {
    var me = this;
    exec(function(p) {
        me._position = p;
    }, this.errorCallback, "AudioPlayer", "seekToAudio", [this.id, milliseconds]);
};

/**
 * Pause playing audio file.
 */
AudioPlayer.prototype.pause = function() {
    exec(null, this.errorCallback, "AudioPlayer", "pausePlayingAudio", [this.id]);
};

/**
 * Get duration of an audio file.
 * The duration is only set for audio that is playing, paused or stopped.
 *
 * @return      duration or -1 if not known.
 */
AudioPlayer.prototype.getDuration = function() {
    return this._duration;
};

/**
 * Get position of audio.
 */
AudioPlayer.prototype.getCurrentPosition = function(success, fail) {
    var me = this;
    exec(function(p) {
        me._position = p;
        success(p);
    }, fail, "AudioPlayer", "getCurrentPositionAudio", [this.id]);
};

/**
 * Release the resources.
 */
AudioPlayer.prototype.release = function() {
    exec(null, this.errorCallback, "AudioPlayer", "release", [this.id]);
};

/**
 * Adjust the volume.
 */
AudioPlayer.prototype.setVolume = function(volume) {
    exec(null, null, "AudioPlayer", "setVolume", [this.id, volume]);
};

/**
 * Adjust the playback rate.
 */
AudioPlayer.prototype.setRate = function(rate) {
    if (cordova.platformId === 'ios'){
        exec(null, null, "AudioPlayer", "setRate", [this.id, rate]);
    } else {
        console.warn('AudioPlayer.setRate method is currently not supported for', cordova.platformId, 'platform.');
    }
};

/**
 * Get amplitude of audio.
 */
AudioPlayer.prototype.getCurrentAmplitude = function(success, fail) {
    exec(function(p) {
        success(p);
    }, fail, "AudioPlayer", "getCurrentAmplitudeAudio", [this.id]);
};

/**
 * Audio has status update.
 * PRIVATE
 *
 * @param id            The media object id (string)
 * @param msgType       The 'type' of update this is
 * @param value         Use of value is determined by the msgType
 */
AudioPlayer.onStatus = function(id, msgType, value) {

    var media = mediaObjects[id];

    if (media) {
        switch(msgType) {
            case AudioPlayer.MEDIA_STATE :
                if (media.statusCallback) {
                    media.statusCallback(value);
                }
                if (value == AudioPlayer.MEDIA_STOPPED) {
                    if (media.successCallback) {
                        media.successCallback();
                    }
                }
                break;
            case AudioPlayer.MEDIA_DURATION :
                media._duration = value;
                break;
            case AudioPlayer.MEDIA_ERROR :
                if (media.errorCallback) {
                    media.errorCallback(value);
                }
                break;
            case AudioPlayer.MEDIA_POSITION :
                media._position = Number(value);
                break;
            default :
                if (console.error) {
                    console.error("Unhandled AudioPlayer.onStatus :: " + msgType);
                }
                break;
        }
    } else if (console.error) {
        console.error("Received AudioPlayer.onStatus callback for unknown media :: " + id);
    }

};

module.exports = AudioPlayer;

function onMessageFromNative(msg) {
    if (msg.action == 'status') {
        AudioPlayer.onStatus(msg.status.id, msg.status.msgType, msg.status.value);
    } else {
        throw new Error('Unknown media action' + msg.action);
    }
}

if (cordova.platformId === 'android' || cordova.platformId === 'amazon-fireos' || cordova.platformId === 'windowsphone') {

    var channel = require('cordova/channel');

    channel.createSticky('onMediaPluginReady');
    channel.waitForInitialization('onMediaPluginReady');

    channel.onCordovaReady.subscribe(function() {
        exec(onMessageFromNative, undefined, 'Media', 'messageChannel', []);
        channel.initializationComplete('onMediaPluginReady');
    });
}
