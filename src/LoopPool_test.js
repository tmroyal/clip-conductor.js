var Scheduler = require('./Scheduler');
var LoopPool = require('./LoopPool');

var loopPool;

beforeEach(function(){
  loopPool = LoopPool.new();
});

describe('LoopPool', function(){
  it('should inherit from scheduler', function(){
    var scheduler = Scheduler.new();
    for (prop in scheduler){
      if (scheduler.hasOwnProperty(prop)){
        loopPool.hasOwnProperty(prop).should.be.true;
      }
    }
  });
});
