var Server = require('./Server');
var Player = require('./Player'); 
var Scheduler = require('./Scheduler');

var ClipConductor = function(){
  var server = Server.new();
  var scheduler = Scheduler.new();
  var player = Player.new( new AudioContext(), scheduler, server);

  var cond = {};

  cond.addSound = function(msg, soundInfo){
    return player.loadFile(soundInfo)
    .then(function(){
      scheduler.on(msg, soundInfo);
    }.bind(this))
    .catch(function(er){
      console.error('ClipConductor: there was a problem loading '+soundInfo.filename);
      console.error(er);
    });
  };

  cond.trigger = function(msg){
    this.scheduler.trigger(msg, 0);
  }

  return cond;
};

module.exports = ClipConductor;
