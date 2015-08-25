var _ = require('lodash');

/**
 * Triggers callbacks in response to messages,
 * with optional verificaton.
 * @class
 *
 * @param {triggerCB} triggerCB callback called when Scheduler.trigger is called.
 * @param {verificationCB} [verificationCB] Scheduler.on can optionally be asked to 
 *        verify whether to setup an event binding based on whatever conditions are neccesary.
 */

/**
 * Callback used as scheduler trigger 
 * @callback triggerCB
 * @param {String} handle Text usually used for identification purposes
 * @param {Number} time A number usually used to represent time
 */

/**
 * Callback used to verify whether message can be initiated.
 * @callback verificationCB
 * @param {String} handle Text usually used for identification purposes. 
 *        Should be the same as the triggerCB handle parameter.
 *
 * @returns {Boolean} Whether handle is verified or not.
 */

var Scheduler = function(triggerCB, verificationCB){
  this.triggerCB = triggerCB;
  this.verify = verificationCB || function(){ return true; };
  // Object containing arrays of handles to be 
  // used as the argument to triggerCB when Scheduler.trigger
  // is called.
  this.events = {};
};

/**
 * Attaches a handle to a messageName, with optional verification. 
 * Multiple handles can be attached to a single messageName.
 * Creates a new key on Scheduler.events if it doesn't exist.
 * @method on
 *
 * @param {String} messageName the name of the event 
 * @param {String} handle the handle to attach the event
 */
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
  
/**
 * Dissassociates handle from event. Does not remove
 * key from Scheduler.events
 * @method off
 *
 * @param {String} messageName The event name.
 * @param {String} handle The handle to dissaccociate from event.
 */
Scheduler.prototype.off = function(messageName, handle){
  var events = this.events[messageName];
  if (handle && events){
    for (var i = 0; i < events.length; i++){
      if (_.isEqual(handle, events[i])){
        events.splice(i,1);
      }
    }
  }
};

/**
 * Triggers all handles associated with message
 * @method trigger
 *
 * @param {String} the message name
 */
Scheduler.prototype.trigger = function(messageName){
  var matches = this.events[messageName];
  if (matches){
    for (var match_i = 0; match_i < matches.length; match_i++){
      this.triggerCB(matches[match_i], 0);
    }
  }
};

module.exports = Scheduler;
