var Scheduler = require('./Scheduler');
var _ = require('lodash');

var LoopPool = Object.create(Scheduler);

LoopPool.new = function(name){
  var lp = Scheduler.new.call(this);
  lp.name = name;
  return lp;
};

LoopPool.addSound = function(sound, range){
  this.recognizedEvents[sound.handle] = {
    sound: sound, 
    range: range
  };
};

LoopPool.setSound = LoopPool.addSound;

LoopPool.removeSound = function(sound){
  delete this.recognizedEvents[sound.handle]; 
};

LoopPool.getSound = function(value){
  var closestEvent, closestDistance = Infinity;
  var matchingEvents = [];

  if (_.isEmpty(this.recognizedEvents)) { return; }

  for (sound in this.recognizedEvents){
    if (this.recognizedEvents.hasOwnProperty(sound)){
      var recEvent = this.recognizedEvents[sound];
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

module.exports = LoopPool;
