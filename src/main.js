/* jshint -W056 */

var Server = require('./Server');
var SoundManager = require('./SoundManager'); 
var Scheduler = require('./Scheduler');
var LoopPool = require('./LoopPool');
var _ = require('lodash');

/**
 * Adaptive audio library for the web audio api
 *
 * @class
 * @param {object} [deps] Dependencies - useful if you wish to prive 
 *        alternative versions of the dependencies (i.e. an IE compatible web audio library)
 * @param {object} [deps.audioContext] - an object that responds to the same methods as an
 *        instansiated AudioContext()
 * @param {object} [deps.LoopPool] - an object that behaves as a LoopPool class
 * @param {object} [deps.Server] - an object that behaves as a server class
 * @param {object} [deps.SoundManager] - an object that behaves as a sound manager class
 * @param {object} [deps.Scheduler] - an object that behaves as a scheduler class
 */

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
  // collection of instansiated sound pools
  // @type object<string, LoopPool>
  this.pools = {};
  
  // method that gets currentTime from audioContext
  this.getTime = function(){
    return audioContext.currentTime;
  }; 
};

/**
 * Load and store a sound from the server 
 * @method loadSound
 * @param {SoundManagerSoundInfo} soundInfo info for the sound to load
 * @returns {Promise} resolves on success, rejects on error
 */
ClipConductor.prototype.loadSound = function(soundInfo){
  return this.soundManager.loadFile(soundInfo)
  .catch(function(er){
    console.error(
      'ClipConductor.addSound: there was a problem loading ' +
      soundInfo.filename);
  });
};

/**
 * Load and store a set of sounds from the server
 * @method loadSounds
 * @param {SoundManagerSoundInfo[]} soundInfoArray array of info to load sounds
 * @returns {Promise} resolves on success, rejects on error
 */
ClipConductor.prototype.loadSounds = function(soundInfoArray){
  return Promise.all(
    soundInfoArray.map(function(soundInfo){
      return this.loadSound(soundInfo);
    }.bind(this))
  );
};

/**
 * Attaches a sound to a message, and loads the sound if it hasn't been loaded already
 * @method on
 * @param {string} msg the message to associate with the sound
 * @param {SoundManagerSoundInfo} soundInfo the sound to associate and optionally load
 * @returns {Promise} resolves when sound loads (or immediately if already loaded), reject on error
 */
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

/**
 * trigger sound that has already been associated using the on method
 * @method trigger
 * @param {string} msg - the message associated with the desired sound
 */
ClipConductor.prototype.trigger = function(msg){
  this.scheduler.trigger(msg, 0);
};

/**
 * Creates a LoopPool of the given name
 * @method createPool
 * @param {string} name - name of the pool
 * @returns {LoopPool} the newly created LoopPool
 */
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

/**
 * get a reference to a pool, if it exists
 * @method pool
 * @param {string} name the name of the pool to retrieve
 * @returns {LoopPool} the loop pool
 */
ClipConductor.prototype.pool = function(name){
  return this.pools[name];
};

/**
 * Set the value of a LoopPool
 * @method triggerPool
 * @param {string} name the name of the pool
 * @param {number} value the value to set the pool
 * @returns {LoopPool} returns the loop pool whose value has been set
 */
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
