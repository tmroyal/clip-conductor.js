var Server = require('./Server');
var SoundManager = require('./SoundManager'); 
var Scheduler = require('./Scheduler');

var ClipConductor = function(deps){
  var audioContext = deps.AudioContext;
  if (!audioContext){ audioContext = new AudioContext(); }
  
  this.server = new (deps.Server || Server)(); 

  this.soundManager = 
    new (deps.SoundManger || SoundManger)(audioContext, server);

  this.scheduler = 
    new (deps.Scheduler || Scheduler)(this.soundManager);
};

ClipConductor.prototype.addSound = function(msg, soundInfo){
  return player.loadFile(soundInfo)
  .then(function(){
    scheduler.on(msg, soundInfo);
  }.bind(this))
  .catch(function(er){
    console.error(
      'ClipConductor: there was a problem loading '
      +soundInfo.filename);
    console.error(er);
  });
};

ClipConductor.prototype.trigger = function(msg){
  this.scheduler.trigger(msg, 0);
};

ClipConductor.prototype.addPool = function(name){

};

ClipConductor.prototype.pool = function(name){

};

module.exports = ClipConductor;
