var Player;
var scheduler, audioContext, requestObject, player;

beforeEach(function(){
  Player = require('./Player');
});

describe('Player', function(){
  it('should observe scheduler', function(){
    scheduler = {
      observe: sinon.spy()
    }
    player = new Player(audioContext, scheduler, requestObject);

    scheduler.observe.called.should.be.true;
  });

  it('should call playSound callback', function(){
    var stub = sinon.stub(Player.prototype, 'playSound'); 

    scheduler = {
      observe: function(cb){
        this.subscription = cb;
      },
      test: function(){
        this.subscription('playSound');
      }
    };
    
    player = new Player(audioContext, scheduler, requestObject);

    scheduler.test();
   
    stub.called.should.be.true; 
    stub.calledWith('playSound').should.be.true;
      
  });

  it('should load given files');
  it('should call a success when files load');
  it('should call a fail callback when a file has failed to load');

  it('should call a callback indicating progression of file download');
});
