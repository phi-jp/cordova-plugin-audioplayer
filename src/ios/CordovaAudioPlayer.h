/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

#import <Foundation/Foundation.h>
#import <AudioToolbox/AudioServices.h>
#import <AVFoundation/AVFoundation.h>

#import <Cordova/CDVPlugin.h>

enum CDVAudioPlayerError {
    MEDIA_ERR_NONE_ACTIVE = 0,
    MEDIA_ERR_ABORTED = 1,
    MEDIA_ERR_NETWORK = 2,
    MEDIA_ERR_DECODE = 3,
    MEDIA_ERR_NONE_SUPPORTED = 4
};
typedef NSUInteger CDVAudioPlayerError;

enum CDVAudioPlayerStates {
    MEDIA_NONE = 0,
    MEDIA_STARTING = 1,
    MEDIA_RUNNING = 2,
    MEDIA_PAUSED = 3,
    MEDIA_STOPPED = 4
};
typedef NSUInteger CDVAudioPlayerStates;

enum CDVAudioPlayerMsg {
    MEDIA_STATE = 1,
    MEDIA_DURATION = 2,
    MEDIA_POSITION = 3,
    MEDIA_ERROR = 9
};
typedef NSUInteger CDVAudioPlayerMsg;

@interface CDVAudioPlayerWithMediaId : AVAudioPlayer
{
    NSString* mediaId;
}
@property (nonatomic, copy) NSString* mediaId;
@end


@interface CDVAudioPlayerFile : NSObject
{
    NSString* resourcePath;
    NSURL* resourceURL;
    CDVAudioPlayerWithMediaId* player;
    NSNumber* volume;
    NSNumber* rate;
}

@property (nonatomic, strong) NSString* resourcePath;
@property (nonatomic, strong) NSURL* resourceURL;
@property (nonatomic, strong) CDVAudioPlayerWithMediaId* player;
@property (nonatomic, strong) NSNumber* volume;
@property (nonatomic, strong) NSNumber* rate;

@end

@interface CordovaAudioPlayer : CDVPlugin <AVAudioPlayerDelegate, AVAudioRecorderDelegate>
{
    NSMutableDictionary* soundCache;
    NSString* currMediaId;
    AVAudioSession* avSession;
    AVPlayer* avPlayer;
    NSString* statusCallbackId;
}
@property (nonatomic, strong) NSMutableDictionary* soundCache;
@property (nonatomic, strong) AVAudioSession* avSession;
@property (nonatomic, strong) NSString* currMediaId;
@property (nonatomic, strong) NSString* statusCallbackId;

- (void)startPlayingAudio:(CDVInvokedUrlCommand*)command;
- (void)pausePlayingAudio:(CDVInvokedUrlCommand*)command;
- (void)stopPlayingAudio:(CDVInvokedUrlCommand*)command;
- (void)seekToAudio:(CDVInvokedUrlCommand*)command;
- (void)release:(CDVInvokedUrlCommand*)command;
- (void)getCurrentPositionAudio:(CDVInvokedUrlCommand*)command;

- (BOOL)hasAudioSession;

// helper methods
- (NSURL*)urlForRecording:(NSString*)resourcePath;
- (NSURL*)urlForPlaying:(NSString*)resourcePath;

- (CDVAudioPlayerFile*)audioFileForResource:(NSString*)resourcePath withId:(NSString*)mediaId doValidation:(BOOL)bValidate forRecording:(BOOL)bRecord;
- (CDVAudioPlayerFile*)audioFileForResource:(NSString*)resourcePath withId:(NSString*)mediaId doValidation:(BOOL)bValidate forRecording:(BOOL)bRecord suppressValidationErrors:(BOOL)bSuppress;
- (BOOL)prepareToPlay:(CDVAudioPlayerFile*)audioFile withId:(NSString*)mediaId;
- (NSDictionary*)createMediaErrorWithCode:(CDVAudioPlayerError)code message:(NSString*)message;

- (void)setVolume:(CDVInvokedUrlCommand*)command;
- (void)setRate:(CDVInvokedUrlCommand*)command;

@end