var _ = require('lodash');

var SoundManager = function(audioContext, server){
  this.server = server;
  this.sounds = {};
  this.audioContext = audioContext;
};

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

SoundManager.prototype.verify = function(handle){
  return this.sounds.hasOwnProperty(handle); 
};

module.exports = SoundManager;
