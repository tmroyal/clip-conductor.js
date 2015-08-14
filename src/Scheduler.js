var _ = require('lodash');

function Scheduler(){
  this.subscriptions = [];
  this.recognizedEvents = {};
}

Scheduler.prototype.observe = function(cb){
  this.subscriptions.push(cb);
};

Scheduler.prototype.on = function(messageName, fileInfo){
  if (this.recognizedEvents[messageName]){
    this.recognizedEvents[messageName].push(fileInfo);
  } else {
    this.recognizedEvents[messageName] = [fileInfo];
  }
};

Scheduler.prototype.off = function(messageName, fileInfo){
  var events = this.recognizedEvents[messageName];
  if (fileInfo && events){
    for (var i = 0; i < events.length; i++){
      if (_.isEqual(fileInfo, events[i])){
        events.splice(i,1);
      }
    }
  }
};

Scheduler.prototype.trigger = function(messageName){
  var matches = this.recognizedEvents[messageName];
  if (matches){
    for (var match_i = 0; match_i < matches.length; match_i++){
      for (var sub_i = 0; sub_i < this.subscriptions.length; sub_i++){
        this.subscriptions[sub_i](matches[match_i]);
      } 
    }
  }
};

module.exports = Scheduler;
