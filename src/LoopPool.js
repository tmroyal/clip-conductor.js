var _ = require('lodash');
var BUFFER = 0.1, MIN_DURATION = 0.01;

function LoopPool(name, verifyCB, triggerCB, timeCB){
  this.name = name;
  this.value = 0;

  this.getTime = timeCB;
  this.verify = verifyCB;
  this.trigger = triggerCB;
  
  this.events = {};
}

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

LoopPool.prototype.setSound = LoopPool.prototype.addSound;


LoopPool.prototype.removeSound = function(handle){
  if (_.isObject(handle)){ handle = handle.handle;}
  delete this.events[handle]; 
};

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

LoopPool.prototype.start = function(){
  this.playing = true;  
  this.playSound(this.getTime()+BUFFER);
};

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

LoopPool.prototype.stop = function(){
  this.playing = false;
};

LoopPool.prototype.set = function(value){
  this.value = value;
};

module.exports = LoopPool;
