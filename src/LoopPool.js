var _ = require('lodash');
var BUFFER = 0.1, MIN_DURATION = 0.01;

/**
 * A collection of itmes that are triggered randomly, one after the other,
 * according to their duration. Items are triggered if their range 
 * encompases the current value of the pool, unless no item has
 * a range that encompasses the value, in which case the item whose range
 * is nearest the current value is triggered.
 * @class
 *
 * @param {string} name the name of the pool
 * @param {verifyCB} verifyCB optional callback used to determine whether 
 *        a sound should be added to the pool
 * @param {triggerCB} triggerCB callback that triggers the item
 * @param {timeCB} timeCB callback that should return the time since the beginning
 *        in the manner of AudioContext.getTime() 
 */

/**
 * The range at which an item is triggered
 * @typedef {object} LoopPoolRange
 * @property {number} min minimum value at which item can be triggered
 * @property {number} max maximum value at which item can be triggered
 */

/**
 * Object representing the association between a sound and a range
 * @typedef LoopPoolEvent
 * @property {string} sound - the handle of the sound
 * @property {LoopPoolRange} range - the range of the sound
 */

function LoopPool(name, verifyCB, triggerCB, timeCB){
  this.name = name;
  // Value of the pool, which is used to determine which items to play
  // @type number 
  this.value = 0;

  this.getTime = timeCB;
  this.verify = verifyCB || function(){ return true; };
  this.trigger = triggerCB;

  // whether the loopPool is playing
  // @type boolean
  this.playing = false;
  
  this.events = {};
}

/**
 * Creates an association between a sound and a range
 *
 * @method addSound
 * @param {string} handle - handle of the sound
 * @param {LoopPoolRange} range - range of the sound
 */
LoopPool.prototype.addSound = function(handle, range){
  if (_.isObject(handle)){ handle = handle.handle; }

  if (!this.verify(handle)){
    throw new Error(
      'ClipConductor.LoopPool: cannot verify handle: '+handle
    );
  }
  this.events[handle] = {
    sound: handle, 
    range: range
  };
};

/**
 * @alias addSound
 */
LoopPool.prototype.setSound = LoopPool.prototype.addSound;


/**
 * remove item from LoopPool
 * @method removeSound
 * @param {string} handle - the name of the item to remove
 */
LoopPool.prototype.removeSound = function(handle){
  if (_.isObject(handle)){ handle = handle.handle;}
  delete this.events[handle]; 
};

/**
 * choose random item from collection of LoopPoolEvents
 * whose range encompasses given value. If no items
 * encomass range, return item nearest the range.
 * @method getSound
 * @param {number} value - given value
 * @returns {LoopPoolEvent|undefined} matching item, or undefined if there are no items
 */
LoopPool.prototype.getSound = function(value){
  var closestEvent, closestDistance = Infinity;
  var matchingEvents = [];

  if (_.isEmpty(this.events)) { return; }

  for (var sound in this.events){
    if (this.events.hasOwnProperty(sound)){
      var recEvent = this.events[sound];
      var range = recEvent.range;

      if( value >= range.min && value <= range.max){
        matchingEvents.push(recEvent);
      }

      if (_.isEmpty(this.matchingEvents)){
        var currentDistance = Math.min(
            Math.abs(value-range.min), 
            Math.abs(value-range.max)
        );

        if (currentDistance < closestDistance){
          closestEvent = recEvent;
          closestDistance = currentDistance;
        }
      }
    }
  }
  if (matchingEvents.length > 0){
    var ind = Math.floor(Math.random()*matchingEvents.length);
    return matchingEvents[ind].sound;
  } else {
    return closestEvent.sound;
  }
};

/**
 * starts the LoopPool
 * @method start
 */
LoopPool.prototype.start = function(){
  if (!this.playing){
    this.playing = true;  
    this.playSound(this.getTime()+BUFFER);
  }
};

/**
 * if this.playing, and there are sounds to play, plays a sound
 * at time provided in parameter. The function sets a timeout
 * that calls playSound after ther duration of the current sound.
 * @method playSound
 * @param {number} currentTime
 */
LoopPool.prototype.playSound = function(currentTime){
  if (this.playing && 
      Object.keys(this.events).length > 0){
    var currentSound = this.getSound(this.value);

    var duration = this.trigger(currentSound, currentTime);
    if (duration < MIN_DURATION){ duration = MIN_DURATION; }
    if (!_.isNumber(duration) || _.isNaN(duration)){
      throw new Error(
          'ClipConductor.LoopPool: duration must be a number');
    }

    var nextTime = currentTime+duration;
    var timeout = duration*1000;

    setTimeout(this.playSound.bind(this, nextTime), timeout);
  }
};

/**
 * Stop initiating new events.
 * @method stop
 */
LoopPool.prototype.stop = function(){
  this.playing = false;
};

/**
 * Set the loopPool value
 * @method set
 * @param {number} value the value to set
 */
LoopPool.prototype.set = function(value){
  this.value = value;
};

module.exports = LoopPool;
