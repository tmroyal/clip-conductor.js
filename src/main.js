var Server = require('./Server');
var Player = require('./Player'); 
var Scheduler = require('./Scheduler');

var ClipConductor = {
  new: function(provServer, provScheduler, provPlayer, provAudio){

    var server = (provServer ? provServer : Server).new();
    var scheduler = (provScheduler ? provScheduler : Scheduler).new();
    var audioContext = provAudio ? provAudio : AudioContext; 
    var player = (provPlayer ? provPlayer : Player).new( 
        new audioContext(), scheduler, server);

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
    };

    cond.addPool = function(name){

    }

    cond.pool = function(name){

    }

    return cond;
  }
};

module.exports = ClipConductor;
