
function ClipConductor(dependencies){
  Server = dependencies.Server || require('./Server');
  Player = dependencies.Player || require('./Player');
  Scheduler = dependencies.Scheduler || require('./Scheduler');
  AudioContext = dependencies.AudioContext || AudioContext;

  this.audioContext = new AudioContext();
  this.server = new Server();
  this.scheduler = new Scheduler();
  this.player = new Player(audioContext, scheduler, server);
} 

ClipConductor.prototype.addSound = function(msg, soundInfo){
  return this.player.loadFile(soundInfo)
  .then(function(){
    this.scheduler.on(msg, soundInfo);
  })
  .catch(function(){
    console.error('ClipConductor: there was a problem loading '+soundInfo.filename);
  });
};

ClipConductor.prototype.trigger = function(msg){
  this.scheduler.trigger(msg);
};
