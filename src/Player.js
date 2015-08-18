var Player = {
  new: function(audioContext, scheduler, server){
    var player = Object.create(this);
    player.server = server;
    player.sounds = {};
    player.audioContext = audioContext;
    scheduler.observe(player.playSound.bind(player));

    return player;
  }, 

  playSound: function(fileInfo, time){
    if (this.sounds[fileInfo.handle]){
      var sound = this.audioContext.createBufferSource();
      sound.buffer = this.sounds[fileInfo.handle];
      sound.connect(this.audioContext.destination);
      sound.start(time || 0);

      return sound.buffer.duration;
    }
  },

  loadFile: function(fileInfo, done, error){
    return this.server.loadFile(fileInfo.filename)

    .then(function(data){

      this.audioContext.decodeAudioData(data, function(buffer){

        this.sounds[fileInfo.handle] = buffer;

        if (done){ done(); }

      }.bind(this), error);

    }.bind(this))

    .catch(error);
  }
};

module.exports = Player;
