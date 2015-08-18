var Scheduler = require('./Scheduler');
var _ = require('lodash');
var PADDING = 0.9, BUFFER = 0.1, MIN_DURATION = 0.01;

var LoopPool = Object.create(Scheduler);

LoopPool.new = function(name, audioContext){
  var lp = Scheduler.new.call(this);

  lp.name = name;
  lp.value = 0;
  lp.audioContext = audioContext;

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

LoopPool.start = function(){
  this.playing = true;  
  this.playSound(this.audioContext.currentTime+BUFFER);
};

LoopPool.playSound = function(currentTime){
  if (this.playing && 
      Object.keys(this.recognizedEvents).length > 0){
    var currentSound = this.getSound(this.value);
    var duration = 
        this.subscriptions[0](currentSound, currentTime);
    if (duration < MIN_DURATION){ duration = MIN_DURATION; }
    // TODO bounds and type checking on duration
    var nextTime = currentTime+duration;
    var timeout = duration*PADDING*1000;
    setTimeout(this.playSound.bind(this, nextTime), timeout);
  }
};

LoopPool.stop = function(){
  this.playing = false;
};

LoopPool.set = function(value){
  this.value = value;
};

module.exports = LoopPool;
