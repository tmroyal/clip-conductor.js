var Scheduler = require('./Scheduler');
var LoopPool = require('./LoopPool');

var loopPool;

var testSound, testRange;
var testSound2, testRange2;

var audioContext = { currentTime: 3 };


beforeEach(function(){
  loopPool = LoopPool.new('name', audioContext);
  loopPool.observe(function(){ return 2; });
  testSound = { handle: 'testSound', filename:'testSound.mp3'};
  testRange = { min: 0.1, max: 0.5};
  testSound2 = { handle: 'testSound2', filename:'testSound2.mp3'};
  testRange2 = { min: 0.6, max: 0.9};
});

describe('LoopPool', function(){

  describe('.new', function(){
    it('should inherit from scheduler', function(){
      var scheduler = Scheduler.new();
      for (prop in scheduler){
        if (scheduler.hasOwnProperty(prop)){
          loopPool.hasOwnProperty(prop).should.be.true;
        }
      }
    });

    it('should set name property', function(){
      loopPool = LoopPool.new('name');
      loopPool.name.should.equal('name');
    });

    it('should set audioContext', function(){
      loopPool.audioContext.should.equal(audioContext);
    });

  });

  describe('.addSound', function(){

    it('should add soundinfo to recognizedEvents object', function(){
      loopPool.addSound(testSound, testRange);
      loopPool.recognizedEvents.should.deep.equal(
        {'testSound':{sound:testSound, range:testRange}}
      );
    });

  });

  describe('.setSound', function(){
    it('should alias setSound', function(){
      LoopPool.addSound.should.equal(LoopPool.setSound);
    });
  });

  describe('.getSound', function(){

    beforeEach(function(){
      loopPool.addSound(testSound, testRange);
      loopPool.addSound(testSound2, testRange2);
    });

    it('should return the sound whose range encompasses value', 
      function(){
        var result = loopPool.getSound(0.2);
        result.should.deep.equal(testSound);
      }
    );

    it('should return sound whose range is nearest value if '+
       ' no range encompasses value', 
       function(){
         var result = loopPool.getSound(0.59);
         result.should.deep.equal(testSound2);
       }
    );

    it('should return undefined if pool is empty', function(){
      loopPool.recognizedEvents = {};
      expect(loopPool.getSound(0.2)).to.be.undefined;
    });

    it('should return a random matching value if mulitple'+
       ' sound ranges encompass value',
        function(){
          var testSound3 = { 
            handle: 'testSound3', 
            sound:'testSound3.mp3'
          };

          sinon.stub(Math, 'random').returns(0.75);

          loopPool.addSound(testSound3, testRange);
          loopPool.getSound(0.2).should.equal(testSound3);
        }
    );
  });

  describe('.removeSound', function(){
    it('should remove the sound', function(){
      loopPool.addSound(testSound, testRange);
      loopPool.removeSound(testSound);
      loopPool.recognizedEvents.should.deep.equal({});
    });
  });

  describe('.playSound', function(){
    it('should call to play sound immediately', function(){
      var subscription = sinon.spy(function(){ return 3;});
      loopPool = LoopPool.new('name', audioContext);
      loopPool.observe(subscription);

      loopPool.playing = true;
      loopPool.addSound(testSound, {min:0, max: 1});

      loopPool.playSound(0);
      subscription.args[0].should.deep.equal([testSound, 0]);
    });

    it('should call itself after duration given '+
        'by file scaled by buffer', 
      function(){
        var timeout = sinon.spy(window, 'setTimeout');
        var fb = sinon.spy(Function.prototype, 'bind');
        var subscription = function(){ return 3;};
        loopPool = LoopPool.new('name', audioContext);
        loopPool.observe(subscription);
        loopPool.addSound(testSound, testRange);
        loopPool.playing = true;

        loopPool.playSound(0);

        timeout.args[0][1].should.equal(3000);
        fb.args[0][1].should.equal(3);

        setTimeout.restore();
        Function.prototype.bind.restore();
      }
    );

    it('should not play a sound if it is stop has been called', 
      function(){
        var subscription = sinon.spy();
        loopPool = LoopPool.new('name', audioContext);
        loopPool.observe(subscription);
        loopPool.stop(); // playing=false
        loopPool.playSound(0);
        subscription.called.should.be.false;
      });
  });

  describe('.start', function(){
    it('should set playing to true', function(){
      loopPool.start();
      loopPool.playing.should.be.true;
    });

    it('should call playsound with currentTime+buffer',
      function(){
        var spy = sinon.spy(loopPool, 'playSound');
        loopPool.addSound(testSound, {min:0, max:1});
        loopPool.start();
        // 3 defined by test fixtures above + PADDING
        spy.calledWith(3.1).should.equal(true);
        loopPool.playSound.restore();
      }
    );

    it('should not play if there are no sounds in cue', function(){
      var subscription = sinon.spy();
      loopPool = LoopPool.new('name', audioContext);
      loopPool.observe(subscription);
      loopPool.playing = true;

      loopPool.playSound();
      subscription.called.should.be.false;
    });

    it('should set timeout to min duration if less than min duration',
      function(){
        var timeout = sinon.spy(window, 'setTimeout');
        var subscription = function(){ return 0; };
        loopPool = LoopPool.new('name', audioContext);
        loopPool.observe(subscription);
        loopPool.addSound(testSound, {min:0, max:1});
        loopPool.start();
        
        expect(timeout.args[0][1]).to.equal(10);
        // value should be about 10
        // = minduration*1000ms
        // = 0.01*1000
        
        setTimeout.restore(); 
      }
    );

    it('should throw if duration returns non number', function(){
      var subscription = function(){ return undefined; };
      loopPool = LoopPool.new('name', audioContext);
      loopPool.observe(subscription);
      loopPool.addSound(testSound, {min:0, max:1});
      expect(function(){ loopPool.start(); })
        .to.throw('LoopPool: duration must be a number');
        

    });

  });

  describe('.stop', function(){
    it('should set playing to false', function(){
      loopPool.stop();
      loopPool.playing.should.be.false;
    });
  });

  describe('.set', function(){
    it('should set current value', function(){
      loopPool.set(0.5);
      loopPool.value.should.equal(0.5);
    }); 
  });

});
