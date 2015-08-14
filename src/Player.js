function Player(audioContext, scheduler, server){
  var self = this;
  this.server = server;
  this.sounds = {};
  this.audioContext = audioContext;
  scheduler.observe(this.playSound.bind(this));
}

Player.prototype.playSound = function(fileInfo, time){
  if (this.sounds[fileInfo.handle]){
    this.sounds[fileInfo.handle].start(time || 0);
  }
};

Player.prototype.loadFile = function(fileInfo, done, error){
  return this.server.loadFile(fileInfo.filename)

  .then(function(data){

    this.audioContext.decodeAudioData(data, function(buffer){

      this.sounds[fileInfo.handle] = 
        this.audioContext.createBufferSource();
      this.sounds[fileInfo.handle].buffer = buffer;
      this.sounds[fileInfo.handle]
          .connect(this.audioContext.destination);
      
      if (done){ done(); }

    }.bind(this), error);

  }.bind(this))

  .catch(error);
};

module.exports = Player;
