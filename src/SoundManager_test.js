var SoundManager = require('./SoundManager');
var scheduler, audioContext, server, manager;

beforeEach(function(){
  scheduler = {
    observe: function(){}
  }
});

describe('SoundManager', function(){
  describe('SoundManager()', function(){

    it('should set audio context and server', function(){
      var ac = {};
      var server = {};
      manager = new SoundManager(ac, server);
      manager.audioContext.should.equal(ac);
      manager.server.should.equal(server);
    });

    it('shold set sounds to empty obj', function(){
      manager.sounds.should.deep.equal({});
    });
  });

  describe('playSound', function(){
    it('should play the sound with given handle at spec time', 
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
        manager.sounds['testSound'] = {buffer:{duration: 3}, info:{}};

        manager.playSound('testSound', 3);
        
        returnObj.start.calledWith(3).should.be.true;
        returnObj.connect.calledWith(audioContext.destination)
            .should.be.true;

      }
    );

    it('should return buffer duration on playSound', function(){
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
      manager.sounds['testSound'] = {buffer:{duration: 3}, info:{}};

      manager.playSound('testSound')
        .should.equal(3);
    });

    it('should return soundinfo duration, if provided, on play',
      function(){
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
        manager.sounds['testSound'] = {
          buffer:{duration: 3},
          info: {duration: 2}
        };

        manager.playSound('testSound')
          .should.equal(2);
      }
    );

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
      manager.sounds['testSound'] = {buffer:{duration: 3}, info:{}};

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
      manager.sounds['testSound'] = {buffer:{duration: 3}, info:{}};

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
      
      console.warn.restore();
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
        decodeAudioData: function(data, succ){
          succ();
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
        
      manager = new SoundManager(audioContext, server);
      manager.loadFile(fileInfo);

      spy.calledWith(fileInfo.filename).should.be.true;
    });

    it('should call context.decodeAudioData', function(){
      var stub = sinon.stub(audioContext, 'decodeAudioData', 
        function(data, succ){
          succ();
        }
      );

      server.loadFile = function(fn){
        return new Promise(function(resolve){ 
          resolve('audio data'); 
        });
      };

      manager = new SoundManager(audioContext, server);
      return manager.loadFile(fileInfo).then(function(){ 
        audioContext.decodeAudioData.calledWith('audio data')
          .should.be.true;
      });
    });

    it('should store buffer on this.sounds',
      function(){
        var spy = sinon.spy();

        audioContext.decodeAudioData = function(data, cb){
          cb('the buffer');
        }

        manager = new SoundManager(audioContext, server);

        return manager.loadFile(fileInfo).then(function(){
          manager.sounds[fileInfo.handle]
            .should.deep.equal({
              buffer: 'the buffer',
              info: fileInfo
            });
        }); 
      }
    );

    it('should call done callback on success', function(){
      var spy = sinon.spy();
      manager = new SoundManager(audioContext, server);

      return manager.loadFile(fileInfo, spy).then(function(){
        spy.called.should.be.true;
      });

    });

    it('should call error callback on encoding error', function(){
      var spy = sinon.spy();

      audioContext.decodeAudioData = function(data, succ, er){
        er();
      };
      manager = new SoundManager(audioContext, server);

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

      manager = new SoundManager(audioContext, server);

      return manager.loadFile(fileInfo, null, spy).then(function(){
        spy.called.should.be.true;
      });

    });

    it('should raise error if fileInfo does not contain handle',
      function(){
        fileInfo = {filename: 'testFile.mp3'};
        manager = new SoundManager(audioContext, server);
        expect(function(){
          manager.loadFile(fileInfo);
        }).to.throw(
          'ClipConductor.SoundManager.loadFile:'+
          ' no valid file info provided'
        );
      }
    );

    it('should raise error if fileInfo does not contain filename',
      function(){
        fileInfo = {handle: 'testFile'};
        manager = new SoundManager(audioContext, server);
        expect(function(){
          manager.loadFile(fileInfo);
        }).to.throw(
          'ClipConductor.SoundManager.loadFile:'+
          ' no valid file info provided'
        );
      }
    );  
  });

  describe('verify', function(){
    it('should return true if sound is loaded', function(){
      manager = new SoundManager(audioContext, server);
      manager.sounds['test'] = {};
      manager.verify('test').should.be.true;
    });


    it('should return flase if sound is not loaded', function(){
      manager = new SoundManager(audioContext, server);
      manager.verify('test').should.be.false;
    });
  });
});
