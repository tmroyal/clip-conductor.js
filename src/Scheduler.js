var _ = require('lodash');

var Scheduler = {

  new: function(){
    sched = Object.create(this);
    sched.subscriptions = [];
    sched.recognizedEvents = {};
    return sched;
  },

  observe: function(cb){
    this.subscriptions.push(cb); 
  },

  on: function(messageName, fileInfo){
    if (this.recognizedEvents[messageName]){
      this.recognizedEvents[messageName].push(fileInfo);
    } else {
      this.recognizedEvents[messageName] = [fileInfo];
    }
  },
  
  off: function(messageName, fileInfo){
    var events = this.recognizedEvents[messageName];
    if (fileInfo && events){
      for (var i = 0; i < events.length; i++){
        if (_.isEqual(fileInfo, events[i])){
          events.splice(i,1);
        }
      }
    }
  },

  trigger: function(messageName){
    var matches = this.recognizedEvents[messageName];
    if (matches){
      for (var match_i = 0; match_i < matches.length; match_i++){
        for (var sub_i = 0; 
              sub_i < this.subscriptions.length; sub_i++){
          this.subscriptions[sub_i](matches[match_i], 0);
        } 
      }
    }
  }
}

module.exports = Scheduler;
