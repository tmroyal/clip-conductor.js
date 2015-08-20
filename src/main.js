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

ClipConductor.prototype.addSound = function(msg, soundInfo){
  return this.soundManager.loadFile(soundInfo)

  .then(function(){
    this.scheduler.on(msg, soundInfo);
  }.bind(this))

  .catch(function(er){
    console.error(
      'ClipConductor.addSound: there was a problem loading ' +
      soundInfo.filename);
  });
};

ClipConductor.prototype.trigger = function(msg){
  this.scheduler.trigger(msg, 0);
};

ClipConductor.prototype.createPool = function(name){
  this.pools[name] = new this.LoopPool(
      name, 
      this.soundManager.verify.bind(this.soundManager),
      this.soundManager.playSound.bind(this.soundManager),
      this.getTime.bind(this)
  );

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

module.exports = ClipConductor;
