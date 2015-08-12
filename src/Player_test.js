var Player = require('./Player');
var scheduler, audioContext, requestObject, player;


describe('Player', function(){
  it('should observe scheduler', function(){
    scheduler = {
      observe: sinon.spy()
    }
    player = new Player(audioContext, scheduler, requestObject);

    scheduler.observe.called.should.be.true;
  });
  it('should play file at time specified by scheduler');

  it('should load given files');
  it('should call a success when files load');
  it('should call a fail callback when a file has failed to load');

  it('should call a callback indicating progression of file download');
});
