var Scheduler = require('./Scheduler');

var LoopPool = Object.create(Scheduler);

LoopPool.new = function(name){
  var lp = Scheduler.new.call(this);
  lp.name = name;
  return lp;
};

module.exports = LoopPool;
