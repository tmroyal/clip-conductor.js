var Server = require('./Server');
var Player = require('./Player'); 
var Scheduler = require('./Scheduler');

var ClipConductor = {
  new: function(){
    var cond = Object.create(this);
    cond.audioContext = new AudioContext();
    cond.server = Server.new();
    cond.scheduler = Scheduler.new();
    cond.player = Player.new(
      cond.server,
      cond.scheduler,
      cond.server
    );
    
    return cond; 
  },

  addSound: function(msg, soundInfo){
    return this.player.loadFile(soundInfo)
    .then(function(){
      this.scheduler.on(msg, soundInfo);
    }.bind(this))
    .catch(function(er){
      console.error('ClipConductor: there was a problem loading '+soundInfo.filename);
      console.error(er);
    });
  },

  trigger: function(msg){
    this.scheduler.trigger(msg, 0);
  }
};

module.exports = ClipConductor;
