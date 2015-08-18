var _ = require('lodash');

var Scheduler = function(triggerCB, verificationCB){
  this.triggerCB = triggerCB;
  this.verify = verificationCB || function(){ return true; };
  this.events = {};
};

Scheduler.prototype.on = function(messageName, handle){
  if (_.isObject(handle)){ handle = handle.handle; }

  if (!this.verify(handle)){
    throw new Error(
      'ClipConductor.Scheduler: cannot verify handle: '+handle
    );
  }

  if (this.events[messageName]){
    this.events[messageName].push(handle);
  } else {
    this.events[messageName] = [handle];
  }
};
  
Scheduler.prototype.off = function(messageName, fileInfo){
  var events = this.events[messageName];
  if (fileInfo && events){
    for (var i = 0; i < events.length; i++){
      if (_.isEqual(fileInfo, events[i])){
        events.splice(i,1);
      }
    }
  }
};

Scheduler.prototype.trigger = function(messageName){
  var matches = this.events[messageName];
  if (matches){
    for (var match_i = 0; match_i < matches.length; match_i++){
      this.triggerCB(matches[match_i], 0);
    }
  }
};

module.exports = Scheduler;
