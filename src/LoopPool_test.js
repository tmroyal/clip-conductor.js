var Scheduler = require('./Scheduler');
var LoopPool = require('./LoopPool');

var loopPool;

var testSound, testRange;
var testSound2, testRange2;


beforeEach(function(){
  loopPool = LoopPool.new('name');
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
         console.log(result, testSound);
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

});
