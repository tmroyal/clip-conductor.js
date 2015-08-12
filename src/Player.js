function Player(audioContext, scheduler, requestObject){
  scheduler.observe(this.playSound);
}

Player.prototype.playSound = function(fileName){
  console.log(fileName);
};

module.exports = Player;
