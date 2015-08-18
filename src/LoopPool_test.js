var Scheduler = require('./Scheduler');
var LoopPool = require('./LoopPool');

var loopPool;

var testSound, testRange;
var testSound2, testRange2;
var nop = function(){ return true; };

beforeEach(function(){
  loopPool = new LoopPool('name', nop, nop, nop);

  testSound = 'testSound';
  testRange = { min: 0.1, max: 0.5};
  testSound2 = 'testSound2';
  testRange2 = { min: 0.6, max: 0.9};
});

describe('LoopPool', function(){

  describe('LoopPool()', function(){

    it('should set properties', function(){
      var v = function(){};
      var t = function(){};
      var time = function(){};

      loopPool = new LoopPool('name', v, t, time);
      loopPool.name.should.equal('name');
      loopPool.getTime.should.equal(time);
      loopPool.verify.should.equal(v);
      loopPool.trigger.should.equal(t);
      loopPool.value.should.equal(0);
      loopPool.events.should.deep.equal({});

    });

  });

  describe('.addSound', function(){

    it('should add soundinfo to recognizedEvents object', 
      function(){
        loopPool.addSound(testSound, testRange);
        loopPool.events.should.deep.equal(
          {'testSound':{sound:testSound, range:testRange}}
        );
      }
    );

    it('should add only handle if given file info', function(){
      var testSound = {handle: 'testSound'};
      loopPool.addSound(testSound, testRange);
      loopPool.events.should.deep.equal(
        {'testSound':{sound:testSound.handle, range:testRange}}
      );
    });

    it('should throw error if verify returns false', function(){
      var verify = function(){ return false; };
      loopPool = new LoopPool('name', verify);
      expect(function(){
        loopPool.addSound(testSound, testRange);
      }).to.throw(
        'ClipConductor.LoopPool: cannot verify handle: testSound'
      );
    });

  });

  describe('.setSound', function(){
    it('should alias setSound', function(){
      LoopPool.prototype.addSound.should.equal(
        LoopPool.prototype.setSound);
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
      loopPool.events = {};
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
          loopPool.getSound(0.2).should.equal('testSound3');
        }
    );
  });

  describe('.removeSound', function(){
    it('should remove the sound', function(){
      loopPool.addSound(testSound, testRange);
      loopPool.removeSound(testSound);
      loopPool.events.should.deep.equal({});
    });

    it('should remove sound if given file info', function(){
      var testSound = {handle:'testSound'};
      loopPool.addSound(testSound, testRange);
      loopPool.removeSound(testSound);
      loopPool.events.should.deep.equal({});
    });
  });

  describe('.playSound', function(){
    it('should call trigger immediately', function(){
      var trigger = sinon.spy(function(){ return 3;});
      loopPool = new LoopPool('name', nop, trigger, nop);

      loopPool.playing = true;
      loopPool.addSound(testSound, {min:0, max: 1});

      loopPool.playSound(0);
      trigger.args[0].should.deep.equal([testSound, 0]);
    });

    it('should call itself after duration given '+
        'by file scaled by buffer', 
      function(){
        var timeout = sinon.spy(window, 'setTimeout');
        var fb = sinon.spy(Function.prototype, 'bind');
        var trigger = function(){ return 3;};
        loopPool = new LoopPool('name', nop, trigger, nop);
        loopPool.addSound(testSound, testRange);
        loopPool.playing = true;

        loopPool.playSound(0);

        timeout.args[0][1].should.equal(3000);
        fb.args[0][1].should.equal(3);

        setTimeout.restore();
        Function.prototype.bind.restore();
      }
    );

    it('should not trigger if stop has been called', 
      function(){
        var trigger = sinon.spy();
        loopPool = new LoopPool('name', nop, trigger, nop);
        loopPool.stop(); // playing=false
        loopPool.playSound(0);
        trigger.called.should.be.false;
      });
  });

  describe('.start', function(){
    it('should set playing to true', function(){
      loopPool.start();
      loopPool.playing.should.be.true;
    });

    it('should call playsound with currentTime+buffer',
      function(){
        var getTime = trigger = function(){return 3;};
        
        loopPool = new LoopPool('name', nop, trigger, getTime);
        var spy = sinon.spy(loopPool, 'playSound');
        loopPool.addSound(testSound, {min:0, max:1});
        loopPool.start();
        // 3.1 = getTime()+BUFFER
        spy.calledWith(3.1).should.equal(true);
        loopPool.playSound.restore();
      }
    );

    it('should not play if there are no sounds in cue', function(){
      var trigger = sinon.spy();
      loopPool = new LoopPool('name', nop, trigger, nop);
      loopPool.playing = true;
      loopPool.playSound();

      trigger.called.should.be.false;
    });

    it('should set timeout to min duration if less than min duration',
      function(){
        var timeout = sinon.spy(window, 'setTimeout');
        var trigger = function(){ return 0; };
        loopPool = new LoopPool('name', nop, trigger, nop);
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
      var trigger = function(){ return undefined; };
      loopPool = new LoopPool('name', nop, trigger, nop);
      loopPool.addSound(testSound, {min:0, max:1});
      expect(function(){ loopPool.start(); })
        .to.throw('ClipConductor.LoopPool: duration must be a number');
        

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
