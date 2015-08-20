var ClipConductor = require('./main');
var cc;
var Server = require('./Server');
var SoundManager = require('./SoundManager'); 
var Scheduler = require('./Scheduler');
var LoopPool = require('./LoopPool');
var nop = function(){};

// to prevent making more than 6 bound AudioContext's
window.AudioContext = function(){
  this.currentTime = 0;
};

describe('ClipConductor', function(){
  describe('ClipConductor()', function(){

    it('should create empty pools object', function(){
      cc = new ClipConductor();
      cc.pools.should.deep.equal({});
    });

    it('should create getTime function', function(){
      cc = new ClipConductor();
      cc.getTime().should.equal(0); // per stub above
    });

    it('should create provided dependencies', function(){
      var acSpy = sinon.spy(window, 'AudioContext');

      var dependencies = {
        AudioContext: {},
        Server: sinon.spy(),
        SoundManager: sinon.stub().returns({
          playSound: function(){},
          verify: function(){}
        }),
        Scheduler: sinon.spy(),
        LoopPool: {}
      };

      cc = new ClipConductor(dependencies);

      dependencies.Server.calledWithNew().should.be.true;
      dependencies.SoundManager.calledWithNew().should.be.true;
      dependencies.Scheduler.calledWithNew().should.be.true;
      acSpy.calledWithNew().should.be.false;

      cc.LoopPool.should.equal(dependencies.LoopPool);

      AudioContext.restore();
    }); 
    
    it('should set LoopPool to LoopPool modules, if not provided',
      function(){
        cc = new ClipConductor();
        // potentially problematic who is to say that newer 
        // paradigms established for require() will not break this
        cc.LoopPool.should.equal(LoopPool); 
      }
    );

    it('should create new AudioContext if none provided',
      function(){
        // very bad, but only way to support 
        // native object without rewriting code to
        // be explicitly testable
        
        var oldAC = AudioContext;
        AudioContext = sinon.spy();

        var dependencies = {
          Server: nop,
          SoundManager: function(){
            this.playSound = nop;
            this.verify = nop;
          },
          Scheduler: nop
        }

        cc = new ClipConductor(dependencies);

        AudioContext.calledWithNew().should.be.true;
        
        AudioContext = oldAC;
        expect(AudioContext.called).to.be.undefined;
      }
    );

    it('should create new Server if none provided', function(){
      cc = new ClipConductor();
      cc.server.should.be.an.instanceOf(Server);
    });

    it('should create new SoundManager if none provided', function(){
      cc = new ClipConductor();
      cc.soundManager.should.be.an.instanceOf(SoundManager);
    });

    it('should create new Scheduler if none provided', function(){
      cc = new ClipConductor();
      cc.scheduler.should.be.an.instanceOf(Scheduler);
    });

    it('should not throw error when no args provided', function(){
      expect(function(){
        cc = new ClipConductor();
      }).to.not.throw();
    });

    it('should call sound manager with audioContext and server',
      function(){
        var server = 'server'

        var stub = sinon.stub().returns({
          playSound: nop,
          verify: nop
        });

        var deps = {
          AudioContext: '',
          Server: function(){
          },
          SoundManager: stub
        }; 

        cc = new ClipConductor(deps);
        
        stub.calledWith(deps.AudioContext).should.equal.true;
        stub.args[0][1].should.be.instanceOf(deps.Server);
      }
    );

    it('should create scheduler using methods from soundManager', 
      function(){
        // https://en.wikipedia.org/wiki/Amorphophallus_titanum

        var deps = {
          Scheduler: function(trigger, verify){
            trigger.should.equal('playSound.bind');
            verify.should.equal('verify.bind');
          },
          SoundManager: function(){}
        };

        deps.SoundManager.prototype.playSound = { 
          bind: sinon.stub().returns('playSound.bind')
        };

        deps.SoundManager.prototype.verify = {
          bind: sinon.stub().returns('verify.bind')
        };

        cc = new ClipConductor(deps);

        expect(deps.SoundManager.prototype.playSound.bind.args[0][0])
          .to.be.instanceOf(deps.SoundManager);
        expect(deps.SoundManager.prototype.verify.bind.args[0][0])
          .to.be.instanceOf(deps.SoundManager);
      }
    );

  });

  describe('addSound()', function(){
    beforeEach(function(){
      cc = new ClipConductor();
    });

    it('should call soundManager.loadFile with soundinfo', function(){
      var spy = sinon.spy(cc.soundManager, 'loadFile');
      var testInfo = {
        handle: 'test',
        filename: 'test.mp3'
      };
      cc.addSound('test', testInfo);
      spy.calledWith(testInfo).should.be.true;

      cc.soundManager.loadFile.restore();
    });

    it('should call scheduler.on with msg and soundinfo', function(){
      var spy = sinon.spy(cc.scheduler,'on');
      var stub = sinon.stub(cc.soundManager,'loadFile', function(){
        return new Promise(function(resolve){
          resolve();
        });
      });
      var testInfo = {
        handle: 'test',
        filename: 'test.mp3'
      };
      return cc.addSound('test', testInfo).then(function(){
        spy.args[0].should.deep.equal(['test', testInfo]);
        cc.scheduler.on.restore(); 
        cc.soundManager.loadFile.restore(); 
      });

    });

    it('should log error if there was a problem', function(){
      var stub = sinon.stub(cc.soundManager,'loadFile', function(){
        return new Promise(function(resolve,reject){
          reject();
        });
      });

      var spy = sinon.spy(console,'error');

      var testInfo = {
        handle: 'test',
        filename: 'test.mp3'
      };

      return cc.addSound('test', testInfo).then(function(){
        spy.calledWith(
          'ClipConductor.addSound: there was a problem loading test.mp3'
        ).should.equal(true);
        console.error.restore();
        cc.soundManager.loadFile.restore();
      });
    });
  });

  describe('loadSound()', function(){
    it('should call manager.loadFile', function(){
      cc = new ClipConductor();
      var spy = sinon.spy(cc.soundManager, 'loadFile');
      var testInfo = {
        handle: 'test',
        filename: 'test.mp3'
      };
      cc.loadSound(testInfo);
      spy.calledWith(testInfo).should.be.true;
      cc.soundManager.loadFile.restore();

    });

    it('should log error if soundManger rejects', function(){
      cc = new ClipConductor();
      var stub = sinon.stub(cc.soundManager,'loadFile', function(){
        return new Promise(function(resolve,reject){
          reject();
        });
      });

      var spy = sinon.spy(console,'error');

      var testInfo = {
        handle: 'test',
        filename: 'test.mp3'
      };

      return cc.loadSound(testInfo).then(function(){
        spy.calledWith(
          'ClipConductor.addSound: there was a problem loading test.mp3'
        ).should.equal(true);
        console.error.restore();
        cc.soundManager.loadFile.restore();
      });
      
    });
  });

  describe('trigger()', function(){
    it('should call scheduler with message and 0', function(){
      cc = new ClipConductor();
      var spy = sinon.spy(cc.scheduler, 'trigger');
      cc.trigger('test');
      spy.calledWith('test', 0).should.be.true;
      cc.scheduler.trigger.restore();
    });
  });

  describe('createPool()', function(){
    it('should create pool and add it to pools object', function(){
      cc = new ClipConductor();
      cc.createPool('test');
      cc.pools.test.should.be.an.instanceOf(LoopPool);
      cc.pools.test.name.should.equal('test');
    });

    it('should create pool with methods form soundManager', 
      function(){
        // https://en.wikipedia.org/wiki/Rafflesia_arnoldii
        var deps = {
          LoopPool: sinon.spy(),
          SoundManager: function(){}
        };

        deps.SoundManager.prototype.playSound = { 
          bind: sinon.stub().returns('playSound.bind')
        };

        deps.SoundManager.prototype.verify = {
          bind: sinon.stub().returns('verify.bind')
        };

        cc = new ClipConductor(deps);
        cc.getTime = {
          bind: sinon.stub().returns('getTime')
        };
         
        cc.createPool('test pool');

        deps.LoopPool.calledWithNew().should.be.true;
        deps.LoopPool.args[0].should.deep.equal(
          [
            'test pool',
            'verify.bind',
            'playSound.bind',
            'getTime'
          ]
        );

        expect(deps.SoundManager.prototype.playSound.bind.args[1][0])
          .to.be.instanceOf(deps.SoundManager);
        expect(deps.SoundManager.prototype.verify.bind.args[1][0])
          .to.be.instanceOf(deps.SoundManager);
        cc.getTime.bind.calledWith(cc).should.be.true;
      }
    );
    it('should return the created pool', function(){
      cc = new ClipConductor();
      cc.createPool('test').should.be.an.instanceOf(LoopPool);
    });

    it('should not overwrite existing pools', function(){
      var spy = sinon.spy(console, 'warn');

      cc = new ClipConductor();
      var pool1 = cc.createPool('test');
      var pool2 = cc.createPool('test');

      pool1.should.equal(pool2);
      spy.calledWith(
        'ClipConductor.createPool: pool "test" already exists'
      ).should.be.true;

      console.warn.restore();

    });
  });

  describe('pool()', function(){
    it('should return pool if it exists', function(){
      cc = new ClipConductor();
      cc.createPool('test');
      cc.pool('test').should.equal(cc.pools['test']);   
    });

    it('should return undefined if pool does not exist', function(){
      cc = new ClipConductor();
      expect(cc.pool('nonexistant')).to.be.undefined;
    });
  });

  describe('triggerPool()', function(){
    it('should set value at pool provided by string', function(){
      cc = new ClipConductor();
      cc.createPool('test');
      cc.triggerPool('test', 100);
      cc.pools['test'].value.should.equal(100);
    });

    it('should log warning if pool not found', function(){
      var spy = sinon.spy(console, 'warn');
      cc = new ClipConductor();
      cc.triggerPool('test', 100);
      spy.calledWith('ClipConductor.triggerPool: no pool named test')
        .should.be.true;

      console.warn.restore();
    });

    it('should error if value not a number', function(){
      cc = new ClipConductor();
      expect(function(){
        cc.triggerPool('test');
      }).to.throw(
        'ClipConductor.triggerPool'+
        ': must be called with numeric value' 
      );
    });
  });
});

