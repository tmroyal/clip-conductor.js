var SoundManager = require('./SoundManager');
var scheduler, audioContext, server, manager;

beforeEach(function(){
  scheduler = {
    observe: function(){}
  }
});

describe('SoundManager', function(){
  describe('SoundManager()', function(){
    it('should set audio context');
    it('should set server');
    it('shold set sounds to empty obj');
  });

  describe('playSound', function(){
    it.only('should play the sound with given handle at spec time', 
      function(){
        var returnObj = {
          start: sinon.spy(),
          connect: sinon.spy()
        };

        var audioContext = {
          createBufferSource: function(){
            return returnObj;
          },
          destination: 'acd'
        };

        manager = new SoundManager(audioContext, scheduler, server);
        manager.sounds['testSound'] = {buffer:{duration: 3}};

        manager.playSound('testSound', 3);
        
        returnObj.start.calledWith(3).should.be.true;
        returnObj.connect.calledWith(audioContext.destination)
            .should.be.true;

      }
    );

    it('should return duration on playSound', function(){
      var audioContext = {
        createBufferSource: function(){
          return { 
            connect: function(){},
            start: function(){},
          };
        },
        destination: 'audio context destination'
      };
      manager = new SoundManager(audioContext, scheduler, server);
      manager.sounds['testSound'] = {buffer:{duration: 3}};

      manager.playSound('testSound')
        .should.equal(3);
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

      manager = new SoundManager(audioContext, scheduler, server);
      manager.sounds['testSound'] = {buffer:{duration: 3}};

      manager.playSound('testSound');
      
      returnObj.start.calledWith(0).should.be.true;
        
    });

    it('should play no sound if handle does not exist', function(){
      var returnObj = {
        start: sinon.spy(),
        connect: function(){}
      };

      var audioContext = {
        createBufferSource: function(){
          return returnObj;
        }
      };

      manager = new SoundManager(audioContext, scheduler, server);
      manager.playSound('testSound');
      
      returnObj.start.called.should.be.false;
      
    });

    it('should play sound from file info if given', function(){
      var returnObj = {
        start: sinon.spy(),
        connect: sinon.spy()
      };

      var audioContext = {
        createBufferSource: function(){
          return returnObj;
        },
        destination: 'acd'
      };

      manager = new SoundManager(audioContext, scheduler, server);
      manager.sounds['testSound'] = {buffer:{duration: 3}};

      manager.playSound({handle: 'testSound'});
      
      returnObj.start.calledWith(0).should.be.true;
      returnObj.connect.calledWith(audioContext.destination)
          .should.be.true;
    });

    it('should warn when no matching sound', function(){
      var spy = sinon.spy(console, 'warn');
      manager = new SoundManager(audioContext, scheduler, server);
      manager.playSound('testSound');

      spy.calledWith(
        'ClipConductor.SoundManager: cannot find sound: testSound'
      ).should.be.true;
      
    });

  });

  describe('loadFile',function(){
    var fileInfo, audioContext, server, manager;
    
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

        
      manager = SoundManager.new(audioContext, scheduler, server);
      manager.loadFile(fileInfo);

      spy.calledWith(fileInfo.filename).should.be.true;
    });

    it('should call context.decodeAudioData', function(){
      audioContext.decodeAudioData = sinon.spy();

      server.loadFile = function(fn){
        return new Promise(function(resolve){ 
          resolve('audio data'); 
        });
      };

      manager = SoundManager.new(audioContext, scheduler, server);
      return manager.loadFile(fileInfo).then(function(){ 
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

        manager = SoundManager.new(audioContext, scheduler, server);

        return manager.loadFile(fileInfo).then(function(){
          manager.sounds[fileInfo.handle]
            .should.equal('the buffer');
        }); 
      }
    );

    it('should call done callback on success', function(){
      var spy = sinon.spy();
      manager = SoundManager.new(audioContext, scheduler, server);

      return manager.loadFile(fileInfo, spy).then(function(){
        spy.called.should.be.true;
      });

    });

    it('should call error callback on encoding error', function(){
      var spy = sinon.spy();

      audioContext.decodeAudioData = function(data, succ, er){
        er();
      };
      manager = SoundManager.new(audioContext, scheduler, server);

      return manager.loadFile(fileInfo, null, spy).then(function(){
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

      manager = SoundManager.new(audioContext, scheduler, server);

      return manager.loadFile(fileInfo, null, spy).then(function(){
        spy.called.should.be.true;
      });

    });

    
  });
});
