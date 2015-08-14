var Player = require('./Player');
var scheduler, audioContext, server, player;

beforeEach(function(){
  scheduler = {
    observe: function(){}
  }
});

describe('Player', function(){

  describe('new Player()', function(){
    it('should observe scheduler', function(){
      scheduler = {
        observe: sinon.spy()
      }
      player = new Player(audioContext, scheduler, server);

      scheduler.observe.called.should.be.true;
    });

    it('should play sound on scheduler event', function(){
      var returnObj = {
        connect: sinon.spy(),
        start: sinon.spy()
      };

      var audioContext = {
        createBufferSource: function(){
          return returnObj;
        },
        destination: 'audio context destination'
      };

      var fileInfo = { handle: 'testSound' };

      scheduler = {
        observe: function(cb){
          this.subscription = cb;
        },
        test: function(){
          this.subscription(fileInfo, 3);
        }
      };
      
      player = new Player(audioContext, scheduler, server);
      player.sounds['testSound'] = 'the buffer';
      
      scheduler.test();
      console.log(returnObj);
      returnObj.buffer.should.equal('the buffer');
      returnObj.connect.calledWith(audioContext.destination)
        .should.be.true;
      returnObj.start.calledWith(3).should.be.true;
    });

    it('should set time of zero if no other value provided', function(){
      var returnObj = {
        start: sinon.spy(),
        connect: function(){}
      };

      var audioContext = {
        createBufferSource: function(){
          return returnObj;
        }
      };

      var fileInfo = { handle: 'testSound' };

      scheduler = {
        observe: function(cb){
          this.subscription = cb;
        },
        test: function(){
          this.subscription(fileInfo);
        }
      };
      
      player = new Player(audioContext, scheduler, server);
      player.sounds['testSound'] = 'the buffer';
      
      scheduler.test();
     
      returnObj.start.calledWith(0).should.be.true;
        
    });
  });

  describe('loadFile',function(){
    var fileInfo, audioContext, server, player;
    
    beforeEach(function(){
      fileInfo = {
        filename: 'test.mp3',
        handle: 'test'
      };

      audioContext = {
        decodeAudioData: function(data, cb){
          cb(); 
        },
        createBufferSource: function(){
          return {
            connect: function(destination){
            }
          }
        },
        destination: 'audio context destination'
      };

      server = {
        loadFile: function(fn){
          return new Promise(function(resolve){ 
            resolve('audio data');
          });
        }
      };
    });

    it('should call server.loadfile with fn', function(){
      var spy = sinon.spy();

      server.loadFile = function(fn){
        spy(fn);
        return new Promise(function(){});
      };

        
      player = new Player(audioContext, scheduler, server);
      player.loadFile(fileInfo);

      spy.calledWith(fileInfo.filename).should.be.true;
    });

    it('should call context.decodeAudioData', function(){
      audioContext.decodeAudioData = sinon.spy();

      server.loadFile = function(fn){
        return new Promise(function(resolve){ 
          resolve('audio data'); 
        });
      };

      player = new Player(audioContext, scheduler, server);
      return player.loadFile(fileInfo).then(function(){ 
        audioContext.decodeAudioData.calledWith('audio data')
          .should.be.true;
      });
    });

    it('should create and connect buffer stored on this.sounds',
      function(){
        var spy = sinon.spy();

        audioContext.decodeAudioData = function(data, cb){
          cb('the buffer');
        }

        player = new Player(audioContext, scheduler, server);

        return player.loadFile(fileInfo).then(function(){
          player.sounds[fileInfo.handle]
            .should.equal('the buffer');
        }); 
      }
    );

    it('should call done callback on success', function(){
      var spy = sinon.spy();
      player = new Player(audioContext, scheduler, server);

      return player.loadFile(fileInfo, spy).then(function(){
        spy.called.should.be.true;
      });

    });

    it('should call error callback on encoding error', function(){
      var spy = sinon.spy();

      audioContext.decodeAudioData = function(data, succ, er){
        er();
      };
      player = new Player(audioContext, scheduler, server);

      return player.loadFile(fileInfo, null, spy).then(function(){
        spy.called.should.be.true;
      });
    });

    it('should call error callback on network error', function(){
      var spy = sinon.spy();

      server.loadFile = function(fn){
        return new Promise(function(resolve, reject){
          reject();
        });
      };

      player = new Player(audioContext, scheduler, server);

      return player.loadFile(fileInfo, null, spy).then(function(){
        spy.called.should.be.true;
      });

    });

    
  });
});
