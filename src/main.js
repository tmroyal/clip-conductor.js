/* jshint -W056 */

var Server = require('./Server');
var SoundManager = require('./SoundManager'); 
var Scheduler = require('./Scheduler');
var LoopPool = require('./LoopPool');
var _ = require('lodash');

var ClipConductor = function(deps){
  if (!deps){ deps = {};}

  var audioContext = deps.AudioContext;
  if (!audioContext){ audioContext = new AudioContext(); }

  this.LoopPool = deps.LoopPool || LoopPool;
  
  this.server = new (deps.Server || Server)(); 

  this.soundManager = 
    new (deps.SoundManager || SoundManager)(audioContext, this.server);

  this.scheduler = 
    new (deps.Scheduler || Scheduler)(
          this.soundManager.playSound.bind(this.soundManager),
          this.soundManager.verify.bind(this.soundManager)
        );
  this.pools = {};
  this.getTime = function(){
    return audioContext.currentTime;
  }; 
};

ClipConductor.prototype.loadSound = function(soundInfo){
  return this.soundManager.loadFile(soundInfo)
  .catch(function(er){
    console.error(
      'ClipConductor.addSound: there was a problem loading ' +
      soundInfo.filename);
  });
};

ClipConductor.prototype.loadSounds = function(soundInfoArray){
  return Promise.all(
    soundInfoArray.map(function(soundInfo){
      return this.loadSound(soundInfo);
    }.bind(this))
  );
};

ClipConductor.prototype.on = function(msg, soundInfo){
  if (!this.soundManager.verify(soundInfo)){
    return this.loadSound(soundInfo)
    .then(function(){
      this.scheduler.on(msg, soundInfo);
    }.bind(this));
  } else {
    return Promise.resolve(this.scheduler.on(msg, soundInfo));
  }
};

ClipConductor.prototype.trigger = function(msg){
  this.scheduler.trigger(msg, 0);
};

ClipConductor.prototype.createPool = function(name){
  if (this.pools[name]){
    console.warn(
      'ClipConductor.createPool: pool "'+name+'" already exists'
    );
  } else {
    this.pools[name] = new this.LoopPool(
        name, 
        this.soundManager.verify.bind(this.soundManager),
        this.soundManager.playSound.bind(this.soundManager),
        this.getTime.bind(this)
    );
  }

  return this.pools[name];
};

ClipConductor.prototype.pool = function(name){
  return this.pools[name];
};

ClipConductor.prototype.triggerPool = function(name, value){
  if (!_.isNumber(value) || _.isNaN(value)){
    throw new Error(
      'ClipConductor.triggerPool: must be called with numeric value'
    );
  }

  var pool = this.pools[name]; 
  if (pool){
    pool.set(value);
    return pool;
  } else {
    console.warn('ClipConductor.triggerPool: no pool named '+name);
  }
};

window.ClipConductor = module.exports = ClipConductor;
