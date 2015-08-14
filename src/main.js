var Server = require('./Server');
var Player = require('./Player'); 
var Scheduler = require('./Scheduler');

function ClipConductor(){
  this.audioContext = new AudioContext();
  this.server = new Server();
  this.scheduler = new Scheduler();
  this.player = new Player(this.audioContext, this.scheduler, this.server);
} 

ClipConductor.prototype.addSound = function(msg, soundInfo){
  return this.player.loadFile(soundInfo)
  .then(function(){
    this.scheduler.on(msg, soundInfo);
  }.bind(this))
  .catch(function(er){
    console.error('ClipConductor: there was a problem loading '+soundInfo.filename);
    console.error(er);
  });
};

ClipConductor.prototype.trigger = function(msg){
  this.scheduler.trigger(msg, 0);
};

module.exports = ClipConductor;
