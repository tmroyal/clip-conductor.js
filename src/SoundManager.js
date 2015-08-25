var _ = require('lodash');

/**
 * Loads, stores, and plays sounds
 * @class
 *
 * @param {AudioContext} audioContext a web audio instance, or an
 *        object with an identical interface.
 * @param {Server} server an instance of a Server, or an object
 *        with an identical interface
 */

/**
 * The sound that is stored
 * @typedef SoundManagerSound
 * @type {Object}
 * @property {SoundManagerSoundInfo} info - information about the
 * @property {AudioBuffer} buffer
 */

/** 
 * @typedef SoundManagerSoundInfo
 * @type {Object}
 * @param {String} filename - the path of the sound
 * @param {String} handle - the handle, or name, of the sound
 * @param {Number} [duration] - optional duration of the sound
 */ 

var SoundManager = function(audioContext, server){
  this.server = server;
  /**
   * Collection of SoundManagerSound's, with each key being identical to the sound handle
   * @type Object<string, SoundManagerSound>
   */
  this.sounds = {};
  this.audioContext = audioContext;
};

/*
 * Play the sound at the specified time if it exists
 * Warn if given sound does not exist
 * @method playSound
 *
 * @param {String|SoundManagerSoundInfo} handle the handle or sound
 *        info for the sound. Only the handle needs to match the sound 
 *        loaded by loadSound
 * @param {number} time the time that the sound needs to be played, which
 *        behaves identically to the WebAudio API.
 *
 * @returns {number} the duration in seconds of the sound as defined either by SoundManagerSoundInfo
 *          provided, or the duration of the AudioBuffer
 */
SoundManager.prototype.playSound = function(handle, time){
  if (_.isObject(handle)){ handle = handle.handle; }

  if (this.sounds[handle]){
    var sound = this.audioContext.createBufferSource();

    sound.buffer = this.sounds[handle].buffer;
    sound.connect(this.audioContext.destination);
    sound.start(time || 0);

    return this.sounds[handle].info.duration || sound.buffer.duration;
  } else {
    console.warn(
      'ClipConductor.SoundManager: cannot find sound: '+ handle
    );
  }
};

/**
 * load the sound file
 * @method
 *
 * @param {SoundManagerSoundInfo} sound info for file to be loaded
 * @param {Function} [done] Optional callback, called with no params, when file is loaded
 * @param {Function} [error] Optional callback, called with error, if one occurs.
 *
 * @returns {Promise} resolves on success, rejects on error
 */
SoundManager.prototype.loadFile = function(fileInfo, done, error){
  if (!fileInfo.handle || !fileInfo.filename){
    throw new Error(
      'ClipConductor.SoundManager.loadFile: no'+
      ' valid file info provided'
    );
  }

  return this.server.loadFile(fileInfo.filename)

  .then(function(data){

    return new Promise(function(resolve, reject){
      this.audioContext.decodeAudioData(data, resolve, reject); 
    }.bind(this))

    .then(function(buffer){

      this.sounds[fileInfo.handle] = {
        buffer: buffer,
        info: fileInfo
      };

      if (done){ done(); }

    }.bind(this))

    .catch(error);

  }.bind(this))

  .catch(error);
};

/**
 * Determines whether or not a sound has been loaded.
 * @method
 *
 * @param {String} handle - the handle of the file
 * 
 * @returns {boolean} whether sound associated with given handle is loaded
 */

SoundManager.prototype.verify = function(handle){
  return this.sounds.hasOwnProperty(handle); 
};

module.exports = SoundManager;
